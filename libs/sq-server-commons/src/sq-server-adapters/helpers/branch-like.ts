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

import { isBranch, isMainBranch, isPullRequest } from '~shared/helpers/branch-like';
import { BranchLikeBase } from '~shared/types/branch-like';

export function isSameBranchLike(a: BranchLikeBase | undefined, b: BranchLikeBase | undefined) {
  // main branches are always equal
  if (isMainBranch(a) && isMainBranch(b)) {
    return true;
  }

  // branches are compared by name
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
