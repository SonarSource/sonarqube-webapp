#!/bin/bash

# The following environment variables are expected to be set:
#   ARTIFACTORY_URL
#   ARTIFACTORY_PROMOTE_ACCESS_TOKEN
#   BUILD_NUMBER
#   PULL_REQUEST
#   GITHUB_BRANCH
#   DEFAULT_BRANCH
#   STATUS (optional)

# On Pull Request builds
if [ "$PULL_REQUEST" != "" ]; then
  PRIVATE_TARGET_REPO='sonarsource-private-dev'
  PUBLIC_TARGET_REPO='sonarsource-public-dev'
  STATUS='it-passed-pr'

# Promotion to release
elif [[ $# -gt 0 ]] && [[ "$1" == "RELEASE" ]] && ([[ "$GITHUB_BRANCH" == "$DEFAULT_BRANCH" ]] || [[ "$GITHUB_BRANCH" == "branch-sqs-"* ]]); then
  PRIVATE_TARGET_REPO='sonarsource-private-releases'
  PUBLIC_TARGET_REPO='sonarsource-public-releases'
  STATUS='released'

# On master branch or maintenance branches builds
elif [[ "$GITHUB_BRANCH" == "$DEFAULT_BRANCH" ]] || [[ "$GITHUB_BRANCH" == "branch-sqs-"* ]]; then
  PRIVATE_TARGET_REPO='sonarsource-private-builds'
  PUBLIC_TARGET_REPO='sonarsource-public-builds'
  STATUS='it-passed'
fi

BUILD_NAME="sonarcloud-webapp"

if [ -n "${STATUS:-}" ]; then
  echo "Promoting build $BUILD_NAME#$BUILD_NUMBER"
  HTTP_CODE=$(curl -s -o /dev/null -w %{http_code} -H "Authorization: Bearer ${ARTIFACTORY_PROMOTE_ACCESS_TOKEN}" "$ARTIFACTORY_URL/api/plugins/execute/multiRepoPromote?params=buildName=$BUILD_NAME;buildNumber=$BUILD_NUMBER;src1=$ARTIFACTORY_DEPLOY_REPO;target1=$PRIVATE_TARGET_REPO;src2=$ARTIFACTORY_DEPLOY_REPO_PUBLIC;target2=$PUBLIC_TARGET_REPO;status=$STATUS")
  if [ "$HTTP_CODE" != "200" ]; then
    echo "Cannot promote build $BUILD_NAME#$BUILD_NUMBER: HTTP return code $HTTP_CODE"
    exit 1
  else
    echo "Build $BUILD_NAME#${BUILD_NUMBER} promoted to ${PRIVATE_TARGET_REPO}"
  fi
else
  echo 'No promotion for builds coming from a development branch'
fi
