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

import { ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { boldFormatter, lineBreakFormatter, linkFormatter } from '~shared/helpers/intl';
import { MetricKey } from '~shared/types/metrics';
import { DashboardMetric, DashboardMetricType } from '../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { ScaResolutionStatistic } from '../../types/organization-sca-resolution-history';

const ISSUE_DENSITY_TOOLTIP_KEY = 'issue_density' as const;

export type WidgetHeaderTooltipKey =
  IssueResolutionStatistic | ScaResolutionStatistic | typeof ISSUE_DENSITY_TOOLTIP_KEY;

/** Raw metric keys that use the issue density header tooltip. Extend when wired in dashboard widgets. */
const ISSUE_DENSITY_METRIC_KEYS = new Set<MetricKey>([]);

export interface WidgetHeaderTooltipConfig {
  messageId: string;
  titleMessageId?: string;
}

type WidgetHeaderTooltipInput = { metric: DashboardMetric } | { metricKey: MetricKey };

type WidgetHeaderTooltipProps = WidgetHeaderTooltipInput & {
  isPortfolio?: boolean;
};

const TOOLTIP_CONFIG: Record<WidgetHeaderTooltipKey, WidgetHeaderTooltipConfig> = {
  [IssueResolutionStatistic.ResolvedIssues]: {
    messageId: 'dashboard.widget.header.title.issues_closed_tooltip',
  },
  [IssueResolutionStatistic.MTTR]: {
    messageId: 'dashboard.widget.header.title.mttr_tooltip',
    titleMessageId: 'dashboard.widget.header.tooltip.mttr.title',
  },
  [IssueResolutionStatistic.RecentMTTR]: {
    messageId: 'dashboard.widget.header.title.recent_mttr_tooltip',
    titleMessageId: 'dashboard.widget.header.tooltip.recent_mttr.title',
  },
  [ScaResolutionStatistic.ScaMTTR]: {
    messageId: 'dashboard.widget.header.title.sca_mttr_tooltip',
    titleMessageId: 'dashboard.widget.header.tooltip.sca_mttr.title',
  },
  [ISSUE_DENSITY_TOOLTIP_KEY]: {
    messageId: 'dashboard.widget.header.title.issue_density_tooltip',
  },
};

function getWidgetHeaderTooltipKey(
  props: WidgetHeaderTooltipInput,
): WidgetHeaderTooltipKey | undefined {
  if (!('metric' in props)) {
    return ISSUE_DENSITY_METRIC_KEYS.has(props.metricKey) ? ISSUE_DENSITY_TOOLTIP_KEY : undefined;
  }

  const { metric } = props;

  if (metric.type === DashboardMetricType.IssueResolution) {
    return metric.statistic;
  }

  if (metric.type === DashboardMetricType.ScaResolution) {
    return ScaResolutionStatistic.ScaMTTR;
  }

  if (metric.type === DashboardMetricType.IssueDensity) {
    return ISSUE_DENSITY_TOOLTIP_KEY;
  }

  if (metric.type === DashboardMetricType.Raw && ISSUE_DENSITY_METRIC_KEYS.has(metric.metricKey)) {
    return ISSUE_DENSITY_TOOLTIP_KEY;
  }

  return undefined;
}

function getWidgetHeaderTooltipConfig(key: WidgetHeaderTooltipKey): WidgetHeaderTooltipConfig {
  return TOOLTIP_CONFIG[key];
}

export function WidgetHeaderTooltip({
  isPortfolio = false,
  ...props
}: Readonly<WidgetHeaderTooltipProps>) {
  const docLink = isPortfolio
    ? SharedDocLink.PortfolioDashboardMetrics
    : SharedDocLink.ProjectDashboardMetrics;
  const documentationUrl = useSharedDocUrl(docLink);
  const tooltipKey = getWidgetHeaderTooltipKey(props);

  if (tooltipKey === undefined) {
    return null;
  }

  const tooltipConfig = getWidgetHeaderTooltipConfig(tooltipKey);

  return (
    <ToggleTip
      className="sw-shrink-0"
      description={
        <FormattedMessage
          id={tooltipConfig.messageId}
          values={{
            b: boldFormatter,
            br: lineBreakFormatter,
            link: (text) => linkFormatter(text, documentationUrl, { enableOpenInNewTab: true }),
          }}
        />
      }
      title={
        tooltipConfig.titleMessageId ? (
          <FormattedMessage id={tooltipConfig.titleMessageId} />
        ) : undefined
      }
    />
  );
}
