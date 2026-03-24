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

// Keep this enum in the correct order (most severe to least severe).

export enum IssueSeverity {
  Blocker = 'BLOCKER',
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR',
  Info = 'INFO',
}

/**
 * Issue statuses used on SonarCloud and in shared frontend types.
 * SonarQube Server also supports `IN_SANDBOX` for the issues sandbox; that value is defined on
 * `IssueStatus` in `libs/sq-server-commons` (not here).
 */
export enum IssueStatus {
  Open = 'OPEN',
  Fixed = 'FIXED',
  Confirmed = 'CONFIRMED',
  Accepted = 'ACCEPTED',
  FalsePositive = 'FALSE_POSITIVE',
}
