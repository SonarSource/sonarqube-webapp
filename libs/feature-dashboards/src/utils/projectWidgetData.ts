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
import { VisualizationType, type DashboardWidgetType } from '../types/widget-common';

export { getMetricKeyForScope } from '~shared/helpers/metrics';

const METRIC_KEYS = new Set<string>(Object.values(MetricKey));

/** Rule display metadata keyed by rule key, e.g. `{ 'java:S1234': { name } }`. */
export type ProjectRuleMetadataByKey = Record<string, { name: string }>;

/**
 * Builds a rule-label metadata map keyed by rule key, dropping `langName` so project dashboard
 * widgets render the bare rule name (no `(Java)` prefix).
 */
export function buildProjectRuleLabelMap(
  rules: ReadonlyArray<{ key: string; name: string }> | undefined,
): ProjectRuleMetadataByKey | undefined {
  if (!rules) {
    return undefined;
  }

  return Object.fromEntries(rules.map((rule) => [rule.key, { name: rule.name }]));
}

export function projectMetricSupportsNewCodeScope(metricKey: MetricKey): boolean {
  if (metricKey.startsWith('new_')) {
    return false;
  }
  if (metricKey === MetricKey.sqale_rating) {
    return true;
  }
  return METRIC_KEYS.has(`new_${metricKey}`);
}

export function projectDashboardSupportsNewCodeScopeForVisualization(
  metricKey: MetricKey,
  visualizationType: DashboardWidgetType,
): boolean {
  if (visualizationType === VisualizationType.TopList) {
    return false;
  }
  if (visualizationType === VisualizationType.LineChart && metricKey === MetricKey.violations) {
    return false;
  }
  if (
    visualizationType === VisualizationType.Count ||
    visualizationType === VisualizationType.LineChart
  ) {
    return projectMetricSupportsNewCodeScope(metricKey);
  }
  return metricKey !== MetricKey.alert_status && projectMetricSupportsNewCodeScope(metricKey);
}
