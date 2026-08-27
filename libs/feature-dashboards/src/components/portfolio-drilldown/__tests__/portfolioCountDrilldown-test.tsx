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
import type { IntlShape } from 'react-intl';
import { renderWithContext } from '~shared/helpers/test-utils';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { DashboardMetricType, IssueStatus, RichMetricKey } from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import { PortfolioCountDrilldownPreview } from '../PortfolioCountDrilldownPreview';
import { getPortfolioCountWidgetDrilldownDescriptor } from '../portfolioCountDrilldown';

const mockPortfolioCountWidgetWrapper = jest.fn(({ metric }: { metric: { metricKey: string } }) => (
  <div data-testid="count-widget-preview">{metric.metricKey}</div>
));

jest.mock('../../../widget-wrappers/count/PortfolioCountWidgetWrapper', () => ({
  PortfolioCountWidgetWrapper: (props: { metric: { metricKey: string } }) =>
    mockPortfolioCountWidgetWrapper(props),
}));

const formatMessage = (({ id }: { id: string }) => id) as IntlShape['formatMessage'];
const localization = {
  formatMessage,
  getLocalizedMetricName: ({ key }: { key: string }) => key,
};

describe('portfolioCountDrilldown', () => {
  it('renders the shared count preview with its scope and drilldown link suppressed', () => {
    renderWithContext(
      <PortfolioCountDrilldownPreview
        title="Coverage"
        widget={{
          metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
          scope: CodeScope.New,
          showTrendIndicator: true,
        }}
      />,
    );

    expect(screen.getByText('Coverage')).toBeInTheDocument();
    expect(screen.getByText('dashboard_widget.codescope.new')).toBeInTheDocument();
    expect(screen.getByTestId('count-widget-preview')).toHaveTextContent(MetricKey.coverage);
    expect(mockPortfolioCountWidgetWrapper).toHaveBeenCalledWith(
      expect.objectContaining({ suppressPortfolioDrilldownLink: true }),
    );
  });

  it('builds integer measure and hotspot issue-count descriptors', () => {
    expect(
      getPortfolioCountWidgetDrilldownDescriptor({
        ...localization,
        widget: {
          metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
          scope: CodeScope.Overall,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        kind: 'computed-measures',
        numericFormatMetricType: MetricType.Integer,
      }),
    );

    expect(
      getPortfolioCountWidgetDrilldownDescriptor({
        ...localization,
        widget: {
          metric: { metricKey: RichMetricKey.Hotspots, type: DashboardMetricType.Rich },
          scope: CodeScope.Overall,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        kind: 'issue-counts',
        request: { issueTypes: ['SECURITY_HOTSPOT'] },
      }),
    );
  });

  it('formats percent metrics and requests their new-code measure', () => {
    expect(
      getPortfolioCountWidgetDrilldownDescriptor({
        ...localization,
        widget: {
          metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
          scope: CodeScope.New,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        numericFormatMetricType: MetricType.Percent,
        request: { metricKey: MetricKey.new_coverage },
      }),
    );
  });

  it('returns no descriptor for unsupported count metric types', () => {
    expect(
      getPortfolioCountWidgetDrilldownDescriptor({
        ...localization,
        widget: {
          metric: { type: DashboardMetricType.IssueDensity },
          scope: CodeScope.Overall,
        },
      }),
    ).toBeNull();
  });

  it('preserves explicit impact, status, and severity-only issue filters', () => {
    expect(
      getPortfolioCountWidgetDrilldownDescriptor({
        ...localization,
        widget: {
          metric: {
            measureFilters: {
              impactSeverities: [SoftwareImpactSeverity.High],
              impactSoftwareQuality: SoftwareQuality.Security,
              issueStatus: IssueStatus.Accepted,
            },
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        request: { impacts: ['SECURITY:HIGH'], statuses: ['ACCEPTED'] },
      }),
    );

    expect(
      getPortfolioCountWidgetDrilldownDescriptor({
        ...localization,
        widget: {
          metric: {
            measureFilters: { impactSeverities: [SoftwareImpactSeverity.High] },
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          scope: CodeScope.Overall,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        request: { severities: ['HIGH'], statuses: ['OPEN'] },
      }),
    );
  });
});
