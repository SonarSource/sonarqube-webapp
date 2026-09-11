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
import type { WidgetMetricPickerOptions } from '~feature-dashboards/types/widget-common';
import { projectDashboardSupportsNewCodeScopeForVisualization } from '~feature-dashboards/utils/projectWidgetData';
import { appendIssueDensityOption } from '~feature-dashboards/widget-creation-modal/utils/issueDensityMetricOptions';
import { appendIssueResolutionOptions } from '~feature-dashboards/widget-creation-modal/utils/issueResolutionMetricOptions';
import { buildPieChartMetricSelectOptions } from '~feature-dashboards/widget-creation-modal/utils/pieChartMetricSelectOptions';
import { appendScaMttrOption } from '~feature-dashboards/widget-creation-modal/utils/scaResolutionMetricOptions';
import { MetricKey } from '~shared/types/metrics';
import {
  buildMetricGroups,
  type MetricGroupDefinition,
} from '~sq-server-commons/components/dashboards/metricPickerOptions';
import { sqsDashboardSupportsPieChartSlice } from '~sq-server-commons/helpers/dashboard-pie-chart-capabilities';
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
    keys: [
      MetricKey.comment_lines,
      MetricKey.comment_lines_density,
      MetricKey.lines,
      MetricKey.ncloc,
    ],
  },
];

const PROJECT_WIDGET_METRICS = new Set(PROJECT_WIDGET_METRIC_GROUPS.flatMap(({ keys }) => keys));

const PROJECT_SCA_METRIC_GROUPS: readonly MetricGroupDefinition[] = [
  {
    domain: 'DependencyRisks',
    keys: [
      MetricKey.sca_count_any_issue,
      MetricKey.sca_count_any_security,
      MetricKey.sca_count_vulnerability,
      MetricKey.sca_count_malware,
      MetricKey.sca_count_licensing,
    ],
  },
];

const PROJECT_SCA_METRICS = new Set(PROJECT_SCA_METRIC_GROUPS.flatMap(({ keys }) => keys));

const PROJECT_RATING_BADGE_METRIC_GROUPS: readonly MetricGroupDefinition[] = [
  { domain: 'Quality gate', keys: [MetricKey.alert_status] },
  { domain: 'Security', keys: [MetricKey.security_rating] },
  { domain: 'Reliability', keys: [MetricKey.reliability_rating] },
  { domain: 'Maintainability', keys: [MetricKey.sqale_rating] },
];

const PROJECT_RATING_BADGE_METRICS = new Set(
  PROJECT_RATING_BADGE_METRIC_GROUPS.flatMap(({ keys }) => keys),
);

const PROJECT_SCA_RATING_BADGE_METRIC_GROUPS: readonly MetricGroupDefinition[] = [
  {
    domain: 'DependencyRisks',
    keys: [
      MetricKey.sca_rating_any_issue,
      MetricKey.sca_rating_any_security,
      MetricKey.sca_rating_vulnerability,
      MetricKey.sca_rating_malware,
      MetricKey.sca_rating_licensing,
    ],
  },
];

const PROJECT_SCA_RATING_BADGE_METRICS = new Set(
  PROJECT_SCA_RATING_BADGE_METRIC_GROUPS.flatMap(({ keys }) => keys),
);

export function sqsProjectDashboardSupportsNewCodeScopeForPieChart(
  metric: PieChartMetric,
): boolean {
  return metric !== PieChartMetric.IssueCount && metric !== PieChartMetric.LineCount;
}

// Temporary catalog; replace it with the SQS project metric metadata API response when available.
export function getSqsProjectWidgetMetricPickerOptions(
  intl: Pick<IntlShape, 'formatMessage'>,
  isScaEnabled = false,
): WidgetMetricPickerOptions {
  const { formatMessage } = intl;
  const issuesGroupLabel = getLocalizedMetricDomain('Issues');
  let projectMetrics = buildMetricGroups(
    PROJECT_WIDGET_METRIC_GROUPS,
    PROJECT_WIDGET_METRICS,
    formatMessage,
  );
  if (isScaEnabled) {
    projectMetrics = [
      ...projectMetrics,
      ...buildMetricGroups(PROJECT_SCA_METRIC_GROUPS, PROJECT_SCA_METRICS, formatMessage),
    ];
  }

  let enrichedMetrics = appendIssueResolutionOptions(
    appendIssueDensityOption(projectMetrics, formatMessage, issuesGroupLabel),
    formatMessage,
    issuesGroupLabel,
  );
  if (isScaEnabled) {
    enrichedMetrics = appendScaMttrOption(
      enrichedMetrics,
      formatMessage,
      getLocalizedMetricDomain('DependencyRisks'),
    );
  }

  const ratingBadgeMetrics = buildMetricGroups(
    PROJECT_RATING_BADGE_METRIC_GROUPS,
    PROJECT_RATING_BADGE_METRICS,
    formatMessage,
  );

  return {
    countMetrics: enrichedMetrics,
    enableNewDashboardWidgets: true,
    isPortfolioWidgetConfigurator: false,
    lineChartMetrics: enrichedMetrics,
    pieChartMetricOptions: buildPieChartMetricSelectOptions(formatMessage).filter(
      ({ value }) => value !== PieChartMetric.HotspotCount,
    ),
    supportsPieChartSlice: sqsDashboardSupportsPieChartSlice,
    supportsNewCodeScopeForPieChart: sqsProjectDashboardSupportsNewCodeScopeForPieChart,
    ratingBadgeMetrics: isScaEnabled
      ? [
          ...ratingBadgeMetrics,
          ...buildMetricGroups(
            PROJECT_SCA_RATING_BADGE_METRIC_GROUPS,
            PROJECT_SCA_RATING_BADGE_METRICS,
            formatMessage,
          ),
        ]
      : ratingBadgeMetrics,
    supportsNewCodeIssueLanguageSlice: false,
    supportsNewCodeScopeForMetric: projectDashboardSupportsNewCodeScopeForVisualization,
  };
}
