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
#  VERSION

# The following are Github Actions default environment variables:
#  GITHUB_SHA
#  GITHUB_BASE_REF
#  GITHUB_REPOSITORY
#  GITHUB_RUN_ID

set -euo pipefail

export SONAR_HOST_URL=${SONAR_HOST_URL:-$SONARQUBE_NEXT_URL}
export SONAR_TOKEN=${SONAR_TOKEN:-$SONARQUBE_NEXT_TOKEN}
export PROJECT_KEY=${PROJECT_KEY:-SonarSource_sonarqube-server-webapp}
export ORGANIZATION=${ORGANIZATION:-}

echo "[DEBUG] GITHUB_SHA: ${GITHUB_SHA}"
echo "[DEBUG] GITHUB_BASE_REF: ${GITHUB_BASE_REF}"
echo "[DEBUG] GITHUB_BRANCH: ${GITHUB_BRANCH}"
echo "[DEBUG] GITHUB_REPOSITORY: ${GITHUB_REPOSITORY}"
echo "[DEBUG] PULL_REQUEST: ${PULL_REQUEST}"
echo "[DEBUG] SONAR_HOST_URL: ${SONAR_HOST_URL}"
echo "[DEBUG] PROJECT_KEY: ${PROJECT_KEY}"
echo "[DEBUG] ORGANIZATION: ${ORGANIZATION}"

echo "[DEBUG] Entering main conditional: PULL_REQUEST='${PULL_REQUEST}', GITHUB_BRANCH='${GITHUB_BRANCH}'"
if [[ "${PULL_REQUEST}" ]] || [[ "${GITHUB_BRANCH}" == "master" ]] || [[ "${GITHUB_BRANCH}" == "branch-sqs-"* ]]; then

  scanner_params=()

  if [[ "${GITHUB_BASE_REF}" ]]; then
    git fetch origin "${GITHUB_BASE_REF}"
  fi

  if [[ "${PULL_REQUEST}" ]]; then
    scanner_params+=("-Dsonar.analysis.prNumber=${PULL_REQUEST}")
  fi

  if [[ "${ORGANIZATION}" ]]; then
    scanner_params+=("-Dsonar.organization=${ORGANIZATION}")
  fi

  if [[ "$SONAR_HOST_URL" == *"sonarqube.us"* ]]; then
    scanner_params+=("-Dsonar.region=US")
  fi

  ESLINT_REPORT_PATH=$(find build/reports/ -name eslint-report.json -type f | paste -sd ',')

  scanner_params+=(
    "-Dsonar.projectKey=${PROJECT_KEY}"
    "-Dsonar.projectName=SonarQube Server Webapp"
    "-Dsonar.projectVersion=${VERSION}"
    "-Dsonar.host.url=${SONAR_HOST_URL}"
    "-Dsonar.token=${SONAR_TOKEN}"
    "-Dsonar.analysis.pipeline=${GITHUB_RUN_ID}"
    "-Dsonar.analysis.repository=${GITHUB_REPOSITORY}"
    "-Dsonar.analysis.sha1=${GITHUB_SHA}"
    "-Dsonar.eslint.reportPaths=${ESLINT_REPORT_PATH}"
    "-Dsonar.javascript.lcov.reportPaths=build/reports/coverage/lcov.info"
    "-Dsonar.sources=apps/sq-server/,libs/,private/libs/",
    "-Dsonar.inclusions=**/src/**"
    "-Dsonar.exclusions=**/__tests__/**"
    "-Dsonar.cpd.exclusions=**/src/**/mocks/**,
                            **/src/**/*Legacy.*,
                            **/src/**/l10n/default.ts"
    "-Dsonar.sca.exclusions=tools/nx-automation/**"
    "-Dsonar.tests=apps/sq-server/,libs/,private/libs/",
    "-Dsonar.test.inclusions=**/__tests__/**"
    "-Dsonar.coverage.exclusions=**/__mocks__/**,
                                **/config/**,
                                **/*.js,
                                **/vite.config.ts,
                                **/@types/**,
                                **/components/icons/**,
                                **/components/visual-components/**,
                                **/helpers/mocks/**,
                                **/sonar-aligned/helpers/mocks/**,
                                **/api/**,
                                **/routes.ts,
                                **/pages/**,
                                **/app/index.ts,
                                **/app/utils/startReactApp.tsx,
                                **/helpers/testUtils.tsx,
                                **/helpers/testUtils.ts,
                                **/helpers/testReactTestingUtils.tsx,
                                **/helpers/testSelector.ts,
                                **/helpers/testMocks.ts,
                                **/helpers/keyboard.ts,
                                **/helpers/cookies.ts,
                                **/*Legacy.*")

  echo "[DEBUG] Running sonar-scanner with params: ${scanner_params[*]}"
  yarn run sonar-scanner "${scanner_params[@]}"
else
  echo "[DEBUG] Skipping scan: neither PULL_REQUEST nor GITHUB_BRANCH=master or branch-sqs-*."
fi
