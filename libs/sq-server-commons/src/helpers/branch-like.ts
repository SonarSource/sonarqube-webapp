/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { orderBy } from 'lodash';
import { isBranch, isMainBranch, isPullRequest } from '~shared/helpers/branch-like';
import { PullRequest } from '~shared/types/branch-like';
import { Branch, BranchLike, BranchLikeTree } from '../types/branch-like';

export function sortBranches(branches: Branch[]) {
  return orderBy(branches, [(b) => b.isMain, (b) => b.name], ['desc', 'asc']);
}

export function sortPullRequests(pullRequests: PullRequest[]) {
  return orderBy(pullRequests, (pr) => getPullRequestDisplayName(pr));
}

export function getPullRequestDisplayName(pullRequest: PullRequest) {
  return `${pullRequest.key} – ${pullRequest.title}`;
}

export function getBranchLikeDisplayName(branchLike: BranchLike) {
  return isPullRequest(branchLike) ? getPullRequestDisplayName(branchLike) : branchLike.name;
}

export function getBranchLikeKey(branchLike: BranchLike) {
  return isPullRequest(branchLike) ? `pull-request-${branchLike.key}` : `branch-${branchLike.name}`;
}

export function isSameBranchLike(a: BranchLike | undefined, b: BranchLike | undefined) {
  // main branches are always equal
  if (isMainBranch(a) && isMainBranch(b)) {
    return true;
  }

  // Branches are compared by name
  if (isBranch(a) && isBranch(b)) {
    return a.name === b.name;
  }

  // pull requests are compared by id
  if (isPullRequest(a) && isPullRequest(b)) {
    return a.key === b.key;
  }

  // finally if both parameters are `undefined`, consider them equal
  return a === b;
}

export function getBrancheLikesAsTree(branchLikes: BranchLike[]): BranchLikeTree {
  const mainBranch = branchLikes.find(isMainBranch);
  const branches = orderBy(
    branchLikes.filter(isBranch).filter((b) => !isMainBranch(b)),
    (b) => b.name,
  );
  const pullRequests = orderBy(branchLikes.filter(isPullRequest), (b) => parseInt(b.key, 10), [
    'desc',
  ]);
  const parentlessPullRequests = pullRequests.filter(
    (pr) => !pr.isOrphan && ![mainBranch, ...branches].find((b) => !!b && b.name === pr.base),
  );
  const orphanPullRequests = pullRequests.filter((pr) => pr.isOrphan);

  const tree: BranchLikeTree = {
    branchTree: branches.map((b) => ({
      branch: b,
      pullRequests: getPullRequests(b),
    })),
    parentlessPullRequests,
    orphanPullRequests,
  };

  if (mainBranch) {
    tree.mainBranchTree = {
      branch: mainBranch,
      pullRequests: getPullRequests(mainBranch),
    };
  }

  return tree;

  function getPullRequests(branch: Branch) {
    return pullRequests.filter((pr) => !pr.isOrphan && pr.base === branch.name);
  }
}

// Create branch object from branch name or pull request key
export function fillBranchLike(
  branch?: string,
  pullRequest?: string,
): Branch | PullRequest | undefined {
  if (branch) {
    return {
      isMain: false,
      name: branch,
    } as Branch;
  } else if (pullRequest) {
    return { base: '', branch: '', key: pullRequest, title: '' } as PullRequest;
  }
  return undefined;
}
