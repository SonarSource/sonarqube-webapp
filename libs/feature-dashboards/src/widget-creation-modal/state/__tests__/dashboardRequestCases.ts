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

import { safeParse } from 'valibot';
import {
  type CompleteWidgetConfig,
  projectDashboardWidgetPropsSchemaByType,
} from '../../../data/widgets';
import { IssueStatus } from '../../../data/widgets/shared';
import {
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  type PieChartSlice,
} from '../../../types/dashboard-widget';
import { VisualizationType } from '../../../types/widget-common';
import { getActualMetricKey } from '../../utils/getActualMetricKey';
import { widgetConfigReducer } from '../reducers/widgetConfigReducer';
import { extractCompleteConfig } from '../selectors/widgetConfigSelectors';
import type { WidgetConfigAction, WidgetConfigState } from '../widgetConfigTypes';
import { getWidgetCreationMatrix } from './widgetCreationMatrix';

export interface DashboardRequestCase {
  config: CompleteWidgetConfig;
  id: string;
}

// This suite is intentionally fragile: changes to valid widget settings or fetched data
// should change its snapshots. Review those changes before updating the recorded contract.
export function createDashboardRequestCases(
  options: Parameters<typeof getWidgetCreationMatrix>[0],
  minimumCount = 128,
  seed = 0x62634,
): DashboardRequestCase[] {
  const configs = getWidgetCreationMatrix(options).filter((config) =>
    isReachableFromPicker(config, options.metricPickerOptions),
  );
  const reducerOptions = options.metricPickerOptions;
  const candidates = new Map(configs.map((config) => [JSON.stringify(config), config]));

  // The existing creation matrix predates configurable pie status selections.
  for (const config of configs) {
    if (
      (config.widgetType !== VisualizationType.PieChart &&
        config.widgetType !== VisualizationType.DonutChart) ||
      config.metric !== PieChartMetric.IssueCount ||
      config.slice === PieChartIssueSlice.IssueStatuses
    ) {
      continue;
    }
    for (const statuses of [
      [IssueStatus.Open],
      [IssueStatus.Accepted],
      [IssueStatus.Open, IssueStatus.Confirmed],
      [IssueStatus.Accepted, IssueStatus.FalsePositive],
    ]) {
      const actions: WidgetConfigAction[] = [
        { type: 'SET_WIDGET_TYPE', widgetType: config.widgetType },
        { type: 'SET_PIE_METRIC', metric: config.metric },
        { type: 'SET_PIE_SLICE', slice: config.slice },
        { type: 'SET_PIE_SCOPE', scope: config.scope },
        { type: 'SET_PIE_FILTER', filter: config.filter },
        { type: 'SET_PIE_SHOW_LEGEND', showLegend: config.showLegend },
        { type: 'SET_PIE_ISSUE_STATUSES', issueStatuses: statuses },
      ];
      const state = actions.reduce<WidgetConfigState>(
        (current, action) => widgetConfigReducer(current, action, reducerOptions),
        { configs: {}, selectedType: null },
      );
      const variant = extractCompleteConfig(state);
      if (variant) {
        candidates.set(JSON.stringify(variant), variant);
      }
    }
  }

  let randomState = seed;
  const random = () => {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return (randomState >>> 0) / 0x100000000;
  };
  const shuffled = [...candidates.values()];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }

  const tagged = shuffled.map((config) => ({ config, tags: coverageTags(config) }));
  const remaining = new Set(tagged.flatMap(({ tags }) => tags));
  const selected = new Set<CompleteWidgetConfig>();
  while (remaining.size > 0) {
    let best: (typeof tagged)[number] | undefined;
    let bestScore = 0;
    for (const candidate of tagged) {
      const score = candidate.tags.filter((tag) => remaining.has(tag)).length;
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
    if (!best) {
      throw new Error('Could not cover the reachable dashboard widget settings');
    }
    selected.add(best.config);
    for (const tag of best.tags) {
      remaining.delete(tag);
    }
  }
  for (const config of shuffled) {
    if (selected.size >= minimumCount) {
      break;
    }
    selected.add(config);
  }

  const cases = [...selected].map((config) => {
    const { widgetType, ...props } = config;
    const validation = safeParse(projectDashboardWidgetPropsSchemaByType[widgetType], props);
    if (!validation.success) {
      throw new Error(
        `Invalid generated ${widgetType} widget: ${JSON.stringify(validation.issues)}`,
      );
    }
    let hash = 2166136261;
    for (const character of JSON.stringify(config)) {
      hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
    }
    return { config, id: `${widgetType}-${(hash >>> 0).toString(16).padStart(8, '0')}` };
  });
  if (new Set(cases.map(({ id }) => id)).size !== cases.length) {
    throw new Error('Dashboard request case IDs collided');
  }
  return cases;
}

function isReachableFromPicker(
  config: CompleteWidgetConfig,
  options: Parameters<typeof getWidgetCreationMatrix>[0]['metricPickerOptions'],
): boolean {
  if (
    config.widgetType !== VisualizationType.PieChart &&
    config.widgetType !== VisualizationType.DonutChart
  ) {
    return true;
  }
  // DefineWidgetAccordion's metric-specific menu is stricter than the shared slice schema.
  // Keep this test-only mapping in sync with that menu when adding widget capabilities.
  const slices: Record<PieChartMetric, PieChartSlice[]> = {
    [PieChartMetric.IssueCount]: Object.values(PieChartIssueSlice),
    [PieChartMetric.HotspotCount]: Object.values(PieChartHotspotSlice),
    [PieChartMetric.LineCount]: Object.values(PieChartLineSlice),
    [PieChartMetric.ProjectCount]: Object.values(PieChartProjectSlice),
  };
  if (
    options.isPortfolioWidgetConfigurator &&
    config.metric === PieChartMetric.IssueCount &&
    (config.slice === PieChartIssueSlice.CleanCodeAttributeCategories ||
      (config.slice === PieChartIssueSlice.Languages &&
        !options.supportsPortfolioIssueLanguageSlice))
  ) {
    return false;
  }
  return (
    slices[config.metric].includes(config.slice) &&
    (options.supportsPieChartSlice?.(config.metric, config.slice) ?? true)
  );
}

function coverageTags(config: CompleteWidgetConfig): string[] {
  const prefix = config.widgetType;
  const metric = 'metricKey' in config ? config.metricKey : config.metric;
  const family = typeof metric === 'string' ? metric : metric.type;
  const key = typeof metric === 'string' ? metric : getActualMetricKey(metric);
  const tags = [`${prefix}/metric/${key}/${config.scope}`];
  if (typeof metric !== 'string') {
    const filters = 'measureFilters' in metric ? metric.measureFilters : undefined;
    tags.push(`${prefix}/${family}/filters/${filters === undefined ? 'default' : 'selected'}`);
  }
  for (const [property, value] of Object.entries(config)) {
    if (property !== 'metric' && property !== 'metricKey' && property !== 'widgetType') {
      tags.push(`${prefix}/${family}/${property}/${JSON.stringify(value)}`);
    }
  }
  if (typeof metric !== 'string' && 'measureFilters' in metric) {
    for (const [property, value] of Object.entries(metric.measureFilters ?? {})) {
      tags.push(`${prefix}/${family}/filter/${property}/${JSON.stringify(value)}`);
    }
  }
  return tags;
}
