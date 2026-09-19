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
import { extractDashboardMeasureValue, formatDashboardMeasure } from '../dashboard-measures';

describe('extractDashboardMeasureValue', () => {
  it('returns undefined when the measure is missing', () => {
    expect(extractDashboardMeasureValue(undefined, false)).toBeUndefined();
  });

  it('returns the value for the overall scope', () => {
    expect(extractDashboardMeasureValue({ value: '10' }, false)).toBe('10');
  });

  it('returns the period value for the new-code scope', () => {
    expect(extractDashboardMeasureValue({ period: { value: '7' }, value: '10' }, true)).toBe('7');
  });

  it('falls back to the first leak period for the new-code scope', () => {
    expect(
      extractDashboardMeasureValue({ periods: [{ index: 1, value: '7' }], value: '10' }, true),
    ).toBe('7');
  });
});

describe('formatDashboardMeasure', () => {
  it('preserves percentage formatting options', () => {
    expect(formatDashboardMeasure(42.1234, MetricType.Percent, { decimals: 2 })).toBe('42.12%');
  });

  it.each([
    [12.34567, '12.3'],
    [1.2345, '1.23'],
    [1234567890, '1,234,567,890.0'],
  ])('formats float measure %s through the core formatter', (value, expected) => {
    expect(formatDashboardMeasure(value, MetricType.Float)).toBe(expected);
  });
});
