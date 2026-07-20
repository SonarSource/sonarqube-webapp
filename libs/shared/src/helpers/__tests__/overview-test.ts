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

import { MetricKey } from '../../types/metrics';
import {
  getMeasurementLinesMetricKey,
  getMeasurementMetricKey,
  MeasurementType,
} from '../overview';

describe('getMeasurementMetricKey', () => {
  describe('Coverage', () => {
    it('returns new_coverage when useDiffMetric is true', () => {
      const result = getMeasurementMetricKey(MeasurementType.Coverage, true);
      expect(result).toBe(MetricKey.new_coverage);
    });

    it('returns coverage when useDiffMetric is false', () => {
      const result = getMeasurementMetricKey(MeasurementType.Coverage, false);
      expect(result).toBe(MetricKey.coverage);
    });
  });

  describe('Duplication', () => {
    it('returns new_duplicated_lines_density when useDiffMetric is true', () => {
      const result = getMeasurementMetricKey(MeasurementType.Duplication, true);
      expect(result).toBe(MetricKey.new_duplicated_lines_density);
    });

    it('returns duplicated_lines_density when useDiffMetric is false', () => {
      const result = getMeasurementMetricKey(MeasurementType.Duplication, false);
      expect(result).toBe(MetricKey.duplicated_lines_density);
    });
  });
});

describe('getMeasurementLinesMetricKey', () => {
  describe('Coverage', () => {
    it('returns new_lines_to_cover when useDiffMetric is true', () => {
      const result = getMeasurementLinesMetricKey(MeasurementType.Coverage, true);
      expect(result).toBe(MetricKey.new_lines_to_cover);
    });

    it('returns lines_to_cover when useDiffMetric is false', () => {
      const result = getMeasurementLinesMetricKey(MeasurementType.Coverage, false);
      expect(result).toBe(MetricKey.lines_to_cover);
    });
  });

  describe('Duplication', () => {
    it('returns new_lines when useDiffMetric is true', () => {
      const result = getMeasurementLinesMetricKey(MeasurementType.Duplication, true);
      expect(result).toBe(MetricKey.new_lines);
    });

    it('returns lines when useDiffMetric is false', () => {
      const result = getMeasurementLinesMetricKey(MeasurementType.Duplication, false);
      expect(result).toBe(MetricKey.lines);
    });
  });
});
