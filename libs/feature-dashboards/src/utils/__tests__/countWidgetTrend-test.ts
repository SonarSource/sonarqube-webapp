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

import { MetricType } from '~shared/types/metrics';
import { computeTrendData, getHistoricalValuesForTrend } from '../countWidgetTrend';

jest.mock('~adapters/helpers/dashboard-measures', () => ({
  formatDashboardMeasure: (value: string | number) => String(value),
}));

describe('computeTrendData', () => {
  it('computes a percentage change and preserves the metric direction', () => {
    expect(
      computeTrendData({
        activityUrl: { pathname: '/activity' },
        currentValue: '12',
        measureFilters: undefined,
        metric: { direction: 1, type: MetricType.Integer },
        pastValue: '10',
      }),
    ).toEqual({
      activityUrl: { pathname: '/activity' },
      change: 2,
      formattedChange: '20',
      metricDirection: 1,
      past: 10,
      roundedChange: 20,
    });
  });

  it('formats an absolute change when the previous value is zero', () => {
    const absoluteChangeFormatter = jest.fn((change: number) => `absolute:${change}`);

    expect(
      computeTrendData({
        absoluteChangeFormatter,
        activityUrl: {},
        currentValue: '3',
        measureFilters: undefined,
        metric: { type: MetricType.Data },
        pastValue: '0',
      }),
    ).toMatchObject({
      change: 3,
      formattedChange: 'absolute:3',
      metricDirection: -1,
      past: 0,
      roundedChange: 3,
    });
    expect(absoluteChangeFormatter).toHaveBeenCalledWith(3);
  });
});

describe('getHistoricalValuesForTrend', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses valid history values for the current and previous trend points', () => {
    expect(
      getHistoricalValuesForTrend({
        measures: [
          {
            history: [
              { date: '2026-03-01T00:00:00Z', value: '4' },
              { date: 'not-a-date', value: 'invalid-date' },
              { date: '2026-04-20T00:00:00Z', value: '7' },
              { date: '2026-04-21T00:00:00Z' },
            ],
          },
        ],
      }),
    ).toEqual({ current: '7', past: '4' });
  });

  it('returns empty trend values when there is no history', () => {
    expect(getHistoricalValuesForTrend({ measures: [] })).toEqual({ current: null, past: null });
  });
});
