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

import { QGStatus } from './common';

/**
 * For Web API V2, use BranchLikeParameters instead
 */
export type BranchParameters = { branch?: string } | { pullRequest?: string };

export type BranchLikeParameters = { branchKey?: string } | { pullRequestKey?: string };

export type BranchLikeBase = BranchBase | PullRequestBase;

export interface BranchBase {
  analysisDate?: string;
  isMain: boolean;
  name: string;
  status?: { qualityGateStatus: QGStatus };
}

export interface Commit {
  author?: CommitAuthor;
  date?: string;
  message?: string;
  sha: string;
}

export interface CommitAuthor {
  avatar?: string;
  login?: string;
  name: string;
}

export interface PullRequest extends PullRequestBase {
  commit?: Commit;
  contributors?: CommitAuthor[];
  pullRequestUuidV1?: string;
}

export interface PullRequestBase {
  analysisDate?: string;
  base: string;
  branch: string;
  isOrphan?: boolean;
  key: string;
  status?: { qualityGateStatus: QGStatus };
  target: string;
  title: string;
  url?: string;
}
