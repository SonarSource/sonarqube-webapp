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
  DashboardMetricType,
  IssueStatus,
  RichMetricKey,
  type TopListWidgetProps,
} from '../../../types/dashboard-widget';
import { CodeScope, TopListLimit, TopListRankBy } from '../../../types/widget-common';
import {
  buildTopListDrilldownSegments,
  buildTopListIssueCountFilterSegments,
} from '../topListDrilldownFilterSegments';

const formatMessage = (({ id }: { id: string }) => id) as never;

const widget = (metric: TopListWidgetProps['metric']): TopListWidgetProps => ({
  limit: TopListLimit.Five,
  metric,
  rankBy: TopListRankBy.Rule,
  scope: CodeScope.New,
});

describe('buildTopListDrilldownSegments', () => {
  it('filters empty values, sorts by count, and respects the widget limit', () => {
    expect(
      buildTopListDrilldownSegments(
        { first: 2, ignored: 0, second: 5, third: 3 },
        (value) => `label:${value}`,
        2,
      ),
    ).toEqual([
      { label: 'label:second', value: 'second' },
      { label: 'label:third', value: 'third' },
    ]);
  });
});

describe('buildTopListIssueCountFilterSegments', () => {
  it('renders the code scope for a raw metric', () => {
    expect(
      buildTopListIssueCountFilterSegments(
        formatMessage,
        widget({ metricKey: MetricKey.bugs, type: DashboardMetricType.Raw }),
      ),
    ).toEqual(['dashboard_widget.codescope.new']);
  });

  it('renders all rich metric filters', () => {
    expect(
      buildTopListIssueCountFilterSegments(
        formatMessage,
        widget({
          measureFilters: {
            impactSeverities: [SoftwareImpactSeverity.High],
            impactSoftwareQuality: SoftwareQuality.Security,
            issueStatus: IssueStatus.Open,
          },
          metricKey: RichMetricKey.Issues,
          type: DashboardMetricType.Rich,
        }),
      ),
    ).toEqual([
      'dashboard_widget.codescope.new',
      'dashboard.add_widget_modal.apply_filters_section.select.status.label: issue.status.OPEN',
      'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label: software_quality.SECURITY',
      'dashboard.add_widget_modal.apply_filters_section.select.severity.label: severity.HIGH',
    ]);
  });

  it('omits issue status for hotspots', () => {
    expect(
      buildTopListIssueCountFilterSegments(
        formatMessage,
        widget({ metricKey: RichMetricKey.Hotspots, type: DashboardMetricType.Rich }),
      ),
    ).toEqual(['dashboard_widget.codescope.new']);
  });
});
