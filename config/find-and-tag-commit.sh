#!/bin/bash

# This script finds the commit in sonarqube-webapp that corresponds to a specific tag in sonarcloud-webapp.
# Usage: ./find-and-tag-commit.sh <target_git_tag_in_sonarcloud_webapp> <new_git_tag_for_sonarqube_webapp>
# Example: ./find-and-tag-commit.sh v1.2.3 sq-1.2.3
#
# --- Configuration ---
# The script assumes 'sonarcloud-webapp' is the current workspace.
# You MUST verify and adjust SONARQUBE_WEBAPP_PATH to the correct path of your local 'sonarqube-webapp' git repository.
SONARCLOUD_WEBAPP_PATH="."
SONARQUBE_WEBAPP_PATH="../sonarqube-webapp" # IMPORTANT: Adjust this path if your sonarqube-webapp is located elsewhere
SEARCH_LIMIT=15 # Maximum number of commits to check back in history

# --- Helper Functions ---
get_commit_subject() {
  local repo_path="$1"
  local tag_or_commit="$2"
  (cd "$repo_path" && git log -1 --pretty=%s "$tag_or_commit" 2>/dev/null)
}

get_commit_message_full() {
  local repo_path="$1"
  local tag_or_commit="$2"
  (cd "$repo_path" && git log -1 --pretty=%B "$tag_or_commit" 2>/dev/null)
}

get_commit_date() {
  local repo_path="$1"
  local tag_or_commit="$2"
  (cd "$repo_path" && git log -1 --pretty=%ci "$tag_or_commit" 2>/dev/null)
}

get_commit_hash_from_subject() {
  local repo_path="$1"
  # Remove the PR reference like (#123) at the end for the search
  local commit_subject="$(echo "$2" | sed 's/\s*(#[0-9]\+)\s*$//')"
  # Search for the commit by its exact subject line.
  # Using --fixed-strings to treat the subject as a literal string.
  (cd "$repo_path" && git log --all --grep="$commit_subject" --fixed-strings --pretty=%H -1 2>/dev/null)
}

# --- Main Script ---
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <target_git_tag_in_sonarcloud_webapp> <new_git_tag_for_sonarqube_webapp>"
  exit 1
fi

TARGET_SCW_TAG="$1"
NEW_SQW_TAG="$2"

echo "Starting script..."
echo "Target sonarcloud-webapp tag: $TARGET_SCW_TAG"
echo "New sonarqube-webapp tag: $NEW_SQW_TAG"
echo "sonarcloud-webapp path: $SONARCLOUD_WEBAPP_PATH"
echo "sonarqube-webapp path: $SONARQUBE_WEBAPP_PATH"
echo ""

# Validate repository paths
if [ ! -d "$SONARCLOUD_WEBAPP_PATH" ] || ! (cd "$SONARCLOUD_WEBAPP_PATH" && git rev-parse --is-inside-work-tree >/dev/null 2>&1); then
    echo "Error: sonarcloud-webapp path '$SONARCLOUD_WEBAPP_PATH' is not a valid git repository."
    exit 1
fi

if [ ! -d "$SONARQUBE_WEBAPP_PATH" ] || ! (cd "$SONARQUBE_WEBAPP_PATH" && git rev-parse --is-inside-work-tree >/dev/null 2>&1); then
    echo "Error: sonarqube-webapp path '$SONARQUBE_WEBAPP_PATH' is not a valid git repository."
    echo "Please ensure the SONARQUBE_WEBAPP_PATH variable in the script is set correctly."
    exit 1
fi

found_scw_commit_subject=""
original_scw_commit_hash_for_search="" # Hash of the SC commit whose subject is used for search
sqw_commit_hash_match=""
scw_ref_to_check=""

