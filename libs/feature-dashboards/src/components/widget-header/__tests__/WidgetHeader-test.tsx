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

import { screen } from '@testing-library/react';
import { getDashboardLocalizedMetricName } from '~adapters/helpers/l10n';
import * as ProjectRatingBadgeData from '~adapters/queries/project-rating-badge-widget-data';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType, IssueStatus, RichMetricKey } from '../../../types/dashboard-widget';
import { CodeScope, TopListLimit, TopListRankBy, WidgetMode } from '../../../types/widget-common';
import { TopListWidgetHeader, WidgetHeader } from '../WidgetHeader';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('id=my-project')],
  };
});

jest.mock('~adapters/queries/project-rating-badge-widget-data', () => ({
  useProjectRatingBadgeMeasuresQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getProjectDashboardMeasuresUrl: ({ metric }: { metric: string }) => `#metric=${metric}`,
}));

jest.mock('../../visualizations/RatingBadgeDisplay', () => ({
  RatingBadgeDisplay: ({
    linkTo,
    metricKey,
    value,
  }: {
    linkTo?: string;
    metricKey: MetricKey;
    value: string;
  }) =>
    linkTo ? (
      <a data-testid="contextual-rating-badge" href={linkTo}>
        {`rating:${metricKey}:${value}`}
      </a>
    ) : (
      <span data-testid="contextual-rating-badge">{`rating:${metricKey}:${value}`}</span>
    ),
}));

const securityIssuesMetric = {
  measureFilters: {
    impactSoftwareQuality: SoftwareQuality.Security,
    issueStatus: IssueStatus.Open,
  },
  metricKey: RichMetricKey.Issues,
  type: DashboardMetricType.Rich,
} as const;

describe('WidgetHeader', () => {
  beforeEach(() => {
    jest.mocked(ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery>);
  });

  it('renders a metric title override and its code scope', () => {
    renderWithRouter(
      <WidgetHeader
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
        titleOverride="Custom widget title"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Custom widget title' })).toBeInTheDocument();
    expect(screen.getByTestId('widget-filter-line')).toHaveTextContent(
      'dashboard_widget.codescope.overall',
    );
  });

  it('renders an over-time metric title and group-by filter', () => {
    renderWithRouter(
      <WidgetHeader
        groupBy={LineChartGroupBy.Severity}
        historyRange={HistoryRange.Last3Months}
        metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
        scope={CodeScope.New}
      />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('dashboard.widget.title.over_time');
    expect(screen.getByTestId('widget-filter-line')).toHaveTextContent(
      'dashboard_widget.codescope.new · dashboard.line_chart.group_by.label: dashboard.line_chart.group_by.severity',
    );
  });

  it('renders the product-specific title for a rich issue count', () => {
    renderWithRouter(
      <WidgetHeader
        metric={{ metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich }}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(
      getDashboardLocalizedMetricName({ key: MetricKey.issues }),
    );
  });

  it('renders rating and top-list titles', () => {
    const { rerender } = renderWithRouter(
      <WidgetHeader metricKey={MetricKey.reliability_rating} scope={CodeScope.New} />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(MetricKey.reliability_rating);
    expect(screen.getByTestId('widget-filter-line')).toHaveTextContent(
      'dashboard_widget.codescope.new',
    );

    rerender(
      <TopListWidgetHeader
        limit={TopListLimit.Five}
        metric={{ metricKey: MetricKey.violations, type: DashboardMetricType.Raw }}
        rankBy={TopListRankBy.Rule}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('dashboard.top_list.widget_title');
  });

  it('renders the project contextual rating badge in the title row for eligible count widgets', () => {
    jest.mocked(ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery).mockReturnValue({
      data: [{ metric: MetricKey.security_rating, value: '3.0' }],
      isLoading: false,
    } as unknown as ReturnType<typeof ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery>);

    renderWithRouter(<WidgetHeader metric={securityIssuesMetric} scope={CodeScope.Overall} />);

    const titleRow = screen.getByTestId('widget-header-title-row');
    expect(titleRow).toContainElement(screen.getByRole('heading', { level: 3 }));
    expect(titleRow).toContainElement(screen.getByTestId('contextual-rating-badge'));
    expect(screen.getByText(`rating:${MetricKey.security_rating}:3`)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `#metric=${MetricKey.security_rating}`,
    );
  });

  it('renders the contextual badge without a link in edit mode', () => {
    jest.mocked(ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery).mockReturnValue({
      data: [{ metric: MetricKey.security_rating, value: '2' }],
      isLoading: false,
    } as unknown as ReturnType<typeof ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery>);

    renderWithRouter(
      <WidgetHeader
        metric={securityIssuesMetric}
        mode={WidgetMode.Edit}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.getByTestId('contextual-rating-badge')).toHaveTextContent(
      `rating:${MetricKey.security_rating}:2`,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not render the contextual badge for ineligible count widgets', () => {
    renderWithRouter(
      <WidgetHeader
        metric={{
          measureFilters: { issueStatus: IssueStatus.Open },
          metricKey: RichMetricKey.Issues,
          type: DashboardMetricType.Rich,
        }}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.queryByTestId('contextual-rating-badge')).not.toBeInTheDocument();
  });

  it('does not render the contextual badge on top-list headers', () => {
    jest.mocked(ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery).mockReturnValue({
      data: [{ metric: MetricKey.security_rating, value: '3.0' }],
      isLoading: false,
    } as unknown as ReturnType<typeof ProjectRatingBadgeData.useProjectRatingBadgeMeasuresQuery>);

    renderWithRouter(
      <TopListWidgetHeader
        limit={TopListLimit.Five}
        metric={securityIssuesMetric}
        rankBy={TopListRankBy.Rule}
        scope={CodeScope.Overall}
      />,
    );

    expect(screen.queryByTestId('contextual-rating-badge')).not.toBeInTheDocument();
  });
});
