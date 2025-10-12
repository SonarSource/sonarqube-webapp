#!/bin/bash

# The following environment variables are expected to be set:
#   ARTIFACTORY_URL
#   ARTIFACTORY_DEPLOY_REPO
#   ARTIFACTORY_DEPLOY_ACCESS_TOKEN
#   BUILD_NUMBER
#   PULL_REQUEST
#   GITHUB_BRANCH

# The following are Github Actions default environment variables:
#   GITHUB_SHA
#   GITHUB_BASE_REF

ARTIFACT_FILE_PATH="private/apps/sq-cloud/build/webapp-assets.zip"
ARTIFACT_BOM_FILE_PATH="private/apps/sq-cloud/build/reports/bom.json"
VERSION=8.0.0

PUBLISH_COMMON_PARAMS="build.number=$BUILD_NUMBER"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;vcs.revision=$GITHUB_SHA"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;vcs.branch=$GITHUB_BRANCH"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;pr.number=$PULL_REQUEST"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;pr.branch.target=$GITHUB_BASE_REF"

publish_to_artifactory()
{
  PUBLISH_URL=$1
  LOCAL_FILE=$2
  BUILD_NAME=$3

  PARAMS="$PUBLISH_COMMON_PARAMS;build.name=$BUILD_NAME"
  API_CALL="$PUBLISH_URL;$PARAMS"

  echo "$PARAMS"

  echo "Publishing $BUILD_NAME#$BUILD_NUMBER"

  #Upload build artifact
  HTTP_CODE=$(curl -H "Authorization: Bearer ${ARTIFACTORY_DEPLOY_ACCESS_TOKEN}" -s -o /dev/null -w %{http_code} -XPUT $API_CALL -T $LOCAL_FILE)
  if [ "$HTTP_CODE" != "201" ]; then
      echo "Cannot upload $BUILD_NAME#$BUILD_NUMBER: ($HTTP_CODE)"
      exit 1
  else
      echo "$BUILD_NAME#${BUILD_NUMBER} uploaded to ${ARTIFACTORY_DEPLOY_REPO}"
  fi
}

create_build_in_artifactory()
{
  ZIP_API_CALL=$1
  BOM_API_CALL=$2
  PATH_TO_BUILD_JSON=$3
  BUILD_NAME=$4

  #Get MD5 and SHA1 values
  RESPONSE=$(curl -H "Authorization: Bearer ${ARTIFACTORY_DEPLOY_ACCESS_TOKEN}" -s -XGET $ZIP_API_CALL)
  ZIP_MD5=$(echo $RESPONSE | jq .checksums.md5)
  ZIP_SHA1=$(echo $RESPONSE | jq .checksums.sha1)
  TIME_CREATED=$(echo $RESPONSE | jq .created)

  RESPONSE=$(curl -H "Authorization: Bearer ${ARTIFACTORY_DEPLOY_ACCESS_TOKEN}" -s -XGET $BOM_API_CALL)
  BOM_MD5=$(echo $RESPONSE | jq .checksums.md5)
  BOM_SHA1=$(echo $RESPONSE | jq .checksums.sha1)

  #Replace the values in template file
  sed -i -e "s/VERSION/$BUILD_NUMBER/g" $PATH_TO_BUILD_JSON
  sed -i -e "s/ZIP_SHA1/$ZIP_SHA1/g" $PATH_TO_BUILD_JSON
  sed -i -e "s/ZIP_MD5/$ZIP_MD5/g" $PATH_TO_BUILD_JSON
  sed -i -e "s/BOM_SHA1/$BOM_SHA1/g" $PATH_TO_BUILD_JSON
  sed -i -e "s/BOM_MD5/$BOM_MD5/g" $PATH_TO_BUILD_JSON
  sed -i -e "s/TIME_CREATED/$TIME_CREATED/g" $PATH_TO_BUILD_JSON

  #Create a build in artifactory
  API_CALL="$ARTIFACTORY_URL/api/build"
  HTTP_CODE=$(curl -H "Content-Type: application/json" -H "Authorization: Bearer ${ARTIFACTORY_DEPLOY_ACCESS_TOKEN}" -s -o /dev/null -w %{http_code} -XPUT $API_CALL --upload-file $PATH_TO_BUILD_JSON)
  if [ "$HTTP_CODE" != "204" ]; then
      echo "Cannot upload build $BUILD_NAME#$BUILD_NUMBER: ($HTTP_CODE)"
      exit 1
  else
      echo "$BUILD_NAME#${BUILD_NUMBER} build uploaded"
  fi
}

BUILD_NAME="sonarcloud-webapp-assets"
PUT_URL="$ARTIFACTORY_URL/$ARTIFACTORY_DEPLOY_REPO/com/sonarsource/sonarcloud/webapp-assets/$VERSION.$BUILD_NUMBER/webapp-assets-$VERSION.$BUILD_NUMBER.zip"
publish_to_artifactory "$PUT_URL" "$ARTIFACT_FILE_PATH" "$BUILD_NAME"

PUT_URL="$ARTIFACTORY_URL/$ARTIFACTORY_DEPLOY_REPO/com/sonarsource/sonarcloud/webapp-assets/$VERSION.$BUILD_NUMBER/webapp-bom-$VERSION.$BUILD_NUMBER.json"
publish_to_artifactory "$PUT_URL" "$ARTIFACT_BOM_FILE_PATH" "$BUILD_NAME"

ZIP_GET_URL="$ARTIFACTORY_URL/api/storage/$ARTIFACTORY_DEPLOY_REPO/com/sonarsource/sonarcloud/webapp-assets/$VERSION.$BUILD_NUMBER/webapp-assets-$VERSION.$BUILD_NUMBER.zip"
BOM_GET_URL="$ARTIFACTORY_URL/api/storage/$ARTIFACTORY_DEPLOY_REPO/com/sonarsource/sonarcloud/webapp-assets/$VERSION.$BUILD_NUMBER/webapp-bom-$VERSION.$BUILD_NUMBER.json"
BUILD_JSON=.github/scripts/sq-cloud-build.json

create_build_in_artifactory "$ZIP_GET_URL" "$BOM_GET_URL" "$BUILD_JSON" "$BUILD_NAME"