for i in $(seq 0 $SEARCH_LIMIT); do
  if [ "$i" -eq 0 ]; then
    scw_ref_to_check="$TARGET_SCW_TAG"
  else
    scw_ref_to_check="${TARGET_SCW_TAG}~${i}"
  fi

  echo "Attempt $(($i + 1))/$SEARCH_LIMIT: Checking sonarcloud-webapp ref '$scw_ref_to_check'..."

  current_scw_commit_hash=$(cd "$SONARCLOUD_WEBAPP_PATH" && git rev-parse "$scw_ref_to_check" 2>/dev/null)
  if [ -z "$current_scw_commit_hash" ]; then
    echo "Error: Could not resolve sonarcloud-webapp ref '$scw_ref_to_check' to a commit."
    if [ "$i" -eq 0 ] && [ "$scw_ref_to_check" = "$TARGET_SCW_TAG" ]; then
        echo "The target tag '$TARGET_SCW_TAG' might not exist or is invalid."
    fi
    continue
  fi
  original_scw_commit_hash_for_search=$current_scw_commit_hash

  found_scw_commit_subject=$(get_commit_subject "$SONARCLOUD_WEBAPP_PATH" "$current_scw_commit_hash")

  if [ -z "$found_scw_commit_subject" ]; then
    echo "Warning: Could not retrieve commit subject for sonarcloud-webapp commit $current_scw_commit_hash (from ref '$scw_ref_to_check')."
    continue
  fi
  echo "sonarcloud-webapp commit $current_scw_commit_hash (from ref '$scw_ref_to_check') subject: \"$found_scw_commit_subject\""

  echo "Searching for commit with this subject in sonarqube-webapp repository ($SONARQUBE_WEBAPP_PATH)..."
  sqw_commit_hash_match=$(get_commit_hash_from_subject "$SONARQUBE_WEBAPP_PATH" "$found_scw_commit_subject")

  if [ -n "$sqw_commit_hash_match" ]; then
    echo "Found matching commit in sonarqube-webapp."
    break
  else
    echo "No commit found in sonarqube-webapp with subject \"$found_scw_commit_subject\"."
  fi

  echo "" # Newline for readability between attempts
done

if [ -z "$sqw_commit_hash_match" ]; then
  echo ""
  echo "Failed to find a matching commit in sonarqube-webapp after all attempts."
  exit 1
fi

echo ""
echo ""
echo "--- Summary ---"
echo "sonarcloud-webapp Reference Used for Search: $scw_ref_to_check (resolved to commit $original_scw_commit_hash_for_search)"
echo "sonarcloud-webapp Commit Subject: \"$found_scw_commit_subject\""
scw_commit_date=$(get_commit_date "$SONARCLOUD_WEBAPP_PATH" "$original_scw_commit_hash_for_search")
echo "sonarcloud-webapp Commit Date: $scw_commit_date"
full_scw_message=$(get_commit_message_full "$SONARCLOUD_WEBAPP_PATH" "$original_scw_commit_hash_for_search")
echo "sonarcloud-webapp Full Commit Message:"
echo "$full_scw_message"
echo "---"
echo "Matching sonarqube-webapp Commit Hash: $sqw_commit_hash_match"
sqw_match_subject=$(get_commit_subject "$SONARQUBE_WEBAPP_PATH" "$sqw_commit_hash_match")
echo "Matching sonarqube-webapp Commit Subject: \"$sqw_match_subject\""
sqw_commit_date=$(get_commit_date "$SONARQUBE_WEBAPP_PATH" "$sqw_commit_hash_match")
echo "Matching sonarqube-webapp Commit Date: $sqw_commit_date"
full_sqw_match_message=$(get_commit_message_full "$SONARQUBE_WEBAPP_PATH" "$sqw_commit_hash_match")
echo "Matching sonarqube-webapp Full Commit Message:"
echo "$full_sqw_match_message"
echo "---"
echo "New tag to be applied in sonarqube-webapp: $NEW_SQW_TAG"
echo ""

read -r -p "Proceed with tagging sonarqube-webapp commit $sqw_commit_hash_match with tag '$NEW_SQW_TAG'? (Y/N): " confirmation

if [[ "$confirmation" == "Y" || "$confirmation" == "y" || "$confirmation" == "yes" ]]; then
  echo "Tagging commit $sqw_commit_hash_match with tag '$NEW_SQW_TAG' in $SONARQUBE_WEBAPP_PATH..."

  if (cd "$SONARQUBE_WEBAPP_PATH" && git tag "$NEW_SQW_TAG" "$sqw_commit_hash_match" --no-sign); then
    echo "Successfully tagged $sqw_commit_hash_match with $NEW_SQW_TAG in sonarqube-webapp."
    echo "IMPORTANT: Remember to push the tag to the remote repository:"
    echo "  (cd \"$SONARQUBE_WEBAPP_PATH\" && git push origin \"$NEW_SQW_TAG\")"
  else
    echo "Error: Failed to tag commit in sonarqube-webapp."
    # Check if tag already exists, as 'git tag' fails if the tag exists
    if (cd "$SONARQUBE_WEBAPP_PATH" && git rev-parse "$NEW_SQW_TAG" >/dev/null 2>&1); then
        echo "It seems the tag '$NEW_SQW_TAG' already exists in the sonarqube-webapp repository."
    fi
  fi
else
  echo "Tagging aborted by user."
fi

echo "Script finished."
