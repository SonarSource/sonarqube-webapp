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
import { renderWithRouter } from '~shared/helpers/test-utils';
import type { TopListWidgetProps } from '../../../types/dashboard-widget';
import type { PieChartSegment } from '../../../types/visualization';
import { CodeScope, TopListLimit, TopListRankBy } from '../../../types/widget-common';
import { buildDashboardMetricForTopList } from '../../../widget-creation-modal/utils/topListCompleteConfig';
import { TopListDrilldownOverview } from '../TopListDrilldownOverview';
import { TopListDrilldownRuleHeaderCard } from '../TopListDrilldownRuleHeaderCard';
import { TopListDrilldownSliceFilterCard } from '../TopListDrilldownSliceFilterCard';

jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  CountWidget: ({ value }: { value: string }) => <div data-testid="mock-count-widget">{value}</div>,
}));

jest.mock('~feature-dashboards/components/visualizations/TrendIndicator', () => ({
  TrendIndicator: () => <div data-testid="mock-trend-indicator" />,
}));

const widget: TopListWidgetProps = {
  limit: TopListLimit.Five,
  metric: buildDashboardMetricForTopList(undefined),
  rankBy: TopListRankBy.Rule,
  scope: CodeScope.Overall,
};

const segments: PieChartSegment[] = [
  {
    color: '#000',
    count: 12,
    label: 'Avoid duplicate literals',
    percentage: '100',
    value: 'java:S106',
  },
];

describe('TopListDrilldownRuleHeaderCard', () => {
  it('renders rule metadata and the organization-scoped rule link', () => {
    renderWithRouter(
      <TopListDrilldownRuleHeaderCard
        langName="Java"
        name="Avoid duplicate literals"
        organization="my-org"
        ruleKey="java:S106"
      />,
    );

    expect(screen.getByText('Avoid duplicate literals')).toBeInTheDocument();
    expect(
      screen.getByText(/portfolio_dashboard\.breakdown\.top_list\.rule_details\.subtitle/),
    ).toHaveTextContent('Java');
    expect(
      screen.getByRole('link', {
        name: 'portfolio_dashboard.breakdown.top_list.rule_details.view_rule',
      }),
    ).toHaveAttribute('href', expect.stringContaining('rule_key=java%3AS106'));
  });

  it('falls back to the rule key and omits the link when metadata is unavailable', () => {
    renderWithRouter(<TopListDrilldownRuleHeaderCard ruleKey="java:S999" />);

    expect(screen.getByText('java:S999')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.startsWith(
          'portfolio_dashboard.breakdown.top_list.rule_details.subtitle_no_language',
        ),
      ),
    ).toBeInTheDocument();
  });
});

describe('TopListDrilldownSliceFilterCard', () => {
  it('does not render when no selectable rules are available', () => {
    renderWithRouter(
      <TopListDrilldownSliceFilterCard
        onRuleChange={jest.fn()}
        segments={[{ ...segments[0], value: 'OTHER_RULES' }]}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the selected rule filter', () => {
    renderWithRouter(
      <TopListDrilldownSliceFilterCard
        onRuleChange={jest.fn()}
        segments={segments}
        selectedRuleKey="java:S106"
      />,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Avoid duplicate literals');
  });
});

describe('TopListDrilldownOverview', () => {
  const data = {
    counts: { 'java:S106': 12 },
    getRuleTrendData: jest.fn().mockReturnValue(null),
    isPending: false,
    rulesByKey: { 'java:S106': { langName: 'Java', name: 'Avoid duplicate literals' } },
    rulesOrganization: 'my-org',
  };

  it('renders the selected rule overview', () => {
    renderWithRouter(
      <TopListDrilldownOverview
        data={data}
        filterSegments={segments}
        onRuleChange={jest.fn()}
        selectedRuleKey="java:S106"
        widget={widget}
      />,
    );

    expect(screen.getByTestId('top-list-drilldown-rule-header-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-count-widget')).toHaveTextContent('12');
    expect(screen.getByTestId('mock-trend-indicator')).toBeInTheDocument();
    expect(data.getRuleTrendData).toHaveBeenCalledWith('java:S106');
  });

  it('renders an empty summary when no rule is selected', () => {
    renderWithRouter(
      <TopListDrilldownOverview
        data={{ ...data, isPending: true }}
        filterSegments={segments}
        onRuleChange={jest.fn()}
        widget={widget}
      />,
    );

    expect(screen.queryByTestId('top-list-drilldown-rule-header-card')).not.toBeInTheDocument();
    expect(screen.getAllByText('dashboard.widget.loading_visualization')).toHaveLength(2);
  });

  it('renders no count when no rule is selected and loading is complete', () => {
    renderWithRouter(
      <TopListDrilldownOverview
        data={data}
        filterSegments={segments}
        onRuleChange={jest.fn()}
        widget={widget}
      />,
    );

    expect(screen.getByText('dashboard.widget.no_data')).toBeInTheDocument();
    expect(screen.getByTestId('mock-trend-indicator')).toBeInTheDocument();
  });

  it('renders the unavailable trend state for a new-code widget', () => {
    renderWithRouter(
      <TopListDrilldownOverview
        data={data}
        filterSegments={segments}
        onRuleChange={jest.fn()}
        selectedRuleKey="java:S106"
        widget={{ ...widget, scope: CodeScope.New }}
      />,
    );

    expect(
      screen.getByText(
        'dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator.overall_code_only',
      ),
    ).toBeInTheDocument();
  });
});
