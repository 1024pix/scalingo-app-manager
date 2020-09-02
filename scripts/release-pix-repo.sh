#!/bin/bash

set -euxo pipefail

source "$(dirname $0)"/common.sh

CWD_DIR=$(pwd)
GITHUB_OWNER=(${1})
GITHUB_REPOSITORY=(${2})
VERSION_TYPE=(${3-""})

echo "Version type ${VERSION_TYPE} for ${GITHUB_OWNER}/${GITHUB_REPOSITORY}"

function install_required_packages {
  echo "Install packages"
  npm ci --dev --no-optional
}

function complete_change_log() {
  node "${CWD_DIR}/scripts/get-pull-requests-to-release-in-prod.js" "${NEW_PACKAGE_VERSION}" "${GITHUB_OWNER}" "${GITHUB_REPOSITORY}"

  echo "Updated CHANGELOG.md"
}

function create_release {
  npm_arg="" && [[ -n "$VERSION_TYPE" ]]  && npm_arg="$VERSION_TYPE"
  npm version ${npm_arg} --no-git-tag-version
  NEW_PACKAGE_VERSION=$(get_package_version)
}

function create_a_release_commit() {
  git add  --update CHANGELOG.md
  git add  --update package*.json

  git commit --message "[RELEASE] A ${VERSION_TYPE} is being released to ${NEW_PACKAGE_VERSION}."

  echo "Created the release commit"
}

function tag_release_commit() {
  git tag --annotate "v${NEW_PACKAGE_VERSION}" --message "v${NEW_PACKAGE_VERSION}"
  echo "Created annotated tag"
}

echo "Start deploying version ${VERSION_TYPE}…"

clone_repository_and_move_inside
configure_git_user_information
install_required_packages
create_release
complete_change_log
create_a_release_commit
tag_release_commit
push_commit_and_tag_to_remote_dev

echo -e "Release publication for ${GITHUB_OWNER}/${GITHUB_REPOSITORY} ${GREEN}succeeded${RESET_COLOR} (${VERSION_TYPE})."
