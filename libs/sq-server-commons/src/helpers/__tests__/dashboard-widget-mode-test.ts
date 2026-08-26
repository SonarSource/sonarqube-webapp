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

import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import {
  resolveIssueHistoryDistributionKeyForMode,
  resolveIssueHistoryFiltersForMode,
  resolveIssueHistorySliceForMode,
  resolveIssueSoftwareQuality,
  resolvePieChartFilterSoftwareQuality,
  resolvePortfolioDashboardMetricKey,
} from '../dashboard-widget-mode';

describe('Server dashboard widget mode resolution', () => {
  it.each([
    [true, MetricKey.maintainability_rating, MetricKey.sqale_rating],
    [false, MetricKey.maintainability_rating, MetricKey.software_quality_maintainability_rating],
    [true, MetricKey.security_rating, MetricKey.security_rating],
    [false, MetricKey.security_rating, MetricKey.software_quality_security_rating],
    [true, MetricKey.software_quality_security_rating, MetricKey.security_rating],
    [false, MetricKey.software_quality_security_rating, MetricKey.software_quality_security_rating],
    [true, MetricKey.software_quality_security_issues, MetricKey.vulnerabilities],
    [false, MetricKey.vulnerabilities, MetricKey.software_quality_security_issues],
  ])('resolves %s mode metric %s to %s', (isStandardMode, metricKey, expected) => {
    expect(resolvePortfolioDashboardMetricKey(metricKey, isStandardMode)).toBe(expected);
  });

  it('uses issue types and legacy severities in Standard Experience', () => {
    expect(
      resolveIssueHistoryFiltersForMode(
        {
          impacts: ['SECURITY:HIGH'],
          statuses: ['OPEN'],
        },
        {
          isStandardMode: true,
          severities: [SoftwareImpactSeverity.High],
          softwareQuality: SoftwareQuality.Security,
        },
      ),
    ).toEqual({
      issueTypes: ['VULNERABILITY'],
      severities: ['CRITICAL'],
      statuses: ['OPEN'],
    });
  });

  it('preserves impact filters in MQR mode', () => {
    expect(
      resolveIssueHistoryFiltersForMode(
        { impacts: ['RELIABILITY:MEDIUM'], statuses: ['OPEN'] },
        {
          isStandardMode: false,
          severities: [SoftwareImpactSeverity.Medium],
          softwareQuality: SoftwareQuality.Reliability,
        },
      ),
    ).toEqual({ impacts: ['RELIABILITY:MEDIUM'], statuses: ['OPEN'] });
  });

  it('maps semantic qualities consistently for queries and presentation', () => {
    expect(resolveIssueSoftwareQuality(undefined, MetricKey.code_smells)).toBe(
      SoftwareQuality.Maintainability,
    );
    expect(resolvePieChartFilterSoftwareQuality('reliability')).toBe(SoftwareQuality.Reliability);
  });

  it('uses legacy dimensions for Standard queries and restores canonical MQR response keys', () => {
    expect(resolveIssueHistorySliceForMode('SOFTWARE_QUALITY', true)).toBe('TYPE');
    expect(resolveIssueHistorySliceForMode('SOFTWARE_QUALITY', false)).toBe('SOFTWARE_QUALITY');
    expect(resolveIssueHistoryDistributionKeyForMode('BUG', 'SOFTWARE_QUALITY', true)).toBe(
      SoftwareQuality.Reliability,
    );
    expect(resolveIssueHistoryDistributionKeyForMode('CRITICAL', 'SEVERITY', true)).toBe(
      SoftwareImpactSeverity.High,
    );
    expect(resolveIssueHistoryDistributionKeyForMode('OPEN', 'STATUS', true)).toBe('OPEN');
  });
});
