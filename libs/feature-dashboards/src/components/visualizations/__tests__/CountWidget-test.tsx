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
import { render } from '~shared/helpers/test-utils';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetHeaderTitle } from '../../../dashboard-layout/shared/WidgetHeaderTitle';
import { WidgetInstanceProvider } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import {
  DashboardMetric,
  DashboardMetricType,
  RichMetricKey,
} from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import { isCountWidgetTrendVisible } from '../../../utils/countWidgetTrendIndicator';
import { CountWidget } from '../CountWidget';

jest.mock('~adapters/components/measure/Measure', () => ({
  __esModule: true,
  default: ({
    metricKey,
    metricType,
    value,
  }: {
    metricKey: string;
    metricType: string;
    value: string;
  }) => <span>{`measure:${metricKey}:${metricType}:${value}`}</span>,
}));

jest.mock('../TrendIndicator', () => ({
  TrendIndicator: ({ isPending }: { isPending: boolean }) => (
    <div>{`trend:${String(isPending)}`}</div>
  ),
}));

jest.mock('../Sparkline', () => ({
  SPARKLINE_HEIGHT: 30,
  SPARKLINE_WIDTH: 80,
  Sparkline: ({
    className,
    data,
    fullWidth,
    preserveAspectRatio,
  }: {
    className?: string;
    data: number[];
    fullWidth?: boolean;
    preserveAspectRatio?: string;
  }) => (
    <div
      className={className}
      data-fullwidth={fullWidth === true ? 'true' : 'false'}
      data-length={data.length}
      data-preserve-aspect-ratio={preserveAspectRatio}
      data-testid="count-sparkline"
    />
  ),
}));

jest.mock('@sonarsource/echoes-react', () => ({
  ...jest.requireActual<typeof import('@sonarsource/echoes-react')>('@sonarsource/echoes-react'),
  LinkStandalone: ({
    children,
    id,
    to,
    ...props
  }: {
    children: React.ReactNode;
    id?: string;
    to: string;
  }) => (
    <a href={to} id={id} {...props}>
      {children}
    </a>
  ),
}));

