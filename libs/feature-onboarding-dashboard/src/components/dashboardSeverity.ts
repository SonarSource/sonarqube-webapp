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

import { cssVar } from '@sonarsource/echoes-react';
import { OnboardingChecklist } from '~shared/types/onboarding';
import { DISCOVER_MILESTONE_ID } from './dashboardConstants';

/**
 * Clamps `value` to the [0, 100] range.
 * Shared by progress bars and displayed labels to guarantee consistent capping.
 */
export function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Cohort colors from the Figma onboarding spec. Echoes does not expose palette tokens via
 * `cssVar`, so the palette hex values are defined here (same approach as platformConfig).
 * 0% is a distinct "no data" state rendered with a neutral token.
 */
const COLOR_NO_DATA = cssVar('color-background-neutral-bolder-default');
const COLOR_1_24 = '#f04438'; // palette/red/500
const COLOR_25_49 = '#fd7122'; // palette/orange/400
const COLOR_50_74 = '#f5b840'; // palette/yellow/500
const COLOR_75_99 = '#b3dd86'; // palette/green/400
const COLOR_100 = '#82b73c'; // palette/green/600

/**
 * Maps a completion percentage to its cohort color. Lower completion is more severe (further
 * from the goal), so the importance of reaching it is conveyed more strongly:
 *   0 → no data, [1,25) → red, [25,50) → orange, [50,75) → yellow, [75,100) → green/400, 100 → green/600.
 *
 * Reuse this for any dashboard progress bar that should be colored by how close it is
 * to its target, rather than by a categorical status.
 */
export function getSeverityColorForPercent(percent: number): string {
  if (percent <= 0) {
    return COLOR_NO_DATA;
  }
  if (percent < 25) {
    return COLOR_1_24;
  }
  if (percent < 50) {
    return COLOR_25_49;
  }
  if (percent < 75) {
    return COLOR_50_74;
  }
  if (percent < 100) {
    return COLOR_75_99;
  }
  return COLOR_100;
}

/**
 * Overall onboarding progress: the average completion across all checklist milestones, rounded to
 * a whole percent. Discovery is automatic (and ~always 100%), so it is excluded — overall progress
 * reflects only the milestones the user actively drives.
 */
export function getOverallProgressPercent(checklist: OnboardingChecklist): number {
  const actionableItems = checklist.items.filter((item) => item.id !== DISCOVER_MILESTONE_ID);
  const clampedSum = actionableItems.reduce(
    (acc, item) => acc + clampPercent(item.completionPct ?? 0),
    0,
  );
  const overall = actionableItems.length === 0 ? 0 : clampedSum / actionableItems.length;
  return Math.round(overall);
}
