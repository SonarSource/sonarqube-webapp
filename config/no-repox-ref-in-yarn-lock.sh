#!/bin/bash

lock_file=${2:-./yarn.lock}

getRepoxPackages() {
# Find all packages that have the repox registry in their resolution
  awk '/^"/ { package=$0 } /repox.jfrog.io/ { print package }' $lock_file | sort | uniq
}

check() {
  repox_packages=$(getRepoxPackages)

  # if there is at least one package coming from repox registry report an error
  if [ -n "$repox_packages" ]; then
    echo "The $lock_file file contains packages referencing repox as a repository."
    echo "This is not compatible with our public mirror repository which doesn't have access to repox."
    echo "Please fix the yarn.lock file by running: ./config/no-repox-ref-in-yarn-lock.sh -u $lock_file"
    exit 1
  fi

  echo "No packages referencing repox registry found in $lock_file."
  exit 0
}

update() {
  repox_packages=$(getRepoxPackages)
  if [ -z "$repox_packages" ]; then
    echo "No packages referencing repox registry found in $lock_file."
    exit 0
  fi

  # Remove the full matching package blocks from yarn.lock
  awk -v packages="$repox_packages" '
  BEGIN {
    split(packages, pkgArray, "\n");
    for (i in pkgArray) {
      pkgMap[pkgArray[i]] = 1;
    }
  }
  {
    if ($0 ~ /^"/) {
      package = $0;
      inBlock = pkgMap[package];
    }
    if (!inBlock) {
      print $0;
    }
  }
  ' $lock_file > "${lock_file}.tmp"

  # Replace the original yarn.lock with the updated one
  mv "${lock_file}.tmp" $lock_file

  yarn config set npmRegistryServer "https://registry.npmjs.org/"
  yarn
  yarn config unset npmRegistryServer

  echo "The $lock_file file has been updated to remove packages referencing repox registry."
}

showHelp() {
  echo "This script is used to check and update the yarn.lock file to remove references to the repox registry.
Usage:
  -c : to check that the yarn.lock file doesn't contains any reference to repox registry
  -h : to display the help
  -u : to update the yarn.lock file to remove references to repox registry"
}

while getopts "chu" opt; do
  case "$opt" in
    c)
        check
        ;;
    h)
        showHelp
        ;;
    u)
        update
        ;;
  esac
done
