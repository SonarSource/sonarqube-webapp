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

import { subDays, subMonths, subYears } from 'date-fns';
import { QGStatus } from '~shared/types/common';
import {
  AlertStatusHistoryItem,
  hasReleaseVersion,
  ReleaseAnalysis,
} from '~shared/types/quality-gate-history';
import { Release, ReleasePeriod, ReleaseStats } from './types';

/** A release is "risky" when its quality gate status was failing (ERROR) at release time. */
const RISKY_STATUS: QGStatus = 'ERROR';

/**
 * Joins released versions with the quality gate status that was effective at each release date.
 * The status is carried forward from the most recent analysis at or before the release date, so a
 * release is matched even if its exact analysis timestamp is not present in the measure history.
 *
 * Analyses without a real version (missing or the "not provided" sentinel) are not releases and
 * are excluded here. Releases whose quality gate has not been computed yet (e.g. a project's very
 * first analysis) are also excluded — they have no safe/risky verdict to show.
 */
export function joinReleases(
  versions: ReleaseAnalysis[],
  statusHistory: AlertStatusHistoryItem[],
): Release[] {
  const sortedHistory = [...statusHistory].sort((a, b) => a.date.getTime() - b.date.getTime());

  return [...versions]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .flatMap((analysis) => {
      // Analyses without a real version are not releases.
      if (!hasReleaseVersion(analysis.version)) {
        return [];
      }

      const status = getStatusAtDate(sortedHistory, analysis.date);

      if (status === undefined) {
        return [];
      }

      return [
        {
          analysisKey: analysis.analysisKey,
          date: analysis.date,
          version: analysis.version,
          isRisky: status === RISKY_STATUS,
        },
      ];
    });
}

function getStatusAtDate(
  sortedHistory: AlertStatusHistoryItem[],
  date: Date,
): QGStatus | undefined {
  let status: QGStatus | undefined;

  for (const item of sortedHistory) {
    const { date: itemDate, status: itemStatus } = item;

    if (itemDate.getTime() <= date.getTime()) {
      status = itemStatus;
    } else {
      break;
    }
  }

  return status;
}

/** The start date of a period, or `undefined` for {@link ReleasePeriod.AllTime}. */
function getPeriodStartDate(period: ReleasePeriod, now: Date): Date | undefined {
  switch (period) {
    case ReleasePeriod.Last30Days:
      return subDays(now, 30);
    case ReleasePeriod.Last6Months:
      return subMonths(now, 6);
    case ReleasePeriod.LastYear:
      return subYears(now, 1);
    case ReleasePeriod.AllTime:
    default:
      return undefined;
  }
}

export function filterReleasesByPeriod(
  releases: Release[],
  period: ReleasePeriod,
  now: Date,
): Release[] {
  const startDate = getPeriodStartDate(period, now);

  if (startDate === undefined) {
    return releases;
  }

  return releases.filter((release) => release.date.getTime() >= startDate.getTime());
}

export function computeStats(releases: Release[]): ReleaseStats {
  const total = releases.length;
  const riskyCount = releases.filter((release) => release.isRisky).length;
  const safeCount = total - riskyCount;

  if (total === 0) {
    return { total: 0, safeCount: 0, riskyCount: 0, safePercent: 0, riskyPercent: 0 };
  }

  const safePercent = Math.round((safeCount / total) * 100);

  return {
    total,
    safeCount,
    riskyCount,
    safePercent,
    riskyPercent: 100 - safePercent,
  };
}

/** The most recent release across all time, or `undefined` when there are no releases. */
export function getLastRelease(releases: Release[]): Release | undefined {
  return releases.reduce<Release | undefined>((latest, release) => {
    return latest === undefined || release.date.getTime() > latest.date.getTime()
      ? release
      : latest;
  }, undefined);
}
