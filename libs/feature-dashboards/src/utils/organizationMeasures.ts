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
import { PieChartLineSlice } from '../types/dashboard-widget';
import { CodeScope } from '../types/widget-common';
import { parseLanguageDistributionCounts } from './languageDistribution';
import {
  buildCoverageLineCountCounts,
  buildDuplicationsLineCountCounts,
} from './lineCountPieChart';
import { getPortfolioDashboardMeasureRequestKey } from './portfolioMeasures';

function parseOrganizationMeasureNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return undefined;
  }

  const parsedNumber = Number.parseFloat(String(value));
  return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
}

function getOrganizationMeasureValue(
  measures: Record<string, unknown>,
  metricKey: MetricKey,
  scope: CodeScope,
): number | undefined {
  return parseOrganizationMeasureNumber(
    measures[getPortfolioDashboardMeasureRequestKey(metricKey, scope === CodeScope.New)],
  );
}

export function organizationMeasuresToLineCountPieData(
  measures: Record<string, unknown> | undefined,
  slice: PieChartLineSlice,
  scope: CodeScope,
): { counts: Record<string, number> } {
  if (!measures) {
    return { counts: {} };
  }

  if (slice === PieChartLineSlice.Language) {
    return {
      counts: parseLanguageDistributionCounts(measures[MetricKey.ncloc_language_distribution]),
    };
  }

  if (slice === PieChartLineSlice.Coverage) {
    const linesToCover = getOrganizationMeasureValue(measures, MetricKey.lines_to_cover, scope);
    const uncoveredLines = getOrganizationMeasureValue(measures, MetricKey.uncovered_lines, scope);
    const coverage = getOrganizationMeasureValue(measures, MetricKey.coverage, scope);

    return {
      counts: buildCoverageLineCountCounts({ coverage, linesToCover, uncoveredLines }),
    };
  }

  if (slice === PieChartLineSlice.Duplications) {
    const totalLines =
      scope === CodeScope.New
        ? (parseOrganizationMeasureNumber(measures[MetricKey.new_lines]) ??
          parseOrganizationMeasureNumber(measures[MetricKey.ncloc]))
        : parseOrganizationMeasureNumber(measures[MetricKey.ncloc]);

    const duplicatedLines = getOrganizationMeasureValue(
      measures,
      MetricKey.duplicated_lines,
      scope,
    );
    const duplicatedLinesDensity = getOrganizationMeasureValue(
      measures,
      MetricKey.duplicated_lines_density,
      scope,
    );

    return {
      counts: buildDuplicationsLineCountCounts({
        duplicatedLines,
        duplicatedLinesDensity,
        totalLines,
      }),
    };
  }

  return { counts: {} };
}

/** i18n key for a `releasability_status_distribution` bucket (`metric.level.*`). */
export type QualityGateDistributionMessageId =
  'metric.level.ERROR' | 'metric.level.NONE' | 'metric.level.OK';

export function tryQualityGateDistributionMessageId(
  value: string,
): QualityGateDistributionMessageId | undefined {
  switch (value) {
    case 'ERROR':
      return 'metric.level.ERROR';
    case 'OK':
      return 'metric.level.OK';
    case 'NONE':
      return 'metric.level.NONE';
    default:
      return undefined;
  }
}
