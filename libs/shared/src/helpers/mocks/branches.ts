/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
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

import { BranchBase, PullRequest } from '../../types/branch-like';

export function mockMainBranch(overrides: Partial<BranchBase> = {}): BranchBase {
  return {
    analysisDate: '2018-01-01',
    isMain: true,
    name: 'master',
    branchId: '123',
    ...overrides,
  };
}

export function mockPullRequest(overrides: Partial<PullRequest> = {}): PullRequest {
  return {
    analysisDate: '2018-01-01',
    base: 'master',
    branch: 'feature/foo/bar',
    pullRequestUuidV1: 'pr-id',
    pullRequestId: 'pr-uuid-v4-id',
    key: '1001',
    target: 'master',
    title: 'Foo Bar feature',
    ...overrides,
  };
}
