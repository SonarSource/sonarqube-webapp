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

import { HistoryRange } from '../../data/widgets/line-chart';
import {
  addUTCDays,
  clampOrganizationsHistoryStartDate,
  dashboardHistoryDateRange,
  FORMAT_DAY_TIME,
  FORMAT_FULL,
  FORMAT_MONTH_DAY,
  FORMAT_MONTH_YEAR,
  formatDateDayTime,
  formatDateFull,
  getDateFormatOptions,
  getMttrCalendarMessage,
  getThirtyDayTrendValues,
  getThirtyDayTrendWindow,
  historySinceIsoDate,
  isDateInLineChartRange,
  issueHistoryTrendStartDate,
  lineChartSinceDate,
  MS_PER_DAY,
  organizationsHistoryEarliestAllowedStartDate,
  organizationsHistoryStartDateWithRetentionBuffer,
  startOfUTCDay,
  subUTCMonths,
  subUTCYears,
  THIRTY_DAYS_MS,
} from '../datetime';

describe('datetime', () => {
  const fixedNow = new Date('2026-06-25T12:00:00.000Z');

  it('defines a 30-day trend window from MS_PER_DAY', () => {
    expect(THIRTY_DAYS_MS).toBe(30 * MS_PER_DAY);
    expect(THIRTY_DAYS_MS).toBe(2_592_000_000);
  });

  describe('Generalized UTC Date Math', () => {
    it('startOfUTCDay sets UTC time to midnight', () => {
      const d = new Date('2026-06-25T15:45:30.123Z');
      expect(startOfUTCDay(d).toISOString()).toBe('2026-06-25T00:00:00.000Z');
    });

    it('subUTCMonths subtracts months in UTC', () => {
      const d = new Date('2026-06-25T12:00:00.000Z');
      expect(subUTCMonths(d, 2).toISOString()).toBe('2026-04-25T12:00:00.000Z');
    });

    it('subUTCMonths clamps to the last day of the target month', () => {
      const d = new Date('2026-07-31T12:00:00.000Z');
      expect(subUTCMonths(d, 1).toISOString()).toBe('2026-06-30T12:00:00.000Z');
    });

    it('subUTCYears subtracts years in UTC', () => {
      const d = new Date('2026-06-25T12:00:00.000Z');
      expect(subUTCYears(d, 1).toISOString()).toBe('2025-06-25T12:00:00.000Z');
    });

    it('addUTCDays adds days in UTC', () => {
      const d = new Date('2026-06-25T12:00:00.000Z');
      expect(addUTCDays(d, 5).toISOString()).toBe('2026-06-30T12:00:00.000Z');
    });
  });

  describe('historySinceIsoDate', () => {
    it('returns UTC midnight N months in the past', () => {
      const from = new Date('2026-06-25T15:45:30.123Z');
      expect(historySinceIsoDate(2, from)).toBe('2026-04-25T00:00:00.000Z');
    });

    it('clamps to a minimum of 1 month', () => {
      const from = new Date('2026-06-25T15:45:30.123Z');
      expect(historySinceIsoDate(0, from)).toBe('2026-05-25T00:00:00.000Z');
    });
  });

  describe('dashboardHistoryDateRange', () => {
    const endOfMonth = new Date('2026-03-31T12:00:00.000Z');

    it('uses retained history for zero and omitted snapshot durations', () => {
      expect(dashboardHistoryDateRange(undefined, endOfMonth)).toEqual({
        startDate: '2025-04-01T00:00:00.000Z',
      });
      expect(dashboardHistoryDateRange(0, endOfMonth)).toEqual(
        dashboardHistoryDateRange(undefined, endOfMonth),
      );
    });

    it('subtracts positive durations as UTC calendar months', () => {
      expect(dashboardHistoryDateRange(1, endOfMonth)).toEqual({
        startDate: '2026-02-28T00:00:00.000Z',
      });
    });

    it('clamps durations beyond API retention', () => {
      expect(dashboardHistoryDateRange(18, endOfMonth)).toEqual({
        startDate: '2025-04-01T00:00:00.000Z',
      });
    });

    it('rejects negative and fractional durations', () => {
      expect(() => dashboardHistoryDateRange(-1, endOfMonth)).toThrow(RangeError);
      expect(() => dashboardHistoryDateRange(1.5, endOfMonth)).toThrow(RangeError);
    });
  });

  describe('organizations history retention', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    it('computes earliest allowed start as UTC midnight one calendar year ago', () => {
      expect(organizationsHistoryEarliestAllowedStartDate()).toBe('2025-06-25T00:00:00.000Z');
    });

    it('adds a one-day buffer for max-retention start dates', () => {
      expect(organizationsHistoryStartDateWithRetentionBuffer()).toBe('2025-06-26T00:00:00.000Z');
    });

    it('clamps startDate to the retention buffer when before the one-year window', () => {
      expect(clampOrganizationsHistoryStartDate('2025-06-25T00:00:00.000Z')).toBe(
        '2025-06-26T00:00:00.000Z',
      );
      expect(clampOrganizationsHistoryStartDate('2025-06-27T00:00:00.000Z')).toBe(
        '2025-06-27T00:00:00.000Z',
      );
    });
  });

  describe('isDateInLineChartRange', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns true when the point lies inside the rolling window', () => {
      expect(
        isDateInLineChartRange(new Date('2026-06-10T12:00:00.000Z'), HistoryRange.LastMonth),
      ).toBe(true);
    });

    it('returns false when the point is before the window start', () => {
      expect(
        isDateInLineChartRange(new Date('2020-01-01T12:00:00.000Z'), HistoryRange.LastMonth),
      ).toBe(false);
    });

    it('returns false when the point is after today', () => {
      expect(
        isDateInLineChartRange(new Date('2030-01-01T12:00:00.000Z'), HistoryRange.LastMonth),
      ).toBe(false);
    });

    it('treats All as the last 12 months for client-side filtering', () => {
      expect(isDateInLineChartRange(new Date('2025-07-01T12:00:00.000Z'), HistoryRange.All)).toBe(
        true,
      );
      expect(isDateInLineChartRange(new Date('2025-06-01T12:00:00.000Z'), HistoryRange.All)).toBe(
        false,
      );
    });

    it('correctly handles month overflow edge cases (e.g. March 31 - 1 month = Feb 28/29)', () => {
      // Set local time to March 31, 2024 (a leap year)
      jest.setSystemTime(new Date(2024, 2, 31, 12, 0, 0));

      // 1 month before March 31 should be Feb 29, not March 2 or 3
      expect(isDateInLineChartRange(new Date(2024, 1, 29, 12, 0, 0), HistoryRange.LastMonth)).toBe(
        true,
      );
      expect(isDateInLineChartRange(new Date(2024, 1, 28, 12, 0, 0), HistoryRange.LastMonth)).toBe(
        false,
      );
    });
  });

  describe('lineChartSinceDate', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns ISO midnight at least one month back', () => {
      const iso = lineChartSinceDate(HistoryRange.LastMonth);
      expect(iso.endsWith('T00:00:00.000Z')).toBe(true);
      expect(new Date(iso).getUTCMonth()).toBe(4);
    });

    it('clamps All and Last12Months to the buffered one-year retention window', () => {
      expect(lineChartSinceDate(HistoryRange.All)).toBe('2025-06-26T00:00:00.000Z');
      expect(lineChartSinceDate(HistoryRange.Last12Months)).toBe('2025-06-26T00:00:00.000Z');
    });

    it('subtracts six months for Last6Months without retention clamping', () => {
      const iso = lineChartSinceDate(HistoryRange.Last6Months);
      expect(iso.endsWith('T00:00:00.000Z')).toBe(true);
      expect(new Date(iso).getUTCMonth()).toBe(11);
      expect(new Date(iso).getUTCFullYear()).toBe(2025);
    });
  });

  describe('getDateFormatOptions', () => {
    it('returns FORMAT_FULL when there are not enough ticks', () => {
      expect(getDateFormatOptions([])).toBe(FORMAT_FULL);
    });

    it('returns FORMAT_DAY_TIME when there are duplicate days', () => {
      const ticks = [new Date('2026-06-25T12:00:00.000Z'), new Date('2026-06-25T13:00:00.000Z')];
      expect(getDateFormatOptions(ticks)).toBe(FORMAT_DAY_TIME);
    });

    it('returns FORMAT_MONTH_DAY when there are duplicate month-year combinations', () => {
      const ticks = [new Date('2026-06-25T12:00:00.000Z'), new Date('2026-06-26T12:00:00.000Z')];
      expect(getDateFormatOptions(ticks)).toBe(FORMAT_MONTH_DAY);
    });

    it('returns FORMAT_MONTH_DAY for short ranges', () => {
      const ticks = [new Date('2026-06-01T12:00:00.000Z'), new Date('2026-07-01T12:00:00.000Z')];
      expect(getDateFormatOptions(ticks)).toBe(FORMAT_MONTH_DAY);
    });

    it('returns FORMAT_MONTH_YEAR for longer ranges', () => {
      const ticks = [new Date('2026-01-01T12:00:00.000Z'), new Date('2026-07-01T12:00:00.000Z')];
      expect(getDateFormatOptions(ticks)).toBe(FORMAT_MONTH_YEAR);
    });
  });

  describe('formatDateFull', () => {
    it('formats date correctly', () => {
      const date = new Date('2026-06-25T12:00:00.000Z');
      expect(formatDateFull(date)).toBe(date.toLocaleString(undefined, FORMAT_FULL));
    });
  });

  describe('formatDateDayTime', () => {
    it('formats date correctly', () => {
      const date = new Date('2026-06-25T12:00:00.000Z');
      expect(formatDateDayTime(date)).toBe(date.toLocaleString(undefined, FORMAT_DAY_TIME));
    });
  });

  describe('issueHistoryTrendStartDate', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns UTC midnight 30 days in the past', () => {
      const iso = issueHistoryTrendStartDate();
      expect(iso).toBe('2026-05-26T00:00:00.000Z');
    });
  });

  describe('getThirtyDayTrendValues', () => {
    const toTs = (p: { t: number; v: string }) => p.t;
    const toVal = (p: { t: number; v: string }) => p.v;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns nulls for empty input', () => {
      expect(getThirtyDayTrendValues([], toTs, toVal)).toEqual({ current: null, past: null });
    });

    it('returns nulls when all timestamps are NaN', () => {
      expect(getThirtyDayTrendValues([{ t: Number.NaN, v: 'x' }], toTs, toVal)).toEqual({
        current: null,
        past: null,
      });
    });

    it('returns the single point as both current and past when only one valid point exists', () => {
      const points = [{ t: new Date('2026-03-29T00:00:00.000Z').getTime(), v: '5' }];
      expect(getThirtyDayTrendValues(points, toTs, toVal)).toEqual({ current: '5', past: '5' });
    });

    it('uses latest point as current and latest older-than-30-days point as past', () => {
      const points = [
        { t: new Date('2026-01-10T00:00:00.000Z').getTime(), v: '1' },
        { t: new Date('2026-02-20T00:00:00.000Z').getTime(), v: '4' },
        { t: new Date('2026-03-20T00:00:00.000Z').getTime(), v: '7' },
      ];
      expect(getThirtyDayTrendValues(points, toTs, toVal)).toEqual({ current: '7', past: '4' });
    });

    it('falls back to oldest point when no point is older than 30 days', () => {
      const points = [
        { t: new Date('2026-03-15T00:00:00.000Z').getTime(), v: '2' },
        { t: new Date('2026-03-20T00:00:00.000Z').getTime(), v: '5' },
      ];
      expect(getThirtyDayTrendValues(points, toTs, toVal)).toEqual({ current: '5', past: '2' });
    });
  });

  describe('getMttrCalendarMessage', () => {
    describe('< 60 minutes → mttr.x_minutes', () => {
      it('formats 0 minutes', () => {
        expect(getMttrCalendarMessage(0)).toEqual({ id: 'mttr.x_minutes', values: { value: 0 } });
      });

      it('formats 1 minute', () => {
        expect(getMttrCalendarMessage(1)).toEqual({ id: 'mttr.x_minutes', values: { value: 1 } });
      });

      it('formats 45 minutes', () => {
        expect(getMttrCalendarMessage(45)).toEqual({
          id: 'mttr.x_minutes',
          values: { value: 45 },
        });
      });

      it('formats 59 minutes', () => {
        expect(getMttrCalendarMessage(59)).toEqual({
          id: 'mttr.x_minutes',
          values: { value: 59 },
        });
      });

      it('rounds fractional minutes', () => {
        expect(getMttrCalendarMessage(45.6)).toEqual({
          id: 'mttr.x_minutes',
          values: { value: 46 },
        });
      });
    });

    describe('60 min – < 24h → mttr.x_hour(s)', () => {
      it('formats exactly 1 hour', () => {
        expect(getMttrCalendarMessage(60)).toEqual({ id: 'mttr.x_hour', values: { value: 1 } });
      });

      it('formats 3.5 hours (210 min)', () => {
        expect(getMttrCalendarMessage(210)).toEqual({
          id: 'mttr.x_hours',
          values: { value: 3.5 },
        });
      });

      it('formats 23 hours', () => {
        expect(getMttrCalendarMessage(23 * 60)).toEqual({
          id: 'mttr.x_hours',
          values: { value: 23 },
        });
      });

      it('promotes to 1 day when rounding reaches 24h (1438 min)', () => {
        expect(getMttrCalendarMessage(1438)).toEqual({ id: 'mttr.x_day', values: { value: 1 } });
      });

      it('omits trailing zero in decimal', () => {
        expect(getMttrCalendarMessage(120)).toEqual({ id: 'mttr.x_hours', values: { value: 2 } });
      });
    });

    describe('24h – < 1 month → mttr.x_day(s)', () => {
      it('formats exactly 24 hours as 1 day', () => {
        expect(getMttrCalendarMessage(24 * 60)).toEqual({ id: 'mttr.x_day', values: { value: 1 } });
      });

      it('formats 4.2 days', () => {
        expect(getMttrCalendarMessage(4.2 * 24 * 60)).toEqual({
          id: 'mttr.x_days',
          values: { value: 4.2 },
        });
      });

      it('omits trailing zero in decimal', () => {
        expect(getMttrCalendarMessage(3 * 24 * 60)).toEqual({
          id: 'mttr.x_days',
          values: { value: 3 },
        });
      });

      it('formats 30 days (just below one average month)', () => {
        expect(getMttrCalendarMessage(30 * 24 * 60)).toEqual({
          id: 'mttr.x_days',
          values: { value: 30 },
        });
      });
    });

    describe('1 month – < 1 year → mttr.x_month(s)', () => {
      it('formats one average month', () => {
        expect(getMttrCalendarMessage(30.44 * 24 * 60)).toEqual({
          id: 'mttr.x_month',
          values: { value: 1 },
        });
      });

      it('formats 6 months (~182.6 days)', () => {
        expect(getMttrCalendarMessage(Math.round(6 * 30.44) * 24 * 60)).toEqual({
          id: 'mttr.x_months',
          values: { value: 6 },
        });
      });

      it('formats 4.2 months', () => {
        expect(getMttrCalendarMessage(Math.round(4.2 * 30.44) * 24 * 60)).toEqual({
          id: 'mttr.x_months',
          values: { value: 4.2 },
        });
      });

      it('formats 363 days (just below one year)', () => {
        expect(getMttrCalendarMessage(363 * 24 * 60)).toEqual({
          id: 'mttr.x_months',
          values: { value: 11.9 },
        });
      });

      it('promotes to 1 year when rounding reaches 12 months (364 days)', () => {
        expect(getMttrCalendarMessage(364 * 24 * 60)).toEqual({
          id: 'mttr.x_year',
          values: { value: 1 },
        });
      });
    });

    describe('>= 1 year → mttr.x_year(s)', () => {
      it('formats exactly 365 days as singular 1 year', () => {
        expect(getMttrCalendarMessage(365 * 24 * 60)).toEqual({
          id: 'mttr.x_year',
          values: { value: 1 },
        });
      });

      it('formats exactly 730 days as 2 years', () => {
        expect(getMttrCalendarMessage(730 * 24 * 60)).toEqual({
          id: 'mttr.x_years',
          values: { value: 2 },
        });
      });

      it('formats 2700 days (~7.4 years)', () => {
        expect(getMttrCalendarMessage(2700 * 24 * 60)).toEqual({
          id: 'mttr.x_years',
          values: { value: 7.4 },
        });
      });
    });

    describe('compact chart labels', () => {
      it('abbreviates units', () => {
        expect(getMttrCalendarMessage(210, { compact: true })).toEqual({
          id: 'mttr.short.x_hours',
          values: { value: 3.5 },
        });
        expect(getMttrCalendarMessage(4.2 * 24 * 60, { compact: true })).toEqual({
          id: 'mttr.short.x_days',
          values: { value: 4.2 },
        });
        expect(getMttrCalendarMessage(6 * 30.44 * 24 * 60, { compact: true })).toEqual({
          id: 'mttr.short.x_months',
          values: { value: 6 },
        });
      });

      it('converts long month spans to abbreviated years', () => {
        expect(getMttrCalendarMessage(22.8 * 30.44 * 24 * 60, { compact: true })).toEqual({
          id: 'mttr.short.x_years',
          values: { value: 1.9 },
        });
      });
    });
  });

  describe('getThirtyDayTrendWindow', () => {
    const toTs = (p: { t: number }) => p.t;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns an empty array when there are no valid timestamps', () => {
      expect(getThirtyDayTrendWindow([{ t: Number.NaN }], toTs)).toEqual([]);
    });

    it('includes only the comparison baseline and newer points', () => {
      const old = { t: new Date('2026-01-10T00:00:00.000Z').getTime() };
      const baseline = { t: new Date('2026-02-20T00:00:00.000Z').getTime() };
      const recent = { t: new Date('2026-03-20T00:00:00.000Z').getTime() };
      expect(getThirtyDayTrendWindow([old, baseline, recent], toTs)).toEqual([baseline, recent]);
    });

    it('returns all points when none is older than 30 days', () => {
      const points = [
        { t: new Date('2026-03-15T00:00:00.000Z').getTime() },
        { t: new Date('2026-03-20T00:00:00.000Z').getTime() },
      ];
      expect(getThirtyDayTrendWindow(points, toTs)).toEqual(points);
    });
  });
});
