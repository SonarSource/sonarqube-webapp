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

export enum ReleasePeriod {
  AllTime = 'all',
  Last30Days = '30d',
  Last6Months = '6m',
  LastYear = '1y',
}

/** A released version on the main branch, with its quality gate verdict at release time. */
export interface Release {
  analysisKey: string;
  date: Date;
  /** True when the quality gate was failing (ERROR) at release time. */
  isRisky: boolean;
  version: string;
}

export interface ReleaseStats {
  riskyCount: number;
  riskyPercent: number;
  safeCount: number;
  safePercent: number;
  total: number;
}
