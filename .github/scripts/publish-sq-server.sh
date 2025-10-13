#!/bin/bash

# The following environment variables are expected to be set:
#   ARTIFACTORY_URL
#   ARTIFACTORY_DEPLOY_REPO
#   ARTIFACTORY_DEPLOY_REPO_PUBLIC
#   ARTIFACTORY_DEPLOY_ACCESS_TOKEN
#   BUILD_NUMBER
#   VERSION
#   PULL_REQUEST
#   GITHUB_BRANCH
#   SIGN_KEY
#   PGP_PASSPHRASE

# The following are Github Actions default environment variables:
#   GITHUB_SHA
#   GITHUB_BASE_REF


BUILD_NAME="sonarcloud-webapp"
BUILD_FOLDER_PATH="apps/sq-server/build"
POM_TEMPLATE_PATH=.github/scripts/template.pom
BUILD_JSON_TEMPLATE_PATH=.github/scripts/sq-server-build.json

PUBLISH_COMMON_PARAMS="build.number=$BUILD_NUMBER"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;vcs.revision=$GITHUB_SHA"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;vcs.branch=$GITHUB_BRANCH"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;pr.number=$PULL_REQUEST"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;pr.branch.target=$GITHUB_BASE_REF"
PUBLISH_COMMON_PARAMS="$PUBLISH_COMMON_PARAMS;build.name=$BUILD_NAME"


get_publish_domain()
{
  ARTIFACTORY_PUBLISH_REPO=$1

  ARTIFACTORY_PUBLISH_DOMAIN="com"
  if [ "$ARTIFACTORY_PUBLISH_REPO" != "$ARTIFACTORY_DEPLOY_REPO" ]; then
    ARTIFACTORY_PUBLISH_DOMAIN="org"
  fi

  echo "$ARTIFACTORY_PUBLISH_DOMAIN"
}

upload_artifact()
{
  local ARTIFACT_NAME=$1
  local ARTIFACT_EXTENSION=$2
  local ARTIFACTORY_PUBLISH_REPO=$3

  UPLOADED_ARTIFACT_NAME="$ARTIFACT_NAME-$VERSION.$BUILD_NUMBER.$ARTIFACT_EXTENSION"

  PUBLISH_URL="$ARTIFACTORY_URL/$ARTIFACTORY_PUBLISH_REPO/$(get_publish_domain "$ARTIFACTORY_PUBLISH_REPO")/sonarsource/sonarqube/$ARTIFACT_NAME/$VERSION.$BUILD_NUMBER/$UPLOADED_ARTIFACT_NAME"
  API_CALL="$PUBLISH_URL;$PUBLISH_COMMON_PARAMS"

  # Upload artifact
  HTTP_CODE=$(curl -H "Authorization: Bearer $ARTIFACTORY_DEPLOY_ACCESS_TOKEN" -s -o /dev/null -w %{http_code} -XPUT $API_CALL -T "$BUILD_FOLDER_PATH/$ARTIFACT_NAME.$ARTIFACT_EXTENSION")
  if [ "$HTTP_CODE" != "201" ]; then
      echo "Cannot upload $ARTIFACT_NAME.$ARTIFACT_EXTENSION to $ARTIFACTORY_PUBLISH_REPO: HTTP return code $HTTP_CODE"
      exit 1
  else
      echo "$ARTIFACT_NAME.$ARTIFACT_EXTENSION uploaded to $ARTIFACTORY_PUBLISH_REPO"
  fi
}

publish_to_artifactory()
{
  local ARTIFACT_NAME=$1
  local ARTIFACTORY_PUBLISH_REPO=$2

  echo "Publishing $ARTIFACT_NAME.jar to ${ARTIFACTORY_PUBLISH_REPO}"
  upload_artifact "$ARTIFACT_NAME" "jar" "$ARTIFACTORY_PUBLISH_REPO"
}

publish_pom_to_artifactory()
{
  local ARTIFACT_NAME=$1
  local ARTIFACTORY_PUBLISH_REPO=$2

  ARTIFACTORY_PUBLISH_DOMAIN=$(get_publish_domain "$ARTIFACTORY_PUBLISH_REPO")
  POM_FILE_PATH="$BUILD_FOLDER_PATH/$ARTIFACT_NAME.pom"

  echo "Creating pom for $ARTIFACT_NAME in ${ARTIFACTORY_PUBLISH_REPO}"

  # Replace the values in template file
  cp "$POM_TEMPLATE_PATH" "$POM_FILE_PATH"
  sed -i -e "s/ARTIFACT_NAME/$ARTIFACT_NAME/g" $POM_FILE_PATH
  sed -i -e "s/VERSION/$VERSION.$BUILD_NUMBER/g" $POM_FILE_PATH
  sed -i -e "s/DOMAIN/$ARTIFACTORY_PUBLISH_DOMAIN/g" $POM_FILE_PATH

  upload_artifact "$ARTIFACT_NAME" "pom" "$ARTIFACTORY_PUBLISH_REPO"
}