describe('CountWidget', () => {
  it('uses Echoes heading-xlarge typography when grid height is under 5 rows or context is missing', () => {
    render(<CountWidget metricKey={MetricKey.bugs} metricType={MetricType.Integer} value="42" />);

    expect(screen.getByTestId('count-widget')).toHaveClass('sw-heading-xl');
  });

  it('uses Echoes display typography when grid height is at least 5 rows', () => {
    render(
      <WidgetInstanceProvider dimensions={{ height: 5, width: 2 }} widgetKey="w1">
        <CountWidget metricKey={MetricKey.bugs} metricType={MetricType.Integer} value="42" />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('count-widget')).toHaveClass('sw-typo-display');
  });

  it('renders non-link content when link target is missing', () => {
    render(<CountWidget metricKey={MetricKey.bugs} metricType={MetricType.Integer} value="42" />);

    expect(
      screen.getByText(`measure:${MetricKey.bugs}:${MetricType.Integer}:42`),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a unit label alongside the measure when provided', () => {
    render(
      <CountWidget
        metricKey={MetricKey.violations}
        metricType={MetricType.Float}
        unitLabel="issues / 1K LOC"
        value="4.2"
      />,
    );

    expect(
      screen.getByText(`measure:${MetricKey.violations}:${MetricType.Float}:4.2`),
    ).toBeInTheDocument();
    expect(screen.getByText('issues / 1K LOC')).toHaveClass('sw-whitespace-nowrap');
  });

  it('renders link content when link target is non-empty', () => {
    render(
      <CountWidget
        linkTo="/component/issues"
        metricKey={MetricKey.vulnerabilities}
        metricType={MetricType.Integer}
        value="12"
      />,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/component/issues');
    expect(
      screen.getByText(`measure:${MetricKey.vulnerabilities}:${MetricType.Integer}:12`),
    ).toBeInTheDocument();
  });

  it('includes the widget title in the count link accessible name when widget context is available', () => {
    render(
      <WidgetInstanceProvider dimensions={{ height: 4, width: 3 }} widgetKey="w1">
        <WidgetHeaderTitle title="Bugs" />
        <CountWidget
          linkTo="/component/issues"
          metricKey={MetricKey.bugs}
          metricType={MetricType.Integer}
          value="12"
        />
      </WidgetInstanceProvider>,
    );

    expect(
      screen.getByRole('link', {
        name: `measure:${MetricKey.bugs}:${MetricType.Integer}:12 Bugs`,
      }),
    ).toBeInTheDocument();
  });

  it('treats empty string link as non-link target', () => {
    render(
      <CountWidget
        linkTo=""
        metricKey={MetricKey.code_smells}
        metricType={MetricType.Integer}
        value="9"
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.getByText(`measure:${MetricKey.code_smells}:${MetricType.Integer}:9`),
    ).toBeInTheDocument();
  });

  it('renders trend indicator only when enabled and data exists', () => {
    const { rerender } = render(
      <CountWidget metricKey={MetricKey.bugs} metricType={MetricType.Integer} value="1" />,
    );
    expect(screen.queryByText('trend:false')).not.toBeInTheDocument();

    rerender(
      <CountWidget
        metricKey={MetricKey.bugs}
        metricType={MetricType.Integer}
        showTrendIndicator
        value="1"
      />,
    );
    expect(screen.queryByText(/trend:/)).not.toBeInTheDocument();

    rerender(
      <CountWidget
        metricKey={MetricKey.bugs}
        metricType={MetricType.Integer}
        showTrendIndicator
        trendIndicatorData={{ isPending: false, trendData: null }}
        value="1"
      />,
    );
    expect(screen.getByText('trend:false')).toBeInTheDocument();
  });

  it('places sparkline beside the count with trend below when grid height is under 5 rows', () => {
    render(
      <WidgetInstanceProvider dimensions={{ height: 4, width: 3 }} widgetKey="w1">
        <CountWidget
          metricKey={MetricKey.bugs}
          metricType={MetricType.Integer}
          showTrendIndicator
          sparklineSeries={[1, 2, 3]}
          trendIndicatorData={{ isPending: false, trendData: null }}
          value="1"
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('count-sparkline')).toHaveAttribute('data-fullwidth', 'false');
    expect(screen.getByTestId('count-sparkline')).toHaveClass(
      'sw-min-w-0',
      'sw-max-w-[80px]',
      'sw-flex-1',
    );
    expect(screen.getByTestId('count-sparkline')).toHaveAttribute(
      'data-preserve-aspect-ratio',
      'none',
    );
    expect(screen.getByText('trend:false')).toBeInTheDocument();
  });

  it('places full-width sparkline below the count and trend when grid height is at least 5 rows', () => {
    render(
      <WidgetInstanceProvider dimensions={{ height: 5, width: 4 }} widgetKey="w1">
        <CountWidget
          metricKey={MetricKey.bugs}
          metricType={MetricType.Integer}
          showTrendIndicator
          sparklineSeries={[1, 2, 3]}
          trendIndicatorData={{ isPending: false, trendData: null }}
          value="1"
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('count-widget')).toHaveClass('sw-justify-center');
    expect(screen.getByTestId('count-sparkline')).toHaveAttribute('data-fullwidth', 'true');
    expect(screen.getByText('trend:false')).toBeInTheDocument();
  });

  it('does not render sparkline when no series is provided', () => {
    render(
      <WidgetInstanceProvider dimensions={{ height: 5, width: 4 }} widgetKey="w1">
        <CountWidget
          metricKey={MetricKey.bugs}
          metricType={MetricType.Integer}
          showTrendIndicator
          trendIndicatorData={{ isPending: false, trendData: null }}
          value="1"
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.queryByTestId('count-sparkline')).not.toBeInTheDocument();
    expect(screen.getByText('trend:false')).toBeInTheDocument();
  });

  it('renders empty sparkline data when an empty series is provided', () => {
    render(
      <WidgetInstanceProvider dimensions={{ height: 5, width: 4 }} widgetKey="w1">
        <CountWidget
          metricKey={MetricKey.bugs}
          metricType={MetricType.Integer}
          showTrendIndicator
          sparklineSeries={[]}
          trendIndicatorData={{ isPending: false, trendData: null }}
          value="1"
        />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByTestId('count-sparkline')).toHaveAttribute('data-length', '0');
    expect(screen.getByText('trend:false')).toBeInTheDocument();
  });

  it('does not render sparkline when trend is disabled', () => {
    render(
      <CountWidget
        metricKey={MetricKey.bugs}
        metricType={MetricType.Integer}
        sparklineSeries={[9, 8]}
        value="1"
      />,
    );

    expect(screen.queryByTestId('count-sparkline')).not.toBeInTheDocument();
  });
});

describe('isCountWidgetTrendVisible', () => {
  const rawMetric = {
    metricKey: MetricKey.bugs,
    type: DashboardMetricType.Raw,
  } satisfies DashboardMetric;
  const richMetric = {
    measureFilters: {},
    metricKey: RichMetricKey.Issues,
    type: DashboardMetricType.Rich,
  } satisfies DashboardMetric;

  it('returns true when showTrendIndicator is true for raw metrics', () => {
    expect(isCountWidgetTrendVisible(true, rawMetric, CodeScope.Overall)).toBe(true);
  });

  it('returns false when showTrendIndicator is false for raw metrics', () => {
    expect(isCountWidgetTrendVisible(false, rawMetric, CodeScope.Overall)).toBe(false);
  });

  it('returns true for overall issue-count metrics when showTrendIndicator is true', () => {
    expect(isCountWidgetTrendVisible(true, richMetric, CodeScope.Overall)).toBe(true);
  });

  it('returns false for new-code issue-count metrics even when showTrendIndicator is true', () => {
    expect(isCountWidgetTrendVisible(true, richMetric, CodeScope.New)).toBe(false);
  });
});
