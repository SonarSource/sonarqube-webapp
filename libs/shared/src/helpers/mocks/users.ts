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

import { LoggedInUserShared } from '../../types/users';

/**
 * Shared mock for LoggedInUser with all product-specific properties optional.
 *
 * Common properties (all products):
 * - groups, isLoggedIn, id, login, name
 *
 * SQ Server specific (optional):
 * - scmAccounts: Source control accounts
 * - dismissedNotices: UI notice dismissals
 *
 * SQ Cloud specific (optional):
 * - externalIdentity: ALM identity
 * - externalProvider: ALM provider (GitHub, GitLab, etc.)
 * - createdAt: Account creation timestamp
 * - email: User email address
 */
export function mockLoggedInUser(overrides: Partial<LoggedInUserShared> = {}): LoggedInUserShared {
  return {
    groups: [],
    isLoggedIn: true,
    id: 'luke',
    login: 'luke',
    name: 'Skywalker',
    ...overrides,
  };
}
