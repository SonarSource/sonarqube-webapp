#!/bin/bash
set -euo pipefail

export GIT_SHA1=${CIRRUS_CHANGE_IN_REPO?}
export GITHUB_BASE_BRANCH=${CIRRUS_BASE_BRANCH:-}
export GITHUB_BRANCH=${CIRRUS_BRANCH?}
export GITHUB_REPO=${CIRRUS_REPO_FULL_NAME?}
export BUILD_NUMBER=${CI_BUILD_NUMBER?}
export PULL_REQUEST=${CIRRUS_PR:-false}
export PULL_REQUEST_SHA=${CIRRUS_BASE_SHA:-}
export PIPELINE_ID=${CIRRUS_BUILD_ID?}

: "${SONAR_HOST_URL?}" "${SONAR_TOKEN?}"

git fetch --unshallow || true
if [ -n "${GITHUB_BASE_BRANCH:-}" ]; then
  git fetch origin "${GITHUB_BASE_BRANCH}"
fi

scanner_params=(
    "-DbuildNumber=${BUILD_NUMBER}"
    "-Dsonar.projectKey=sonarqube-webapp"
    "-Dsonar.host.url=${SONAR_HOST_URL}"
    "-Dsonar.token=${SONAR_TOKEN}"
    "-Dsonar.analysis.buildNumber=${BUILD_NUMBER}"
    "-Dsonar.analysis.pipeline=${PIPELINE_ID}"
    "-Dsonar.analysis.repository=${GITHUB_REPO}"
    "-Dsonar.analysis.sha1=${GIT_SHA1}"
    "-Dsonar.eslint.reportPaths=server/sonar-web/build/reports/eslint-report/eslint-report.json"
    "-Dsonar.javascript.lcov.reportPaths=server/sonar-web/build/reports/coverage/lcov.info"
    "-Dsonar.sources=server/sonar-web/src"
    "-Dsonar.exclusions=**/__tests__/**"
    "-Dsonar.cpd.exclusions=**/src/**/*Legacy.*,
                            **/design-system/theme/**,
                            **/legacy-design-system/**"
    "-Dsonar.tests=server/sonar-web/src"
    "-Dsonar.test.inclusions=**/__tests__/**"
    "-Dsonar.coverage.exclusions=**/__mocks__/**,
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
                                **/helpers/testReactTestingUtils.tsx,
                                **/helpers/testSelector.ts,
                                **/helpers/testMocks.ts,
                                **/helpers/keyboard.ts,
                                **/helpers/cookies.ts,
                                **/*Legacy.*
                                ")

sonar-scanner "${scanner_params[@]}"
