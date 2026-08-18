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

import { MetricKey } from '~shared/types/metrics';
import {
  DashboardMetricType,
  RichMetricKey,
  type DashboardMetric,
} from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import {
  getMeasureFilterCapability,
  getMeasureFilterCapabilityForDashboardMetric,
} from '../measureFilterConfig';

describe('measureFilterConfig', () => {
  describe('getMeasureFilterCapability', () => {
    it('marks violations as drillable with all filter dimensions', () => {
      expect(getMeasureFilterCapability(MetricKey.violations)).toEqual({
        isDrillable: true,
        supportsSeverityFilter: true,
        supportsSoftwareQualityFilter: true,
        supportsStatusFilter: true,
      });
    });

    it('marks raw metrics as non-drillable', () => {
      expect(getMeasureFilterCapability(MetricKey.ncloc)).toEqual({
        isDrillable: false,
        supportsSeverityFilter: false,
        supportsSoftwareQualityFilter: false,
        supportsStatusFilter: false,
      });
    });
  });

  describe('getMeasureFilterCapabilityForDashboardMetric', () => {
    const richIssues: DashboardMetric = {
      type: DashboardMetricType.Rich,
      metricKey: RichMetricKey.Issues,
    };

    it('uses issue resolution capabilities for issue resolution metrics', () => {
      const issueResolutionMetric: DashboardMetric = {
        type: DashboardMetricType.IssueResolution,
        statistic: IssueResolutionStatistic.MTTR,
      };
      expect(
        getMeasureFilterCapabilityForDashboardMetric(issueResolutionMetric, undefined),
      ).toEqual({
        isDrillable: true,
        supportsSeverityFilter: true,
        supportsSoftwareQualityFilter: true,
        supportsStatusFilter: false,
      });
    });

    it('allows severity and software-quality filtering for issue density metrics', () => {
      const issueDensityMetric: DashboardMetric = {
        measureFilters: undefined,
        type: DashboardMetricType.IssueDensity,
      };

      expect(getMeasureFilterCapabilityForDashboardMetric(issueDensityMetric, undefined)).toEqual({
        isDrillable: true,
        supportsSeverityFilter: true,
        supportsSoftwareQualityFilter: true,
        supportsStatusFilter: false,
      });
    });

    it('allows only severity filtering for SCA resolution metrics', () => {
      const scaResolutionMetric: DashboardMetric = {
        type: DashboardMetricType.ScaResolution,
      };

      expect(getMeasureFilterCapabilityForDashboardMetric(scaResolutionMetric, undefined)).toEqual({
        isDrillable: true,
        supportsSeverityFilter: true,
        supportsSoftwareQualityFilter: false,
        supportsStatusFilter: false,
      });
    });

    it('uses issue drillability for rich issue-count metrics regardless of resolved key', () => {
      expect(
        getMeasureFilterCapabilityForDashboardMetric(richIssues, MetricKey.security_issues),
      ).toEqual(getMeasureFilterCapability(MetricKey.violations));
    });

    it('falls back to resolved metric key when dashboard metric is not rich issues', () => {
      const richHotspots: DashboardMetric = {
        type: DashboardMetricType.Rich,
        metricKey: RichMetricKey.Hotspots,
      };
      expect(getMeasureFilterCapabilityForDashboardMetric(richHotspots, MetricKey.ncloc)).toEqual(
        getMeasureFilterCapability(MetricKey.ncloc),
      );
    });

    it('returns non-drillable capabilities when a non-issue-resolution metric has no resolved key', () => {
      const richHotspots: DashboardMetric = {
        type: DashboardMetricType.Rich,
        metricKey: RichMetricKey.Hotspots,
      };
      expect(getMeasureFilterCapabilityForDashboardMetric(richHotspots, undefined)).toEqual({
        isDrillable: false,
        supportsSeverityFilter: false,
        supportsSoftwareQualityFilter: false,
        supportsStatusFilter: false,
      });
    });

    it('handles null dashboard metric using resolved key', () => {
      expect(getMeasureFilterCapabilityForDashboardMetric(undefined, MetricKey.violations)).toEqual(
        getMeasureFilterCapability(MetricKey.violations),
      );
    });
  });
});
