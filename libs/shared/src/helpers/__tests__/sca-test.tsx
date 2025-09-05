/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { renderHook } from '@testing-library/react';
import { MetricKey, MetricType } from '../../types/metrics';
import { ReleaseRiskSeverity } from '../../types/sca';
import {
  augmentMetrics,
  getScaRiskMetricThresholds,
  scaConditionOperator,
  scaFilterConditionsBySeverity,
  useScaOverviewMetrics,
} from '../sca';

describe('getScaRiskMetricThresholds', () => {
  it('should return license risk thresholds for licensing metrics', () => {
    const result = getScaRiskMetricThresholds(MetricKey.sca_severity_licensing);
    expect(result).toEqual({ '19': ReleaseRiskSeverity.High });
  });

  it('should return default risk thresholds for non-licensing metrics', () => {
    const result = getScaRiskMetricThresholds(MetricKey.sca_severity_vulnerability);
    expect(result).toHaveProperty('4', ReleaseRiskSeverity.Info);
  });
});

describe('scaConditionOperator', () => {
  it('should return GTE for severity metrics', () => {
    const result = scaConditionOperator(MetricKey.sca_severity_vulnerability);
    expect(result).toBe('GTE');
  });

  it('should return null for non-severity metrics', () => {
    const result = scaConditionOperator(MetricKey.sca_rating_vulnerability);
    expect(result).toBeNull();
  });
});

describe('scaFilterConditionsBySeverity', () => {
  it('should return severities greater than or equal to threshold', () => {
    const result = scaFilterConditionsBySeverity('15');
    expect(result).toContain(ReleaseRiskSeverity.Medium);
    expect(result).toContain(ReleaseRiskSeverity.High);
    expect(result).toContain(ReleaseRiskSeverity.Blocker);
  });
});

describe('useScaOverviewMetrics', () => {
  it('should return metrics when hasSca is true', () => {
    const { result } = renderHook(() => useScaOverviewMetrics(true));
    expect(result.current).toContain(MetricKey.sca_count_any_issue);
    expect(result.current).toContain(MetricKey.sca_rating_any_issue);
  });

  it('should return empty array when hasSca is false', () => {
    const { result } = renderHook(() => useScaOverviewMetrics(false));
    expect(result.current).toEqual([]);
  });
});

describe('augmentMetrics', () => {
  it('should change metric type for SCA severity metrics', () => {
    const result = augmentMetrics([
      { key: MetricKey.sca_severity_vulnerability, name: '', type: '' },
    ]);
    expect(result[0].type).toBe(MetricType.ScaRisk);
  });

  it('should not change metric type for non-SCA severity metrics', () => {
    const result = augmentMetrics([{ key: MetricKey.new_sca_count_any_issue, name: '', type: '' }]);
    expect(result[0].type).not.toBe(MetricType.ScaRisk);
  });
});
