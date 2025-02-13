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

PROJECT_VERSION=$(jq -r .version "apps/sq-server/package.json")
ESLINT_REPORT_PATH=$(find ./ -name eslint-report.json -type f -not -path "**/.nx/*" -not -path "**/node_modules/*" | paste -sd ',')

scanner_params=(
    "-DbuildNumber=${BUILD_NUMBER}"
    "-Dsonar.projectKey=sonarqube-webapp"
    "-Dsonar.projectName=SonarQube Webapp"
    "-Dsonar.projectVersion=${PROJECT_VERSION}"
    "-Dsonar.host.url=${SONAR_HOST_URL}"
    "-Dsonar.token=${SONAR_TOKEN}"
    "-Dsonar.analysis.buildNumber=${BUILD_NUMBER}"
    "-Dsonar.analysis.pipeline=${PIPELINE_ID}"
    "-Dsonar.analysis.repository=${GITHUB_REPO}"
    "-Dsonar.analysis.sha1=${GIT_SHA1}"
    "-Dsonar.eslint.reportPaths=${ESLINT_REPORT_PATH}"
    "-Dsonar.javascript.lcov.reportPaths=coverage-merged/lcov.info"
    "-Dsonar.sources=apps/sq-server/src,libs/addons/src,libs/cross-domain/sq-server-shared/src"
    "-Dsonar.exclusions=**/__tests__/**"
    "-Dsonar.cpd.exclusions=**/src/**/mocks/**,
                            **/src/**/*Legacy.*,
                            **/src/**/l10n/default.ts"
    "-Dsonar.tests=apps/sq-server/,libs/cross-domain/sq-server-shared/"
    "-Dsonar.test.inclusions=**/__tests__/**"
    "-Dsonar.coverage.exclusions=**/__mocks__/**,
                                **/config/**,
                                **/*.js,
                                **/*.mjs,
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
                                **/*Legacy.*")

sonar-scanner "${scanner_params[@]}"
