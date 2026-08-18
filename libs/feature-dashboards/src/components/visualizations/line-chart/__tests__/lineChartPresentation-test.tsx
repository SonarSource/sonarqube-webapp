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

import { render, screen } from '@testing-library/react';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { isRatingMetric } from '../../../../utils/lineChartMeasureTransformFlags';
import { formatDotValue, formatYAxisTick } from '../lineChartPresentation';

jest.mock('~adapters/helpers/dashboard-measures', () => ({
  formatDashboardMeasure: (value: unknown, type: string) => `${type}:${JSON.stringify(value)}`,
}));

jest.mock('@sonarsource/echoes-react', () => ({
  RatingBadge: ({ rating }: { rating: string }) => <span>{`badge:${rating}`}</span>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{`text:${JSON.stringify(children)}`}</span>
  ),
}));

describe('customDashboardLineChart lineChartPresentation', () => {
  describe('isRatingMetric', () => {
    it('returns true when metric type is rating', () => {
      expect(isRatingMetric(MetricKey.bugs, MetricType.Rating)).toBe(true);
    });

    it('returns true for *_rating metric keys when type is not rating', () => {
      expect(isRatingMetric(MetricKey.reliability_rating, MetricType.Integer)).toBe(true);
    });

    it('returns false when metric type is not rating and key is not *_rating', () => {
      expect(isRatingMetric(MetricKey.bugs, MetricType.Integer)).toBe(false);
      expect(isRatingMetric(MetricKey.bugs, undefined)).toBe(false);
    });
  });

  describe('formatYAxisTick', () => {
    it('uses rating formatting for rating metrics', () => {
      expect(formatYAxisTick(2, true)).toBe(`${MetricType.Rating}:2`);
    });

    it('uses integer formatting below 1M and compact short integer from 1M up', () => {
      expect(formatYAxisTick(10, false)).toBe(`${MetricType.Integer}:10`);
      expect(formatYAxisTick(100_000, false)).toBe(`${MetricType.Integer}:100000`);
      expect(formatYAxisTick(1_000_000, false)).toBe(`${MetricType.ShortInteger}:1000000`);
      expect(formatYAxisTick(10.25, false)).toBe(`${MetricType.Float}:10.25`);
    });
  });

  describe('formatDotValue', () => {
    it('renders a rating badge when metric is rating', () => {
      render(<>{formatDotValue(3, true)}</>);
      expect(screen.getByText('badge:RATING:3')).toBeInTheDocument();
    });

    it('renders highlighted text when metric is not rating', () => {
      render(<>{formatDotValue(42, false)}</>);
      expect(
        screen.getByText(`text:${JSON.stringify(`${MetricType.Integer}:42`)}`),
      ).toBeInTheDocument();
    });

    it('uses integer formatting for non-rating hover values below 1M', () => {
      render(<>{formatDotValue(250_000, false)}</>);
      expect(
        screen.getByText(`text:${JSON.stringify(`${MetricType.Integer}:250000`)}`),
      ).toBeInTheDocument();
    });

    it('uses compact formatting for non-rating hover values at 1M and above', () => {
      render(<>{formatDotValue(1_000_000, false)}</>);
      expect(
        screen.getByText(`text:${JSON.stringify(`${MetricType.ShortInteger}:1000000`)}`),
      ).toBeInTheDocument();
    });
  });
});
