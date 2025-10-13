#!/bin/bash

# The following environment variables are expected to be set:
#  GITHUB_BRANCH
#  PULL_REQUEST
#  SONAR_HOST_URL
#  SONARQUBE_NEXT_URL
#  SONAR_TOKEN
#  SONARQUBE_NEXT_TOKEN
#  PROJECT_KEY
#  ORGANIZATION
#  WAIT_FOR_QUALITY_GATE

# The following are Github Actions default environment variables:
#  GITHUB_SHA
#  GITHUB_BASE_REF
#  GITHUB_REPOSITORY

set -euo pipefail

export SONAR_HOST_URL=${SONAR_HOST_URL:-$SONARQUBE_NEXT_URL}
export SONAR_TOKEN=${SONAR_TOKEN:-$SONARQUBE_NEXT_TOKEN}
export PROJECT_KEY=${PROJECT_KEY:-SonarSource_sonarcloud-webapp}
export ORGANIZATION=${ORGANIZATION:-}
export WAIT_FOR_QUALITY_GATE=${WAIT_FOR_QUALITY_GATE:-false}

echo "[DEBUG] GITHUB_SHA: ${GITHUB_SHA}"
echo "[DEBUG] GITHUB_BASE_REF: ${GITHUB_BASE_REF}"
echo "[DEBUG] GITHUB_BRANCH: ${GITHUB_BRANCH}"
echo "[DEBUG] GITHUB_REPOSITORY: ${GITHUB_REPOSITORY}"
echo "[DEBUG] PULL_REQUEST: ${PULL_REQUEST}"
echo "[DEBUG] SONAR_HOST_URL: ${SONAR_HOST_URL}"
echo "[DEBUG] PROJECT_KEY: ${PROJECT_KEY}"
echo "[DEBUG] ORGANIZATION: ${ORGANIZATION}"
echo "[DEBUG] WAIT_FOR_QUALITY_GATE: ${WAIT_FOR_QUALITY_GATE}"

echo "[DEBUG] Entering main conditional: PULL_REQUEST='${PULL_REQUEST}', GITHUB_BRANCH='${GITHUB_BRANCH}'"
if [[ "${PULL_REQUEST}" ]] || [[ "${GITHUB_BRANCH}" == "master" ]]; then

  scanner_params=()

  if [[ "${GITHUB_BASE_REF}" ]]; then
    git fetch origin "${GITHUB_BASE_REF}"
  fi

  if [[ "${WAIT_FOR_QUALITY_GATE}" == "true" ]] && [[ "${GITHUB_BRANCH}" == "master" ]]; then
    scanner_params+=("-Dsonar.qualitygate.wait=true")
  fi

  if [[ "${PULL_REQUEST}" ]]; then
    scanner_params+=("-Dsonar.analysis.prNumber=${PULL_REQUEST}")
  fi

  if [[ "${ORGANIZATION}" ]]; then
    scanner_params+=("-Dsonar.organization=${ORGANIZATION}")
  fi

  ESLINT_REPORT_PATH=$(find build/reports/ -name eslint-report.json -type f | paste -sd ',')

  scanner_params+=(
    "-Dsonar.projectName=SonarQube Cloud Webapp"
    "-Dsonar.host.url=${SONAR_HOST_URL}"
    "-Dsonar.token=${SONAR_TOKEN}"
    "-Dsonar.analysis.pipeline=${GITHUB_RUN_ID}"
    "-Dsonar.analysis.repository=${GITHUB_REPOSITORY}"
    "-Dsonar.analysis.sha1=${GITHUB_SHA}"
    "-Dsonar.projectKey=${PROJECT_KEY}"
    "-Dsonar.eslint.reportPaths=${ESLINT_REPORT_PATH}"
    "-Dsonar.python.version=3"
    "-Dsonar.python.coverage.reportPaths=build/reports/static-handler/build/coverage.xml,build/reports/webapp-assets-platform/build/coverage.xml"
    "-Dsonar.javascript.lcov.reportPaths=build/reports/coverage/lcov.info"
    "-Dsonar.sources=private/apps/sq-cloud/,libs/,private/libs/,private/sq-cloud-assets/,private/sq-cloud-e2e-tests/"
    "-Dsonar.inclusions=**/src/**"
    "-Dsonar.exclusions=**/sq-server*/**,
                        **/tests/**,
                        **/__tests__/**,
                        **/config/theme/**,
                        **/config/jest/**,
                        **/*-e2e-tests/resources/**"
    "-Dsonar.cpd.exclusions=**/src/api/mocks-v2/**,
                            **/src/**/*Legacy.*"
    "-Dsonar.sca.exclusions=tools/nx-automation/**"
    "-Dsonar.tests=private/apps/sq-cloud/,libs/,private/libs/,private/sq-cloud-assets/,private/sq-cloud-e2e-tests"
    "-Dsonar.test.inclusions=**/tests/**,**/__tests__/**"
    "-Dsonar.test.exclusions=**/sq-server*/**"
    "-Dsonar.coverage.exclusions=**/__mocks__/**,
                                **/config/**,
                                **/*.js,
                                **/vite.config.ts,
                                **/*-e2e-tests/**,
                                **/@types/**,
                                **/components/icons/**,
                                **/components/visual-components/**,
                                **/helpers/mocks/**,
                                **/sonar-aligned/helpers/mocks/**,
                                **/api/**,
                                **/routes.ts,
                                **/pages/**,
                                **/app/WebApp.tsx,
                                **/app/index-scripts/*,
                                **/helpers/testUtils.tsx,
                                **/helpers/testMocks.ts,
                                **/helpers/keyboard.ts,
                                **/helpers/cookies.ts,
                                **/*Legacy.*")

  echo "[DEBUG] Running sonar-scanner with params: ${scanner_params[*]}"
  yarn run sonar-scanner "${scanner_params[@]}"
else
  echo "[DEBUG] Skipping scan: neither PULL_REQUEST nor GITHUB_BRANCH=master."
fi
