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

import { useOrgScaResolutionCountWidgetData } from '~adapters/queries/sca-resolution-widget-data';
import { renderWithContext } from '~shared/helpers/test-utils';
import { CountWidgetProps } from '../../../components/visualizations/CountWidget';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { ScaResolutionCountWidgetWrapper as OrgScaResolutionCountWidget } from '../ScaResolutionCountWidgetWrapper';

const mockCountWidget = jest.fn((_props: CountWidgetProps) => <div />);

jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  ...(jest.requireActual('~feature-dashboards/components/visualizations/CountWidget') as object),
  CountWidget: (props: CountWidgetProps) => mockCountWidget(props),
}));

jest.mock('~adapters/queries/sca-resolution-widget-data', () => ({
  useOrgScaResolutionCountWidgetData: jest.fn(),
}));

const metric = {
  type: DashboardMetricType.ScaResolution,
} as const;

beforeEach(() => {
  mockCountWidget.mockClear();
  jest.mocked(useOrgScaResolutionCountWidgetData).mockReturnValue({
    data: {
      latestValue: 4_146_501,
      sparklineSeries: [4_000_000, 4_146_501],
      trend: { current: '4146501', past: '0' },
    },
    isPending: false,
  } as unknown as ReturnType<typeof useOrgScaResolutionCountWidgetData>);
});

describe('OrgScaResolutionCountWidget', () => {
  it('renders calendar MTTR with lower-is-better trend formatting', () => {
    renderWithContext(
      <OrgScaResolutionCountWidget
        entityId="portfolio-1"
        entityType="PORTFOLIO"
        metric={metric}
        showTrendIndicator
      />,
    );

    const props = mockCountWidget.mock.calls.at(-1)?.[0];
    expect(props).toEqual(
      expect.objectContaining({
        metricType: 'MTTR_CALENDAR',
        showTrendIndicator: true,
        sparklineSeries: [4_000_000, 4_146_501],
        value: 'mttr.x_years.7.9',
      }),
    );
    expect(props?.linkTo).toBeUndefined();
    expect(props?.trendIndicatorData?.trendData).toEqual(
      expect.objectContaining({
        // TrendIndicator only leaves the badge unlinked for the '#' pathname sentinel.
        activityUrl: { pathname: '#' },
        formattedChange: 'mttr.x_years.7.9',
        metricDirection: -1,
      }),
    );
  });

  it('forwards uppercase entity types to the component-facing hook', () => {
    renderWithContext(
      <OrgScaResolutionCountWidget
        entityId="branch-1"
        entityType="PROJECT_BRANCH"
        metric={metric}
        showTrendIndicator={false}
      />,
    );

    expect(useOrgScaResolutionCountWidgetData).toHaveBeenCalledWith({
      entityId: 'branch-1',
      entityType: 'PROJECT_BRANCH',
      measureFilters: undefined,
    });
    expect(mockCountWidget.mock.calls.at(-1)?.[0].sparklineSeries).toBeUndefined();
  });
});
