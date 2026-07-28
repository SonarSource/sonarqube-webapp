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
import { formatMeasure } from '../../../sonar-aligned/helpers/measures';
import { extractDashboardMeasureValue, formatDashboardMeasure } from '../dashboard-measures';

jest.mock('../../../sonar-aligned/helpers/measures', () => ({
  formatMeasure: jest.fn(),
}));

const mockedFormatMeasure = jest.mocked(formatMeasure);

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates formatting to the Server measure formatter', () => {
    const options = { decimals: 2, omitExtraDecimalZeros: true };
    mockedFormatMeasure.mockReturnValue('formatted');

    expect(formatDashboardMeasure(42, MetricType.Integer, options)).toBe('formatted');
    expect(mockedFormatMeasure).toHaveBeenCalledWith(42, MetricType.Integer, options);
  });
});
