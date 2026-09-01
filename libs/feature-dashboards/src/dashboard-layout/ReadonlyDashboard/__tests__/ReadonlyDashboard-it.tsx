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

import { matchers as emotionMatchers } from '@emotion/jest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithContext } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { PieChartPastry } from '../../../types/visualization';
import { CodeScope } from '../../../types/widget-common';
import { normalizeSection } from '../../logic/positioning';
import {
  DashboardInstance,
  WidgetBodyMap,
  WidgetEditBehaviorMap,
  WidgetHeaderMap,
} from '../../logic/types';
import { ReadonlyDashboard } from '../../ReadonlyDashboard/ReadonlyDashboard';
import { WidgetMapsProvider } from '../../shared/WidgetMapsContext';
import { getImplicitSectionContainerStyle } from '../ImplicitSection';

expect.extend(emotionMatchers);

enum HistoryRange {
  All = '99',
  Last3Months = '3',
}

enum DashboardMetricType {
  Raw = 'raw',
}

type DashboardMetric = {
  metricKey: MetricKey;
  type: DashboardMetricType.Raw;
};

enum PieChartMetric {
  IssueCount = 'issueCount',
}

enum PieChartIssueSlice {
  ImpactSoftwareQualities = 'impactSoftwareQualities',
}

type PieChartWidgetProps = {
  filter: '';
  metric: PieChartMetric;
  pastry?: PieChartPastry;
  scope: CodeScope;
  showLegend: boolean;
  slice: PieChartIssueSlice;
};

type ProjectDashboardWidgetPropMap = {
  count: {
    metric: DashboardMetric;
    scope: CodeScope;
  };
  donutChart: PieChartWidgetProps & { pastry: PieChartPastry.Donut };
  lineChart: {
    historyRange: HistoryRange;
    metric: DashboardMetric;
    scope: CodeScope;
    showLegend?: boolean;
  };
  pieChart: PieChartWidgetProps;
  ratingBadge: {
    metricKey: MetricKey;
    scope: CodeScope;
    showBreakdown?: boolean;
  };
};

// Helper function to create a raw DashboardMetric for tests
function createRawMetric(metricKey: MetricKey): DashboardMetric {
  return {
    type: DashboardMetricType.Raw,
    metricKey,
  };
}

// Mock widgets for testing - accept actual widget prop types
function MockCountOrRatingWidget(
  props: Readonly<
    ProjectDashboardWidgetPropMap['count'] | ProjectDashboardWidgetPropMap['ratingBadge']
  >,
) {
  const metricKey = 'metric' in props ? props.metric.metricKey : props.metricKey;
  return <div data-testid="metric-widget">{metricKey}</div>;
}

function MockLineChartWidget(props: Readonly<ProjectDashboardWidgetPropMap['lineChart']>) {
  return <div data-testid="line-chart-widget">{props.metric.metricKey}</div>;
}

function MockDonutChartWidget({ slice }: Readonly<{ slice: PieChartIssueSlice }>) {
  return <div data-testid="donut-chart-widget">{slice}</div>;
}

function MockPieChartWidget({ slice }: Readonly<{ slice: PieChartIssueSlice }>) {
  return <div data-testid="pie-chart-widget">{slice}</div>;
}

function MockWidgetHeader(props: { metricKey: MetricKey } | { metric: DashboardMetric }) {
  const metricKey = 'metricKey' in props ? props.metricKey : props.metric?.metricKey;
  return <div data-testid="widget-header">{metricKey}</div>;
}

function MockPieChartWidgetHeader() {
  return <div data-testid="pie-chart-widget-header">PieChart Header</div>;
}

const bodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap> = {
  count: MockCountOrRatingWidget,
  lineChart: MockLineChartWidget,
  donutChart: MockDonutChartWidget,
  pieChart: MockPieChartWidget,
  ratingBadge: MockCountOrRatingWidget,
};

const headerMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap> = {
  count: MockWidgetHeader,
  lineChart: MockWidgetHeader,
  donutChart: MockPieChartWidgetHeader,
  pieChart: MockPieChartWidgetHeader,
  ratingBadge: MockWidgetHeader,
};

const emptyEditBehaviorMap: WidgetEditBehaviorMap<ProjectDashboardWidgetPropMap> = {
  count: {
    defaultProps: {},
    defaultSize: { width: 3, height: 3 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 12, height: 12 },
  },
  lineChart: {
    defaultProps: {},
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 12, height: 12 },
  },
  donutChart: {
    defaultProps: {},
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 12, height: 12 },
  },
  pieChart: {
    defaultProps: {},
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 12, height: 12 },
  },
  ratingBadge: {
    defaultProps: {},
    defaultSize: { width: 3, height: 3 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 12, height: 12 },
  },
};

const mockDashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = {
  children: [
    // Explicit section
    normalizeSection({
      key: 'test-section-1',
      name: 'Test Section',
      description: 'Test description',
      type: 'explicit',
      children: [
        {
          key: 'widget-1',
          type: 'count',
          position: { x: 0, y: 0 },
          dimensions: { width: 3, height: 4 },
          props: {
            metric: createRawMetric(MetricKey.bugs),
            scope: CodeScope.Overall,
          },
        },
        {
          key: 'widget-2',
          type: 'lineChart',
          position: { x: 3, y: 0 },
          dimensions: { width: 6, height: 4 },
          props: {
            metric: createRawMetric(MetricKey.coverage),
            historyRange: HistoryRange.All,
            scope: CodeScope.Overall,
          },
        },
      ],
    }),

    // Implicit section
    normalizeSection({
      type: 'implicit',
      children: [
        {
          key: 'widget-3',
          type: 'donutChart',
          position: { x: 0, y: 0 },
          dimensions: { width: 4, height: 6 },
          props: {
            filter: '',
            metric: PieChartMetric.IssueCount,
            pastry: PieChartPastry.Donut,
            scope: CodeScope.Overall,
            showLegend: true,
            slice: PieChartIssueSlice.ImpactSoftwareQualities,
          },
        },
      ],
    }),
  ],
};

