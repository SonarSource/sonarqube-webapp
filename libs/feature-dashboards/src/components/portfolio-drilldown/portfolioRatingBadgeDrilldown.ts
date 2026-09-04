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

import { MetricKey, MetricType } from '~shared/types/metrics';
import type { RatingBadgeWidgetProps } from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';
import { getPortfolioDashboardMeasureRequestKey } from '../../utils/portfolioMeasures';
import { isPortfolioDashboardRatingBadgeBreakdownMetricKey } from '../../utils/portfolioRatingBadgeBreakdown';
import {
  resolvePortfolioDrilldownSegmentValue,
  type PortfolioDashboardMeasureDrilldownDescriptor,
  type PortfolioPieChartSegmentDefinition,
} from './portfolioPieChartDrilldown';

type LocalizeMetricName = (metric: { key: string; name?: string }, short?: boolean) => string;

export interface PortfolioRatingBadgeDrilldownOptions {
  projectMeasureMetricKey?: string;
  segmentLabel?: string;
  segments?: PortfolioPieChartSegmentDefinition[];
  widgetTitle: string;
}

/**
 * Portfolio rating distributions use A–E keys while project-measures filters use the numeric
 * values stored by SonarQube (for example, `3.0` for rating C).
 */
export function toProjectMeasuresRatingFilterValue(segmentValue: string): string {
  const trimmed = segmentValue.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed.includes('.') ? trimmed : `${trimmed}.0`;
  }

  const letter = trimmed.length === 1 ? trimmed.toUpperCase() : '';
  if (letter >= 'A' && letter <= 'E') {
    const codePoint = letter.codePointAt(0);
    return codePoint === undefined ? segmentValue : `${codePoint - 64}.0`;
  }

  return segmentValue;
}

export function getPortfolioRatingBadgeWidgetTitle(args: {
  getLocalizedMetricName: LocalizeMetricName;
  widget: RatingBadgeWidgetProps;
}): string {
  return args.getLocalizedMetricName({ key: args.widget.metricKey }, true);
}

/**
 * Resolves the project-measure key used for a portfolio rating badge drilldown.
 *
 * When `resolvedMetricKey` is supplied, it already accounts for the widget mode and
 * new-code scope, so it is returned as-is.
 */
export function getPortfolioRatingBadgeComputedProjectMeasureKey(
  metricKey: MetricKey,
  isScopeNew: boolean,
  resolvedMetricKey?: string,
): string {
  if (metricKey === MetricKey.releasability_rating) {
    return MetricKey.alert_status;
  }

  if (resolvedMetricKey === undefined && metricKey === MetricKey.maintainability_rating) {
    return isScopeNew ? MetricKey.new_maintainability_rating : MetricKey.sqale_rating;
  }

  return resolvedMetricKey ?? getPortfolioDashboardMeasureRequestKey(metricKey, isScopeNew);
}

export function getPortfolioRatingBadgeWidgetDrilldownDescriptor(
  widget: RatingBadgeWidgetProps,
  options: PortfolioRatingBadgeDrilldownOptions,
): PortfolioDashboardMeasureDrilldownDescriptor | null {
  if (!isPortfolioDashboardRatingBadgeBreakdownMetricKey(widget.metricKey)) {
    return null;
  }

  const isReleasabilityRating = widget.metricKey === MetricKey.releasability_rating;
  const stringValueFormatMetricType = isReleasabilityRating ? MetricType.Level : MetricType.Rating;
  const segmentDefinitions = options.segments ?? [];
  const segmentLabel =
    options.segmentLabel !== undefined && segmentDefinitions.length > 0 ? options.segmentLabel : '';
  const segmentValue = segmentLabel
    ? resolvePortfolioDrilldownSegmentValue(segmentLabel, segmentDefinitions)
    : undefined;
  let metricValue: string | undefined;
  if (segmentValue !== undefined) {
    metricValue =
      stringValueFormatMetricType === MetricType.Rating
        ? toProjectMeasuresRatingFilterValue(segmentValue)
        : segmentValue;
  }

  const projectMeasureMetricKey =
    options.projectMeasureMetricKey ??
    getPortfolioRatingBadgeComputedProjectMeasureKey(
      widget.metricKey,
      widget.scope === CodeScope.New,
    );

  return {
    kind: 'computed-measures',
    metricLabel: options.widgetTitle,
    request: {
      metricKey: projectMeasureMetricKey,
      ...(metricValue === undefined ? {} : { metricValue }),
    },
    segmentLabel,
    stringValueFormatMetricType,
    valueType: 'string',
    widgetTitle: options.widgetTitle,
  };
}
