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

import {
  issueHistoryLatestValue,
  issueHistoryToSparklineSeries,
  issueHistoryToTrend,
} from '../organizationIssueHistoryWidgetData';

describe('issueHistoryLatestValue', () => {
  it('returns null when there is no history', () => {
    expect(issueHistoryLatestValue(undefined)).toBeNull();
    expect(issueHistoryLatestValue([])).toBeNull();
  });

  it('returns the "all"-bucket value from the latest day', () => {
    const days = [
      { date: '2026-01-10', distribution: [{ key: 'all', value: 0.25 }] },
      { date: '2026-03-20', distribution: [{ key: 'all', value: 0.18 }] },
    ];

    expect(issueHistoryLatestValue(days)).toBe(0.18);
  });

  it('returns null when the latest day has no "all" bucket', () => {
    const days = [{ date: '2026-03-20', distribution: [{ key: 'HIGH', value: 0.12 }] }];

    expect(issueHistoryLatestValue(days)).toBeNull();
  });
});

describe('issueHistoryToSparklineSeries', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns an empty array when there is no history', () => {
    expect(issueHistoryToSparklineSeries(undefined)).toEqual([]);
    expect(issueHistoryToSparklineSeries([])).toEqual([]);
  });

  it('includes the last pre-window anchor point followed by in-window values in chronological order', () => {
    const days = [
      { date: '2026-04-01T00:00:00Z', distribution: [{ key: 'all', value: 0.1 }] },
      { date: '2026-04-28T00:00:00Z', distribution: [{ key: 'all', value: 0.2 }] },
      { date: '2025-01-01T00:00:00Z', distribution: [{ key: 'all', value: 0.99 }] },
    ];

    expect(issueHistoryToSparklineSeries(days)).toEqual([0.99, 0.1, 0.2]);
  });

  it('uses 0 when the "all" bucket is absent for a day in the window', () => {
    const days = [{ date: '2026-04-28T00:00:00Z', distribution: [{ key: 'HIGH', value: 0.5 }] }];

    expect(issueHistoryToSparklineSeries(days)).toEqual([0]);
  });
});

describe('issueHistoryToTrend', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns nulls when there is no history', () => {
    expect(issueHistoryToTrend(undefined)).toEqual({ current: null, past: null });
    expect(issueHistoryToTrend([])).toEqual({ current: null, past: null });
  });

  it('computes current and past from the "all" bucket using the 30-day cutoff', () => {
    const days = [
      { date: '2026-01-10T00:00:00Z', distribution: [{ key: 'all', value: 0.5 }] },
      { date: '2026-02-20T00:00:00Z', distribution: [{ key: 'all', value: 0.8 }] },
      { date: '2026-03-20T00:00:00Z', distribution: [{ key: 'all', value: 0.25 }] },
    ];

    expect(issueHistoryToTrend(days)).toEqual({ current: '0.25', past: '0.8' });
  });

  it('falls back to the oldest point when no point is older than 30 days', () => {
    const days = [
      { date: '2026-03-15T00:00:00Z', distribution: [{ key: 'all', value: 0.4 }] },
      { date: '2026-03-25T00:00:00Z', distribution: [{ key: 'all', value: 0.9 }] },
    ];

    expect(issueHistoryToTrend(days)).toEqual({ current: '0.9', past: '0.4' });
  });

  it('uses 0 for a day whose "all" bucket is absent', () => {
    const days = [
      { date: '2026-01-10T00:00:00Z', distribution: [] },
      { date: '2026-03-20T00:00:00Z', distribution: [{ key: 'all', value: 0.6 }] },
    ];

    expect(issueHistoryToTrend(days)).toEqual({ current: '0.6', past: '0' });
  });
});
