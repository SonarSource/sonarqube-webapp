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

import { QGStatus } from './common';

/**
 * Backend sentinel returned as `projectVersion` for analyses that don't set `sonar.projectVersion`.
 * Such analyses are not real releases and must be excluded.
 */
const VERSION_NOT_PROVIDED = 'not provided';

/** Whether an analysis carries a real release version (excludes missing / sentinel values). */
export function hasReleaseVersion(version?: string): version is string {
  return version !== undefined && version !== VERSION_NOT_PROVIDED;
}

/**
 * A version released on the main branch (an analysis carrying a VERSION event).
 */
export interface ReleaseAnalysis {
  analysisKey: string;
  date: Date;
  /** May be missing or the "not provided" sentinel; use {@link hasReleaseVersion} to validate. */
  version?: string;
}

/**
 * A single point of the `alert_status` (quality gate status) measure history,
 * one per analysis on the main branch.
 */
export interface AlertStatusHistoryItem {
  date: Date;
  /** Quality gate status at this analysis. Undefined when not computed. */
  status?: QGStatus;
}