publish_artifact_signature()
{
  local ARTIFACT_NAME=$1
  local ARTIFACT_EXTENSION=$2
  local ARTIFACTORY_PUBLISH_REPO=$3

  echo "Creating PGP signature for $ARTIFACT_NAME.$ARTIFACT_EXTENSION in ${ARTIFACTORY_PUBLISH_REPO}"
  echo "${PGP_PASSPHRASE}" | gpg --batch --pinentry-mode loopback --passphrase-fd 0 --quiet --import <(echo "${SIGN_KEY}") >/dev/null
  echo "${PGP_PASSPHRASE}" | gpg --batch --pinentry-mode loopback --passphrase-fd 0 --quiet --detach-sign --armor "$BUILD_FOLDER_PATH/$ARTIFACT_NAME.$ARTIFACT_EXTENSION" >/dev/null

  upload_artifact "$ARTIFACT_NAME" "$ARTIFACT_EXTENSION.asc" "$ARTIFACTORY_PUBLISH_REPO"
}

publish_artifact_checksums()
{
  local ARTIFACT_NAME=$1
  local ARTIFACT_EXTENSION=$2
  local ARTIFACTORY_PUBLISH_REPO=$3
  local ARTIFACT_MD5=$4
  local ARTIFACT_SHA1=$5

  echo "$ARTIFACT_MD5" > "$BUILD_FOLDER_PATH/$ARTIFACT_NAME.$ARTIFACT_EXTENSION.md5"
  echo "$ARTIFACT_SHA1" > "$BUILD_FOLDER_PATH/$ARTIFACT_NAME.$ARTIFACT_EXTENSION.sha1"

  upload_artifact "$ARTIFACT_NAME" "$ARTIFACT_EXTENSION.md5" "$ARTIFACTORY_PUBLISH_REPO"
  upload_artifact "$ARTIFACT_NAME" "$ARTIFACT_EXTENSION.sha1" "$ARTIFACTORY_PUBLISH_REPO"
}

get_artifact_response()
{
  local ARTIFACTORY_PUBLISH_REPO=$1
  local ARTIFACTORY_DOMAIN=$2
  local ARTIFACT_NAME=$3
  local UPLOADED_ARTIFACT_NAME=$4

  ARTIFACT_GET_URL="$ARTIFACTORY_URL/api/storage/$ARTIFACTORY_PUBLISH_REPO/$ARTIFACTORY_DOMAIN/sonarsource/sonarqube/$ARTIFACT_NAME/$VERSION.$BUILD_NUMBER"

  echo $(curl -H "Authorization: Bearer $ARTIFACTORY_DEPLOY_ACCESS_TOKEN" -s -XGET "$ARTIFACT_GET_URL/$UPLOADED_ARTIFACT_NAME")
}

