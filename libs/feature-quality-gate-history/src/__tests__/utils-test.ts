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

import { QGStatus } from '~shared/types/common';
import { AlertStatusHistoryItem, ReleaseAnalysis } from '~shared/types/quality-gate-history';
import { Release, ReleasePeriod } from '../types';
import { computeStats, filterReleasesByPeriod, getLastRelease, joinReleases } from '../utils';

function release(version: string, date: string, isRisky: boolean): Release {
  return { analysisKey: version, date: new Date(date), isRisky, version };
}

describe('joinReleases', () => {
  const versions: ReleaseAnalysis[] = [
    { analysisKey: 'a3', date: new Date('2026-04-01'), version: 'v3' },
    { analysisKey: 'a1', date: new Date('2025-12-31'), version: 'v1' },
    { analysisKey: 'a2', date: new Date('2026-02-01'), version: 'v2' },
  ];

  const statusHistory: AlertStatusHistoryItem[] = [
    { date: new Date('2026-01-15'), status: 'OK' },
    { date: new Date('2026-03-01'), status: 'ERROR' },
    // Legacy 'WARN' can still arrive from the API at runtime (cast by the adapter); treated as safe.
    { date: new Date('2026-03-20'), status: 'WARN' as QGStatus },
  ];

  it('sorts releases ascending and carries the gate status forward to each release date', () => {
    const releases = joinReleases(versions, statusHistory);

    // v1 (Dec 31 2025) predates any computed status -> excluded (no verdict yet)
    expect(releases.map((r) => r.version)).toEqual(['v2', 'v3']);
    // v2 (Feb 1) inherits the last OK status (Jan 15) -> safe
    expect(releases[0].isRisky).toBe(false);
    // v3 (Apr 1) inherits the last WARN status (Mar 20) -> safe (only ERROR is risky)
    expect(releases[1].isRisky).toBe(false);
  });

  it('excludes releases whose quality gate has not been computed yet', () => {
    const releases = joinReleases(
      [
        { analysisKey: 'a1', date: new Date('2026-01-01'), version: 'v1' },
        { analysisKey: 'a2', date: new Date('2026-03-10'), version: 'v2' },
      ],
      // No history entry at/before v1, and only an undefined-status point at v2's date.
      [{ date: new Date('2026-03-10'), status: undefined }],
    );

    expect(releases).toHaveLength(0);
  });

  it('marks a release risky only when the carried-forward status is ERROR', () => {
    const releases = joinReleases(
      [{ analysisKey: 'a', date: new Date('2026-03-10'), version: 'v9' }],
      statusHistory,
    );

    // Mar 10 inherits the ERROR status from Mar 1
    expect(releases[0].isRisky).toBe(true);
  });

  it('excludes analyses without a real version (the "not provided" sentinel)', () => {
    const releases = joinReleases(
      [
        { analysisKey: 'a1', date: new Date('2026-02-01'), version: 'not provided' },
        { analysisKey: 'a2', date: new Date('2026-03-01'), version: 'v2' },
      ],
      statusHistory,
    );

    expect(releases.map((r) => r.version)).toEqual(['v2']);
  });
});

describe('computeStats', () => {
  it('counts and rounds safe/risky percentages that always sum to 100', () => {
    const releases = [
      release('v1', '2026-01-01', false),
      release('v2', '2026-02-01', false),
      release('v3', '2026-03-01', true),
    ];

    expect(computeStats(releases)).toEqual({
      total: 3,
      safeCount: 2,
      riskyCount: 1,
      safePercent: 67,
      riskyPercent: 33,
    });
  });

  it('returns zeros for an empty list without dividing by zero', () => {
    expect(computeStats([])).toEqual({
      total: 0,
      safeCount: 0,
      riskyCount: 0,
      safePercent: 0,
      riskyPercent: 0,
    });
  });
});

describe('filterReleasesByPeriod', () => {
  const now = new Date('2026-06-26T00:00:00Z');
  const releases = [
    release('old', '2024-01-01', false),
    release('lastYear', '2025-12-01', false),
    release('recent', '2026-06-10', true),
  ];

  it('returns every release for the AllTime period', () => {
    expect(filterReleasesByPeriod(releases, ReleasePeriod.AllTime, now)).toHaveLength(3);
  });

  it('keeps only releases within the last 30 days', () => {
    const result = filterReleasesByPeriod(releases, ReleasePeriod.Last30Days, now);

    expect(result.map((r) => r.version)).toEqual(['recent']);
  });

  it('keeps releases within the last year', () => {
    const result = filterReleasesByPeriod(releases, ReleasePeriod.LastYear, now);

    expect(result.map((r) => r.version)).toEqual(['lastYear', 'recent']);
  });
});

describe('getLastRelease', () => {
  it('returns the most recent release regardless of input order', () => {
    const releases = [
      release('v1', '2026-01-01', false),
      release('v3', '2026-03-01', true),
      release('v2', '2026-02-01', false),
    ];

    expect(getLastRelease(releases)?.version).toBe('v3');
  });

  it('returns undefined when there are no releases', () => {
    expect(getLastRelease([])).toBeUndefined();
  });
});
