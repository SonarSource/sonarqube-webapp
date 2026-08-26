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
import { PieChartMetric } from '~feature-dashboards/types/dashboard-widget';
import {
  VisualizationType,
  type DashboardWidgetType,
  type WidgetMetricPickerOptions,
} from '~feature-dashboards/types/widget-common';
import { appendIssueDensityOption } from '~feature-dashboards/widget-creation-modal/utils/issueDensityMetricOptions';
import { appendIssueResolutionOptions } from '~feature-dashboards/widget-creation-modal/utils/issueResolutionMetricOptions';
import { buildPieChartMetricSelectOptions } from '~feature-dashboards/widget-creation-modal/utils/pieChartMetricSelectOptions';
import { MetricKey } from '~shared/types/metrics';
import {
  buildMetricGroups,
  type MetricGroupDefinition,
} from '~sq-server-commons/components/dashboards/metricPickerOptions';
import { getLocalizedMetricDomain } from '~sq-server-commons/helpers/l10n';

const PROJECT_WIDGET_METRIC_GROUPS: readonly MetricGroupDefinition[] = [
  { domain: 'Issues', keys: [MetricKey.violations] },
  {
    domain: 'Security',
    keys: [MetricKey.security_remediation_effort],
  },
  { domain: 'Reliability', keys: [MetricKey.reliability_remediation_effort] },
  {
    domain: 'Maintainability',
    keys: [
      MetricKey.effort_to_reach_maintainability_rating_a,
      MetricKey.sqale_debt_ratio,
      MetricKey.new_sqale_debt_ratio,
    ],
  },
  {
    domain: 'Coverage',
    keys: [
      MetricKey.coverage,
      MetricKey.lines_to_cover,
      MetricKey.conditions_to_cover,
      MetricKey.uncovered_conditions,
      MetricKey.uncovered_lines,
      MetricKey.line_coverage,
    ],
  },
  {
    domain: 'Duplication',
    keys: [
      MetricKey.duplicated_lines,
      MetricKey.duplicated_lines_density,
      MetricKey.duplicated_blocks,
      MetricKey.duplicated_files,
    ],
  },
  {
    domain: 'Size',
    keys: [MetricKey.comment_lines, MetricKey.comment_lines_density, MetricKey.lines],
  },
];

const PROJECT_WIDGET_METRICS = new Set(PROJECT_WIDGET_METRIC_GROUPS.flatMap(({ keys }) => keys));

const PROJECT_RATING_BADGE_METRIC_GROUPS: readonly MetricGroupDefinition[] = [
  { domain: 'Quality gate', keys: [MetricKey.alert_status] },
  { domain: 'Security', keys: [MetricKey.security_rating] },
  { domain: 'Reliability', keys: [MetricKey.reliability_rating] },
  { domain: 'Maintainability', keys: [MetricKey.sqale_rating] },
];

const PROJECT_RATING_BADGE_METRICS = new Set(
  PROJECT_RATING_BADGE_METRIC_GROUPS.flatMap(({ keys }) => keys),
);

function supportsNewCodeScopeForMetric(
  metricKey: MetricKey,
  visualizationType: DashboardWidgetType,
) {
  return !metricKey.startsWith('new_') && visualizationType !== VisualizationType.TopList;
}

// Temporary catalog; replace it with the SQS project metric metadata API response when available.
export function getSqsProjectWidgetMetricPickerOptions(
  intl: Pick<IntlShape, 'formatMessage'>,
): WidgetMetricPickerOptions {
  const { formatMessage } = intl;
  const issuesGroupLabel = getLocalizedMetricDomain('Issues');
  const projectMetrics = buildMetricGroups(
    PROJECT_WIDGET_METRIC_GROUPS,
    PROJECT_WIDGET_METRICS,
    formatMessage,
  );
  const enrichedMetrics = appendIssueResolutionOptions(
    appendIssueDensityOption(projectMetrics, formatMessage, issuesGroupLabel),
    formatMessage,
    issuesGroupLabel,
  );

  return {
    countMetrics: enrichedMetrics,
    enableNewDashboardWidgets: true,
    isPortfolioWidgetConfigurator: false,
    lineChartMetrics: enrichedMetrics,
    pieChartMetricOptions: buildPieChartMetricSelectOptions(formatMessage).filter(
      ({ value }) => value !== PieChartMetric.HotspotCount,
    ),
    ratingBadgeMetrics: buildMetricGroups(
      PROJECT_RATING_BADGE_METRIC_GROUPS,
      PROJECT_RATING_BADGE_METRICS,
      formatMessage,
    ),
    supportsNewCodeScopeForMetric,
  };
}