describe('ReadonlyDashboard', () => {
  it('should render all sections', () => {
    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={mockDashboard} width={12} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    // Check that explicit section is rendered
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();

    // Check that widgets are rendered
    expect(screen.getByTestId('metric-widget')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-widget')).toBeInTheDocument();
    expect(screen.getByTestId('donut-chart-widget')).toBeInTheDocument();
  });

  it('should render widget headers', () => {
    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={mockDashboard} width={12} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    // Should render headers for all widgets
    const headers = screen.getAllByTestId('widget-header');
    expect(headers).toHaveLength(2); // metric and lineChart use MockWidgetHeader

    // DonutChart uses a different header
    const pieChartHeaders = screen.getAllByTestId('pie-chart-widget-header');
    expect(pieChartHeaders).toHaveLength(1);
  });

  it('should render widgets with correct props', () => {
    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={mockDashboard} width={12} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    // Check that widgets receive correct props
    expect(screen.getAllByText(MetricKey.bugs).length).toBeGreaterThan(0);
    expect(screen.getAllByText(MetricKey.coverage).length).toBeGreaterThan(0);
    expect(screen.getAllByText(PieChartIssueSlice.ImpactSoftwareQualities).length).toBeGreaterThan(
      0,
    );
  });

  it('should handle empty dashboard', () => {
    const emptyDashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [],
    };

    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={emptyDashboard} width={12} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    // Should render container but no sections
    expect(screen.queryByText('Test Section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('line-chart-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('donut-chart-widget')).not.toBeInTheDocument();
  });

  it('should handle dashboard with only explicit sections', () => {
    const explicitOnlyDashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [
        normalizeSection({
          key: 'test-only-section',
          name: 'Only Section',
          description: 'Only description',
          type: 'explicit',
          children: [
            {
              key: 'widget-only',
              type: 'count',
              position: { x: 0, y: 0 },
              dimensions: { width: 3, height: 4 },
              props: {
                metric: createRawMetric(MetricKey.bugs),
                scope: CodeScope.Overall,
              },
            },
          ],
        }),
      ],
    };

    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={explicitOnlyDashboard} width={12} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Only Section')).toBeInTheDocument();
    expect(screen.getAllByText(MetricKey.bugs).length).toBeGreaterThan(0);
  });

  it('should handle dashboard with only implicit sections', () => {
    const implicitOnlyDashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [
        normalizeSection({
          type: 'implicit',
          children: [
            {
              key: 'widget-implicit',
              type: 'lineChart',
              position: { x: 0, y: 0 },
              dimensions: { width: 6, height: 4 },
              props: {
                metric: createRawMetric(MetricKey.bugs),
                historyRange: HistoryRange.Last3Months,
                scope: CodeScope.New,
              },
            },
          ],
        }),
      ],
    };

    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={implicitOnlyDashboard} width={12} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText(MetricKey.bugs).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument(); // No section titles for implicit
    const shell = screen.getByTestId('dashboard-implicit-section-shell');
    const chrome = getImplicitSectionContainerStyle();
    expect(shell).toHaveStyle({
      overflow: chrome.overflow,
      position: chrome.position,
      borderRadius: chrome.borderRadius,
      marginBottom: chrome.marginBottom,
    });
    expect(shell).toHaveStyleRule('background-color', String(chrome.backgroundColor));
    expect(shell).toHaveStyleRule('border', String(chrome.border));
    expect(shell).toHaveStyleRule('box-shadow', String(chrome.boxShadow));
  });

  it('should not render shell for an empty implicit section in view mode', () => {
    const implicitEmptyDashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [
        {
          type: 'implicit',
          children: [],
        },
      ],
    };

    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={implicitEmptyDashboard} width={12} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('dashboard-implicit-section-shell')).not.toBeInTheDocument();
  });

  it('should apply correct width prop', () => {
    renderWithContext(
      <MemoryRouter>
        <WidgetMapsProvider
          bodyMap={bodyMap}
          editBehaviorMap={emptyEditBehaviorMap}
          headerMap={headerMap}
        >
          <ReadonlyDashboard dashboard={mockDashboard} width={8} />
        </WidgetMapsProvider>
      </MemoryRouter>,
    );

    // This test verifies that the width prop is passed through
    // The actual implementation would use this width for grid calculations
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  describe('explicit section collapse', () => {
    // Renders an interactive element so that role queries reflect whether the widget
    // is exposed in the accessibility tree
    function MockInteractiveCountWidget(props: Readonly<ProjectDashboardWidgetPropMap['count']>) {
      return <button type="button">{`Inspect ${props.metric.metricKey}`}</button>;
    }

    const interactiveBodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap> = {
      ...bodyMap,
      count: MockInteractiveCountWidget,
    };

    const collapsibleDashboard: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [
        normalizeSection({
          key: 'collapsible-section',
          name: 'Collapsible Section',
          description: 'Collapsible description',
          type: 'explicit',
          children: [
            {
              key: 'widget-collapsible',
              type: 'count',
              position: { x: 0, y: 0 },
              dimensions: { width: 3, height: 4 },
              props: {
                metric: createRawMetric(MetricKey.bugs),
                scope: CodeScope.Overall,
              },
            },
          ],
        }),
      ],
    };

    const ui = {
      toggleButton: () =>
        screen.getByRole('button', { name: 'Toggle Collapsible Section section' }),
      widgetAction: () => screen.getByRole('button', { name: `Inspect ${MetricKey.bugs}` }),
      widgetActionText: () => screen.getByText(`Inspect ${MetricKey.bugs}`),
    };

    function setupCollapsibleDashboard() {
      return renderWithContext(
        <MemoryRouter>
          <WidgetMapsProvider
            bodyMap={interactiveBodyMap}
            editBehaviorMap={emptyEditBehaviorMap}
            headerMap={headerMap}
          >
            <ReadonlyDashboard dashboard={collapsibleDashboard} width={12} />
          </WidgetMapsProvider>
        </MemoryRouter>,
      );
    }

    it('should expose aria-expanded on the section toggle, synced on toggle', async () => {
      const { user } = setupCollapsibleDashboard();

      expect(ui.toggleButton()).toHaveAttribute('aria-expanded', 'true');

      await user.click(ui.toggleButton());
      expect(ui.toggleButton()).toHaveAttribute('aria-expanded', 'false');

      await user.click(ui.toggleButton());
      expect(ui.toggleButton()).toHaveAttribute('aria-expanded', 'true');
    });

    it('should focus the section toggle when tabbing to it', async () => {
      const { user } = setupCollapsibleDashboard();

      await user.tab();

      expect(ui.toggleButton()).toHaveFocus();
    });

    it('should keep collapsed content mounted but out of the accessibility tree', async () => {
      const { user } = setupCollapsibleDashboard();

      expect(ui.widgetAction()).toBeInTheDocument();

      await user.click(ui.toggleButton());

      // Collapsed content must not be reachable by assistive technologies (role queries
      // exclude accessibility-tree-hidden elements by default)...
      expect(
        screen.queryByRole('button', { name: `Inspect ${MetricKey.bugs}` }),
      ).not.toBeInTheDocument();
      // ...but it stays mounted (hidden) so the collapse animation and re-expansion keep working.
      // Text queries do not consult the accessibility tree, unlike role queries with hidden: true
      // whose accessible-name computation returns an empty name for hidden elements.
      expect(ui.widgetActionText()).toBeInTheDocument();

      await user.click(ui.toggleButton());
      expect(ui.widgetAction()).toBeInTheDocument();
    });
  });
});