create_build_in_artifactory()
{
  PUBLIC_ARTIFACT_NAME="webapp-assets"
  PRIVATE_ARTIFACT_NAME="webapp-assets-enterprise"

  # Get the created time of the first artifact
  RESPONSE=$(get_artifact_response "$ARTIFACTORY_DEPLOY_REPO" "com" "$PRIVATE_ARTIFACT_NAME" "$PRIVATE_ARTIFACT_NAME-$VERSION.$BUILD_NUMBER.jar")
  TIME_CREATED=$(echo $RESPONSE | jq .created)

  # Get MD5 and SHA1 values of the private jar
  PRIVATE_ZIP_MD5=$(md5sum "$BUILD_FOLDER_PATH/$PRIVATE_ARTIFACT_NAME.jar" | cut -d ' ' -f 1)
  PRIVATE_ZIP_SHA1=$(sha1sum "$BUILD_FOLDER_PATH/$PRIVATE_ARTIFACT_NAME.jar" | cut -d ' ' -f 1)

  # Get MD5 and SHA1 values of the private pom
  PRIVATE_POM_MD5=$(md5sum "$BUILD_FOLDER_PATH/$PRIVATE_ARTIFACT_NAME.pom" | cut -d ' ' -f 1)
  PRIVATE_POM_SHA1=$(sha1sum "$BUILD_FOLDER_PATH/$PRIVATE_ARTIFACT_NAME.pom" | cut -d ' ' -f 1)

  # Get MD5 and SHA1 values of the public jar
  ZIP_MD5=$(md5sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.jar" | cut -d ' ' -f 1)
  ZIP_SHA1=$(sha1sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.jar" | cut -d ' ' -f 1)
  ZIP_ASC_MD5=$(md5sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.jar.asc" | cut -d ' ' -f 1)
  ZIP_ASC_SHA1=$(sha1sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.jar.asc" | cut -d ' ' -f 1)

  # Get MD5 and SHA1 values of the public pom
  POM_MD5=$(md5sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.pom" | cut -d ' ' -f 1)
  POM_SHA1=$(sha1sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.pom" | cut -d ' ' -f 1)
  POM_ASC_MD5=$(md5sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.pom.asc" | cut -d ' ' -f 1)
  POM_ASC_SHA1=$(sha1sum "$BUILD_FOLDER_PATH/$PUBLIC_ARTIFACT_NAME.pom.asc" | cut -d ' ' -f 1)

  publish_artifact_checksums "$PUBLIC_ARTIFACT_NAME" "jar" "$ARTIFACTORY_DEPLOY_REPO_PUBLIC" "$ZIP_MD5" "$ZIP_SHA1"
  publish_artifact_checksums "$PUBLIC_ARTIFACT_NAME" "pom" "$ARTIFACTORY_DEPLOY_REPO_PUBLIC" "$POM_MD5" "$POM_SHA1"

  #Replace the values in template file
  sed -i -e "s/BUILD_NAME/$BUILD_NAME/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/VERSION/$VERSION/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/BUILD_NUMBER/$BUILD_NUMBER/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/TIME_CREATED/$TIME_CREATED/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/PRIVATE_ZIP_SHA1/$PRIVATE_ZIP_SHA1/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/PRIVATE_ZIP_MD5/$PRIVATE_ZIP_MD5/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/PRIVATE_POM_SHA1/$PRIVATE_POM_SHA1/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/PRIVATE_POM_MD5/$PRIVATE_POM_MD5/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/ZIP_SHA1/$ZIP_SHA1/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/ZIP_MD5/$ZIP_MD5/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/POM_SHA1/$POM_SHA1/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/POM_MD5/$POM_MD5/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/ZIP_ASC_MD5/$ZIP_ASC_MD5/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/ZIP_ASC_SHA1/$ZIP_ASC_SHA1/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/POM_ASC_MD5/$POM_ASC_MD5/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/POM_ASC_SHA1/$POM_ASC_SHA1/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/ARTIFACTORY_DEPLOY_REPO_PUBLIC/$ARTIFACTORY_DEPLOY_REPO_PUBLIC/g" $BUILD_JSON_TEMPLATE_PATH
  sed -i -e "s/ARTIFACTORY_DEPLOY_REPO/$ARTIFACTORY_DEPLOY_REPO/g" $BUILD_JSON_TEMPLATE_PATH

  echo "Creating build for $VERSION.$BUILD_NUMBER"

  echo "Build JSON: $(cat $BUILD_JSON_TEMPLATE_PATH)"

  #Create a build in artifactory
  API_CALL="$ARTIFACTORY_URL/api/build"
  HTTP_CODE=$(curl -H "Content-Type: application/json" -H "Authorization: Bearer $ARTIFACTORY_DEPLOY_ACCESS_TOKEN" -s -o /dev/null -w '%{http_code} %{errormsg}' -XPUT $API_CALL --upload-file $BUILD_JSON_TEMPLATE_PATH)
  if [[ "$HTTP_CODE" == 20* ]]; then
      echo "build for $VERSION.$BUILD_NUMBER created"
  else
      echo "Cannot create build for $VERSION.$BUILD_NUMBER: HTTP return code $HTTP_CODE"
      exit 1
  fi
}

publish_to_artifactory "webapp-assets" "$ARTIFACTORY_DEPLOY_REPO_PUBLIC"
publish_artifact_signature  "webapp-assets" "jar" "$ARTIFACTORY_DEPLOY_REPO_PUBLIC"
publish_pom_to_artifactory "webapp-assets" "$ARTIFACTORY_DEPLOY_REPO_PUBLIC"
publish_artifact_signature "webapp-assets" "pom" "$ARTIFACTORY_DEPLOY_REPO_PUBLIC"

publish_to_artifactory "webapp-assets-enterprise" "$ARTIFACTORY_DEPLOY_REPO"
publish_pom_to_artifactory "webapp-assets-enterprise" "$ARTIFACTORY_DEPLOY_REPO"

create_build_in_artifactory
