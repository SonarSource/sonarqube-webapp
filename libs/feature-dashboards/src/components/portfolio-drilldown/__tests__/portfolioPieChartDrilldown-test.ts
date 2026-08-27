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

import type { IntlShape } from 'react-intl';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import {
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
  PieChartProjectSlice,
} from '../../../types/dashboard-widget';
import { ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE } from '../../../types/organization-issue-count-history';
import { CodeScope } from '../../../types/widget-common';
import { PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS } from '../../../utils/organizationIssueCountHistoryUtils';
import {
  getPortfolioPieChartDrilldownDescriptor,
  normalizePortfolioRuleKey,
  resolvePortfolioDrilldownSegmentValue,
} from '../portfolioPieChartDrilldown';

const formatMessage = (({ id }: { id: string }) => id) as IntlShape['formatMessage'];
const commonWidgetProps = {
  scope: CodeScope.Overall,
  showLegend: true,
};
const noFilter = '' as const;

describe('portfolioPieChartDrilldown', () => {
  it('keeps empty segment values and normalizes unmatched labels for stable URLs', () => {
    expect(resolvePortfolioDrilldownSegmentValue('  ', [])).toBe('');
    expect(resolvePortfolioDrilldownSegmentValue('Custom severity', [])).toBe('CUSTOM_SEVERITY');
  });

  it('resolves rule segments by stable keys and current labels', () => {
    const segments = [{ label: '(Java) Rule title', value: 'java:S100' }];

    expect(normalizePortfolioRuleKey('Java:s100')).toBe('java:S100');
    expect(resolvePortfolioDrilldownSegmentValue('(Java) Rule title', segments)).toBe('java:S100');
    expect(resolvePortfolioDrilldownSegmentValue('JAVA:s100', segments)).toBe('java:S100');
  });

  it('builds Standard Experience severity requests without a Software Quality filter', () => {
    const widget = {
      ...commonWidgetProps,
      filter: noFilter,
      metric: PieChartMetric.IssueCount,
      slice: PieChartIssueSlice.ImpactSeverities,
    };

    expect(
      getPortfolioPieChartDrilldownDescriptor({ formatMessage, segmentLabel: 'High', widget }),
    ).toEqual(
      expect.objectContaining({
        request: { issueTypes: undefined, severities: ['HIGH'], statuses: ['OPEN'] },
      }),
    );
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'Custom severity',
        widget,
      }),
    ).toEqual(
      expect.objectContaining({
        request: {
          issueTypes: undefined,
          severities: ['CUSTOM_SEVERITY'],
          statuses: ['OPEN'],
        },
      }),
    );
  });

  it('keeps the Software Quality scope when a severity segment is no longer recognized', () => {
    const descriptor = getPortfolioPieChartDrilldownDescriptor({
      formatMessage,
      segmentLabel: 'Custom severity',
      widget: {
        ...commonWidgetProps,
        filter: PieChartIssueFilter.Security,
        metric: PieChartMetric.IssueCount,
        slice: PieChartIssueSlice.ImpactSeverities,
      },
    });

    expect(descriptor).toEqual(
      expect.objectContaining({
        request: {
          impacts: Object.values(SoftwareImpactSeverity).map(
            (severity) => `${SoftwareQuality.Security}:${severity}`,
          ),
          statuses: ['OPEN'],
        },
      }),
    );
  });

  it('preserves an unknown hotspot review status instead of dropping the drilldown', () => {
    const descriptor = getPortfolioPieChartDrilldownDescriptor({
      formatMessage,
      segmentLabel: 'Needs Review',
      widget: {
        ...commonWidgetProps,
        filter: noFilter,
        metric: PieChartMetric.HotspotCount,
        slice: PieChartHotspotSlice.ReviewStatus,
      },
    });

    expect(descriptor).toEqual(
      expect.objectContaining({
        request: { issueTypes: ['SECURITY_HOTSPOT'], statuses: ['NEEDS_REVIEW'] },
      }),
    );
  });

  it('maps known hotspot review statuses and priorities to project issue filters', () => {
    const widget = {
      ...commonWidgetProps,
      filter: noFilter,
      metric: PieChartMetric.HotspotCount,
    };

    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'Safe',
        widget: { ...widget, slice: PieChartHotspotSlice.ReviewStatus },
      }),
    ).toEqual(
      expect.objectContaining({
        request: { issueTypes: ['SECURITY_HOTSPOT'], statuses: ['SAFE'] },
      }),
    );
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'High Priority',
        widget: { ...widget, slice: PieChartHotspotSlice.ReviewPriority },
      }),
    ).toEqual(
      expect.objectContaining({
        request: { issueTypes: ['SECURITY_HOTSPOT'], severities: ['HIGH'] },
      }),
    );
  });

  it('builds unfiltered Standard Experience severity and status requests', () => {
    const widget = {
      ...commonWidgetProps,
      filter: noFilter,
      metric: PieChartMetric.IssueCount,
    };

    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: { ...widget, slice: PieChartIssueSlice.ImpactSeverities },
      }),
    ).toEqual(expect.objectContaining({ request: { statuses: ['OPEN'] } }));
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: { ...widget, slice: PieChartIssueSlice.IssueStatuses },
      }),
    ).toEqual(
      expect.objectContaining({
        request: {
          issueTypes: undefined,
          statuses: [...ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE],
        },
      }),
    );
  });

  it('builds unfiltered Software Quality, hotspot, and quality-gate requests', () => {
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: {
          ...commonWidgetProps,
          filter: PieChartIssueFilter.Security,
          metric: PieChartMetric.IssueCount,
          slice: PieChartIssueSlice.ImpactSeverities,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        request: {
          impacts: Object.values(SoftwareImpactSeverity).map(
            (severity) => `${SoftwareQuality.Security}:${severity}`,
          ),
          statuses: ['OPEN'],
        },
      }),
    );
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: {
          ...commonWidgetProps,
          filter: noFilter,
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.ReviewStatus,
        },
      }),
    ).toEqual(expect.objectContaining({ request: { issueTypes: ['SECURITY_HOTSPOT'] } }));
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: {
          ...commonWidgetProps,
          filter: noFilter,
          metric: PieChartMetric.ProjectCount,
          slice: PieChartProjectSlice.Status,
        },
      }),
    ).toEqual(expect.objectContaining({ request: { metricKey: MetricKey.alert_status } }));
  });

  it('builds selected rule, status, and Software Quality requests', () => {
    const issueWidget = {
      ...commonWidgetProps,
      filter: noFilter,
      metric: PieChartMetric.IssueCount,
    };

    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'java:S100',
        widget: { ...issueWidget, slice: PieChartIssueSlice.Rules },
      }),
    ).toEqual(
      expect.objectContaining({
        request: {
          impacts: [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS],
          ruleKeys: ['java:S100'],
          statuses: ['OPEN'],
        },
      }),
    );
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'Confirmed',
        widget: { ...issueWidget, slice: PieChartIssueSlice.IssueStatuses },
      }),
    ).toEqual(
      expect.objectContaining({
        request: { issueTypes: undefined, statuses: ['CONFIRMED'] },
      }),
    );
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: SoftwareQuality.Reliability,
        widget: { ...issueWidget, slice: PieChartIssueSlice.ImpactSoftwareQualities },
      }),
    ).toEqual(
      expect.objectContaining({
        request: {
          impacts: Object.values(SoftwareImpactSeverity).map(
            (severity) => `${SoftwareQuality.Reliability}:${severity}`,
          ),
          statuses: ['OPEN'],
        },
      }),
    );
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'Unknown Quality',
        widget: { ...issueWidget, slice: PieChartIssueSlice.ImpactSoftwareQualities },
      }),
    ).toBeNull();
  });

  it('builds hotspot rule requests from security-category segments', () => {
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        segmentLabel: 'java:S2076',
        widget: {
          ...commonWidgetProps,
          filter: noFilter,
          metric: PieChartMetric.HotspotCount,
          slice: PieChartHotspotSlice.SecurityCategory,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        request: { issueTypes: ['SECURITY_HOTSPOT'], ruleKeys: ['java:S2076'] },
      }),
    );
  });

  it('returns no unfiltered drilldown for unsupported metrics and slices', () => {
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: {
          ...commonWidgetProps,
          filter: noFilter,
          metric: PieChartMetric.LineCount,
          slice: PieChartIssueSlice.ImpactSeverities,
        },
      }),
    ).toBeNull();
    expect(
      getPortfolioPieChartDrilldownDescriptor({
        formatMessage,
        widget: {
          ...commonWidgetProps,
          filter: noFilter,
          metric: PieChartMetric.IssueCount,
          slice: PieChartIssueSlice.CleanCodeAttributeCategories,
        },
      }),
    ).toBeNull();
  });
});
