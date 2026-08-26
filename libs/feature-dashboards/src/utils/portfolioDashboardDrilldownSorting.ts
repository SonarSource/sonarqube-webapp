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

import { MetricKey } from '~shared/types/metrics';
import { isQualityGateStatusWidget } from '../components/pie-chart/utils';
import type { WidgetInstance } from '../dashboard-layout/logic/types';
import type { PortfolioDashboardWidgetPropMap } from '../types/dashboard-widget';
import { getActualMetricKey } from '../widget-creation-modal/utils/getActualMetricKey';

type PortfolioDashboardWidget = WidgetInstance<PortfolioDashboardWidgetPropMap>;

export enum PortfolioDashboardDrilldownSortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * Opinionated, worst-first defaults for portfolio drilldowns.
 *
 * Ratings are stored as numbers (A = 1, E = 5), so descending produces E → A.
 * Quality gate statuses sort ascending because their stored values put failed before passed.
 */
const PORTFOLIO_DRILLDOWN_DEFAULT_SORT_BY_METRIC: Readonly<
  Partial<Record<MetricKey, PortfolioDashboardDrilldownSortOrder>>
> = {
  [MetricKey.alert_status]: PortfolioDashboardDrilldownSortOrder.Asc,
  [MetricKey.branch_coverage]: PortfolioDashboardDrilldownSortOrder.Asc,
  [MetricKey.coverage]: PortfolioDashboardDrilldownSortOrder.Asc,
  [MetricKey.line_coverage]: PortfolioDashboardDrilldownSortOrder.Asc,
  [MetricKey.security_hotspots_reviewed]: PortfolioDashboardDrilldownSortOrder.Asc,

  [MetricKey.comment_lines]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.comment_lines_density]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.conditions_to_cover]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.duplicated_blocks]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.duplicated_files]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.duplicated_lines]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.duplicated_lines_density]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.lines_to_cover]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.accepted_issues]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.false_positive_issues]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.maintainability_issues]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.maintainability_rating]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.ncloc]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.open_issues]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.reliability_issues]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.reliability_rating]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.releasability_rating]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.reliability_remediation_effort]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_count_any_issue]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_count_any_security]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_count_licensing]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_count_malware]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_count_vulnerability]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_rating_any_issue]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_rating_any_security]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_rating_licensing]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_rating_malware]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sca_rating_vulnerability]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.security_rating]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.security_remediation_effort]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.security_review_rating]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.security_hotspots]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.security_issues]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sqale_debt_ratio]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.sqale_index]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.uncovered_conditions]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.uncovered_lines]: PortfolioDashboardDrilldownSortOrder.Desc,
  [MetricKey.violations]: PortfolioDashboardDrilldownSortOrder.Desc,
};

export function getPortfolioDashboardDrilldownDefaultSortOrder(
  metricKey: MetricKey | undefined,
): PortfolioDashboardDrilldownSortOrder {
  return metricKey === undefined
    ? PortfolioDashboardDrilldownSortOrder.Desc
    : (PORTFOLIO_DRILLDOWN_DEFAULT_SORT_BY_METRIC[metricKey] ??
        PortfolioDashboardDrilldownSortOrder.Desc);
}

export function getPortfolioDashboardDrilldownWidgetDefaultSortOrder(
  widget: PortfolioDashboardWidget | undefined,
): PortfolioDashboardDrilldownSortOrder {
  if (widget?.type === 'count') {
    return getPortfolioDashboardDrilldownDefaultSortOrder(getActualMetricKey(widget.props.metric));
  }

  if (widget?.type === 'ratingBadge') {
    return getPortfolioDashboardDrilldownDefaultSortOrder(widget.props.metricKey);
  }

  if (
    (widget?.type === 'pieChart' || widget?.type === 'donutChart') &&
    isQualityGateStatusWidget(widget.props)
  ) {
    return getPortfolioDashboardDrilldownDefaultSortOrder(MetricKey.alert_status);
  }

  return PortfolioDashboardDrilldownSortOrder.Desc;
}

export function toPortfolioDashboardProjectIssueCountsSort(
  order: PortfolioDashboardDrilldownSortOrder,
): string {
  const byCount =
    order === PortfolioDashboardDrilldownSortOrder.Asc ? '+issueCount' : '-issueCount';
  return `${byCount},+projectName`;
}

export function toPortfolioDashboardProjectMeasuresSort(
  order: PortfolioDashboardDrilldownSortOrder,
): string {
  const byMeasure =
    order === PortfolioDashboardDrilldownSortOrder.Asc
      ? '+measure.currentValue'
      : '-measure.currentValue';
  return `${byMeasure},+projectName`;
}
