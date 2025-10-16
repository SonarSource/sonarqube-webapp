#!/bin/bash

# The following environment variables are expected to be set:
#  SONAR_HOST_URL
#  SONARQUBE_NEXT_URL
#  SONAR_TOKEN
#  SONARQUBE_NEXT_TOKEN
#  PROJECT_KEY
#  VERSION

# The following are Github Actions default environment variables:
#  GITHUB_SHA
#  GITHUB_BASE_REF
#  GITHUB_REPOSITORY
#  GITHUB_RUN_ID

set -euo pipefail

export SONAR_HOST_URL=${SONAR_HOST_URL:-$SONARQUBE_NEXT_URL}
export SONAR_TOKEN=${SONAR_TOKEN:-$SONARQUBE_NEXT_TOKEN}
export PROJECT_KEY=${PROJECT_KEY:-sonarqube-webapp}

echo "[DEBUG] GITHUB_SHA: ${GITHUB_SHA}"
echo "[DEBUG] GITHUB_BASE_REF: ${GITHUB_BASE_REF}"
echo "[DEBUG] GITHUB_REPOSITORY: ${GITHUB_REPOSITORY}"
echo "[DEBUG] SONAR_HOST_URL: ${SONAR_HOST_URL}"
echo "[DEBUG] PROJECT_KEY: ${PROJECT_KEY}"

git fetch --unshallow || true
if [ -n "${GITHUB_BASE_REF:-}" ]; then
  git fetch origin "${GITHUB_BASE_REF}"
fi

PROJECT_VERSION=$(jq -r .version "apps/sq-server/package.json")
ESLINT_REPORT_PATH=$(find build/reports/ -name eslint-report.json -type f | paste -sd ',')

scanner_params=(
    "-Dsonar.projectKey=${PROJECT_KEY}"
    "-Dsonar.projectName=SonarQube Webapp"
    "-Dsonar.projectVersion=${PROJECT_VERSION}"
    "-Dsonar.host.url=${SONAR_HOST_URL}"
    "-Dsonar.token=${SONAR_TOKEN}"
    "-Dsonar.analysis.pipeline=${GITHUB_RUN_ID}"
    "-Dsonar.analysis.repository=${GITHUB_REPOSITORY}"
    "-Dsonar.analysis.sha1=${GITHUB_SHA}"
    "-Dsonar.eslint.reportPaths=${ESLINT_REPORT_PATH}"
    "-Dsonar.javascript.lcov.reportPaths=build/reports/coverage/lcov.info"
    "-Dsonar.sources=apps/sq-server/,libs/",
    "-Dsonar.inclusions=**/src/**"
    "-Dsonar.exclusions=**/__tests__/**"
    "-Dsonar.cpd.exclusions=**/src/**/mocks/**,
                            **/src/**/*Legacy.*,
                            **/src/**/l10n/default.ts"
    "-Dsonar.sca.exclusions=tools/nx-automation/**"
    "-Dsonar.tests=apps/sq-server/,libs/",
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

yarn run sonar-scanner "${scanner_params[@]}"
