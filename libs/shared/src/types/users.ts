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

export interface UserBaseShared {
  active?: boolean;
  avatar?: string;
  email?: string | null;
  login: string;
  name?: string;
}

export interface CurrentUser {
  /**
   * SQS only feature
   */
  dismissedNotices?: { [key: string]: boolean };
  email?: string;
  isLoggedIn: boolean;
  permissions?: { global: string[] };
}

export interface UserActiveShared extends UserBaseShared {
  active?: true;
  name: string;
}

export interface LoggedInUserShared extends CurrentUser, UserActiveShared {
  email?: string;
  externalIdentity?: string;
  externalProvider?: string;
  groups: string[];
  isLoggedIn: true;
}
