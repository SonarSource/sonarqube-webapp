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
  TARGET_REPOSITORY='sonarsource-private-dev'
  STATUS='it-passed-pr'

# On master branch builds
elif [[ "$GITHUB_BRANCH" == "$DEFAULT_BRANCH" ]]; then
  TARGET_REPOSITORY='sonarsource-private-builds'
  STATUS='it-passed'
fi

BUILD_NAME="sonarcloud-webapp-assets"

if [ -n "${STATUS:-}" ]; then
  echo "Promoting build $BUILD_NAME#$BUILD_NUMBER to $TARGET_REPOSITORY"
  OP_DATE=$(date +%Y%m%d%H%M%S)
  DATA_JSON="{ \"status\": \"$STATUS\", \"properties\": { \"release\" : [ \"$OP_DATE\" ]}, \"targetRepo\": \"$TARGET_REPOSITORY\", \"copy\": false }"
  HTTP_CODE=$(curl -s -o /dev/null -w %{http_code} -H "Content-Type: application/json" -H "Authorization: Bearer $ARTIFACTORY_PROMOTE_ACCESS_TOKEN" -X POST "$ARTIFACTORY_URL/api/build/promote/$BUILD_NAME/$BUILD_NUMBER" --data "$DATA_JSON")
  if [ "$HTTP_CODE" != "200" ]; then
    echo "Cannot promote build $BUILD_NAME#$BUILD_NUMBER: HTTP return code $HTTP_CODE"
    exit 1
  else
    echo "Build $BUILD_NAME#$BUILD_NUMBER promoted to $TARGET_REPOSITORY"
  fi
else
  echo 'No promotion for builds coming from a development branch'
fi
