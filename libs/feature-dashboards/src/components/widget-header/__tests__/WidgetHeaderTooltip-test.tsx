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
import { SharedDocLink } from '~adapters/helpers/docs';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { DashboardMetricType } from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { WidgetHeaderTooltip } from '../WidgetHeaderTooltip';

const tooltipCases = [
  {
    messageId: 'dashboard.widget.header.title.issues_closed_tooltip',
    metric: {
      statistic: IssueResolutionStatistic.ResolvedIssues,
      type: DashboardMetricType.IssueResolution,
    },
  },
  {
    messageId: 'dashboard.widget.header.title.mttr_tooltip',
    metric: {
      statistic: IssueResolutionStatistic.MTTR,
      type: DashboardMetricType.IssueResolution,
    },
  },
  {
    messageId: 'dashboard.widget.header.title.recent_mttr_tooltip',
    metric: {
      statistic: IssueResolutionStatistic.RecentMTTR,
      type: DashboardMetricType.IssueResolution,
    },
  },
  {
    messageId: 'dashboard.widget.header.title.sca_mttr_tooltip',
    metric: { type: DashboardMetricType.ScaResolution },
  },
  {
    messageId: 'dashboard.widget.header.title.issue_density_tooltip',
    metric: { type: DashboardMetricType.IssueDensity },
  },
] as const;

describe('WidgetHeaderTooltip', () => {
  it.each(tooltipCases)(
    'renders the tooltip for the configured metric',
    async ({ messageId, metric }) => {
      renderWithRouter(<WidgetHeaderTooltip metric={metric} />);

      await expect(
        screen.getByRole('button', { name: 'toggletip.help' }),
      ).toHaveAPopoverWithContent(messageId);
    },
  );

  it.each([
    ['project', false, SharedDocLink.ProjectDashboardMetrics],
    ['portfolio', true, SharedDocLink.PortfolioDashboardMetrics],
  ] as const)('links to the %s metrics documentation', async (_, isPortfolio, expectedPath) => {
    const { user } = renderWithRouter(
      <WidgetHeaderTooltip
        isPortfolio={isPortfolio}
        metric={{
          statistic: IssueResolutionStatistic.MTTR,
          type: DashboardMetricType.IssueResolution,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'toggletip.help' }));

    expect(await screen.findByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining(expectedPath),
    );
  });

  it('does not render for a metric without tooltip support', () => {
    renderWithRouter(
      <WidgetHeaderTooltip
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
      />,
    );

    expect(screen.queryByRole('button', { name: 'toggletip.help' })).not.toBeInTheDocument();
  });
});
