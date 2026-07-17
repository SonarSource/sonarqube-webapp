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

import { MetricKey, MetricType } from '../../types/metrics';
import { getProjectCardMeasureList } from '../projectCardMeasures';

describe('getProjectCardMeasureList', () => {
  const baseMeasures: Record<string, string | undefined> = {
    [MetricKey.vulnerabilities]: '5',
    [MetricKey.bugs]: '10',
    [MetricKey.code_smells]: '20',
    [MetricKey.software_quality_security_issues]: '3',
    [MetricKey.software_quality_reliability_issues]: '7',
    [MetricKey.software_quality_maintainability_issues]: '12',
    [MetricKey.security_hotspots_reviewed]: '85',
    [MetricKey.new_violations]: '2',
    [MetricKey.sca_count_any_issue]: '15',
  };

  describe('new code measures', () => {
    it('should return new violations entry for new code', () => {
      const result = getProjectCardMeasureList({
        isNewCode: true,
        measures: baseMeasures,
      });

      expect(result).toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.new_violations,
          labelKey: 'metric.new_violations.description',
        }),
      );
    });

    it('should return security hotspots reviewed (new variant) for new code', () => {
      const result = getProjectCardMeasureList({
        isNewCode: true,
        measures: baseMeasures,
      });

      const hotspots = result.find((m) => m.metricKey === MetricKey.new_security_hotspots_reviewed);
      expect(hotspots).toMatchObject({
        labelKey: 'projects.security_hotspots_reviewed',
        metricRatingKey: MetricKey.new_security_review_rating,
      });
    });

    it('should include SCA metrics when enabled for new code', () => {
      const result = getProjectCardMeasureList({
        isNewCode: true,
        measures: baseMeasures,
        isScaEnabled: true,
      });

      const sca = result.find((m) => m.metricKey === MetricKey.new_sca_count_any_issue);
      expect(sca).toMatchObject({
        labelKey: 'dependencies.risks',
        metricRatingKey: MetricKey.new_sca_rating_any_issue,
      });
    });
  });

  describe('overall code measures (standard mode)', () => {
    it('should return standard metric keys in standard mode', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isStandardMode: true,
      });

      expect(result).toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.vulnerabilities,
          labelKey: 'metric.vulnerabilities.short_name',
        }),
      );
      expect(result).toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.bugs,
          labelKey: 'metric.bugs.short_name',
        }),
      );
    });

    it('should include security hotspots reviewed (overall variant) in standard mode', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isStandardMode: true,
      });

      const hotspots = result.find((m) => m.metricKey === MetricKey.security_hotspots_reviewed);
      expect(hotspots).toMatchObject({
        labelKey: 'projects.security_hotspots_reviewed',
        metricRatingKey: MetricKey.security_review_rating,
      });
    });

    it('should not include new violations in overall code measures', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isStandardMode: true,
      });

      expect(result).not.toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.new_violations,
        }),
      );
    });
  });

  describe('overall code measures (MQR mode)', () => {
    it('should return MQR metric keys when available', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isStandardMode: false,
      });

      expect(result).toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.software_quality_security_issues,
          labelKey: 'metric.software_quality_security_issues.short_name',
        }),
      );
      expect(result).toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.software_quality_reliability_issues,
          labelKey: 'metric.software_quality_reliability_issues.short_name',
        }),
      );
    });

    it('should fallback to standard metrics if MQR metrics not present', () => {
      const measuresWithoutMqr: Record<string, string | undefined> = {
        [MetricKey.vulnerabilities]: '5',
        [MetricKey.bugs]: '10',
        [MetricKey.code_smells]: '20',
      };

      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: measuresWithoutMqr,
        isStandardMode: false,
      });

      expect(result).toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.vulnerabilities,
        }),
      );
    });
  });

  describe('SCA metrics', () => {
    it('should not include SCA metrics when disabled', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isScaEnabled: false,
      });

      expect(result).not.toContainEqual(
        expect.objectContaining({
          metricKey: MetricKey.sca_count_any_issue,
        }),
      );
    });

    it('should include SCA metrics with correct rating key', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isScaEnabled: true,
      });

      const sca = result.find((m) => m.metricKey === MetricKey.sca_count_any_issue);
      expect(sca).toMatchObject({
        labelKey: 'dependencies.risks',
        metricRatingKey: MetricKey.sca_rating_any_issue,
        metricType: MetricType.ShortInteger,
      });
    });
  });

  describe('label consistency', () => {
    it('should use metric-specific labels for standard and MQR modes', () => {
      const resultStandard = getProjectCardMeasureList({
        isNewCode: false,
        measures: { [MetricKey.vulnerabilities]: '5' },
        isStandardMode: true,
      });

      const resultMqr = getProjectCardMeasureList({
        isNewCode: false,
        measures: { [MetricKey.software_quality_security_issues]: '3' },
        isStandardMode: false,
      });

      const labelStandard = resultStandard.find(
        (m) => m.metricKey === MetricKey.vulnerabilities,
      )?.labelKey;
      const labelMqr = resultMqr.find(
        (m) => m.metricKey === MetricKey.software_quality_security_issues,
      )?.labelKey;

      expect(labelStandard).toBe('metric.vulnerabilities.short_name');
      expect(labelMqr).toBe('metric.software_quality_security_issues.short_name');
    });
  });

  describe('metric ordering', () => {
    it('should return metrics in the expected order for standard mode', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isStandardMode: true,
        isScaEnabled: true,
      });

      expect(result.map((m) => m.metricKey)).toEqual([
        MetricKey.vulnerabilities,
        MetricKey.bugs,
        MetricKey.code_smells,
        MetricKey.security_hotspots_reviewed,
        MetricKey.sca_count_any_issue,
      ]);
    });

    it('should return metrics in the expected order for MQR mode', () => {
      const result = getProjectCardMeasureList({
        isNewCode: false,
        measures: baseMeasures,
        isStandardMode: false,
        isScaEnabled: true,
      });

      expect(result.map((m) => m.metricKey)).toEqual([
        MetricKey.software_quality_security_issues,
        MetricKey.software_quality_reliability_issues,
        MetricKey.software_quality_maintainability_issues,
        MetricKey.security_hotspots_reviewed,
        MetricKey.sca_count_any_issue,
      ]);
    });

    it('should return metrics in the expected order for new code', () => {
      const result = getProjectCardMeasureList({
        isNewCode: true,
        measures: baseMeasures,
        isScaEnabled: true,
      });

      expect(result.map((m) => m.metricKey)).toEqual([
        MetricKey.new_violations,
        MetricKey.new_security_hotspots_reviewed,
        MetricKey.new_sca_count_any_issue,
      ]);
    });
  });
});
