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

import { RatingBadgeRating } from '@sonarsource/echoes-react';
import * as v from 'valibot';
import { QGStatus } from '~shared/types/common';
import { MetricKey } from '~shared/types/metrics';
import { formatPercentage } from '../../components/visualizations/pie-chart/pieChartSegmentUtils';
import { PieChartSegment } from '../../types/visualization';
import { getPortfolioDashboardMeasureRequestKey } from '../../utils/portfolioMeasures';
import { getPortfolioRatingColor } from './portfolioRatingBadgeColors';

type PortfolioMeasures = Record<string, string | number | Record<string, number>>;

/** Compact donut around the ExtraLarge center badge (dashboard widget and breakdown preview). */
export const PORTFOLIO_RATING_BADGE_DONUT_SIZE_PX = 84;
export const PORTFOLIO_RATING_BADGE_DONUT_INNER_RADIUS_EXTRA_PX = 12;

const RATING_DONUT_MIN_VISUAL_PERCENT = 4;

const QG_STATUS_MAPPING: Partial<Record<QGStatus, RatingBadgeRating>> = {
  ERROR: RatingBadgeRating.E,
  NONE: RatingBadgeRating.A,
  OK: RatingBadgeRating.A,
};

export type PortfolioRatingBadgeDistribution = Record<RatingBadgeRating | QGStatus, number>;

const portfolioRatingBadgeDistributionSchema = v.record(v.string(), v.number());

const portfolioRatingBadgeRatingSchema = v.enum(RatingBadgeRating);

export function getPortfolioRatingBadgeDistributionMetricKey(
  metricKey: MetricKey,
  isScopeNew: boolean,
): string {
  if (metricKey === MetricKey.releasability_rating) {
    return MetricKey.releasability_status_distribution;
  }

  const ratingMetricKey = getPortfolioDashboardMeasureRequestKey(metricKey, isScopeNew);
  return `${ratingMetricKey}_distribution`;
}

export function isPortfolioRatingBadgeRatingValue(value: unknown): value is RatingBadgeRating {
  return v.safeParse(portfolioRatingBadgeRatingSchema, value).success;
}

export function isPortfolioRatingBadgeDistributionValue(
  value: PortfolioMeasures[string] | undefined,
): value is PortfolioRatingBadgeDistribution {
  return value !== undefined && v.safeParse(portfolioRatingBadgeDistributionSchema, value).success;
}

function isQGStatus(value: string): value is QGStatus {
  return value === 'ERROR' || value === 'NONE' || value === 'OK';
}

function mapDistributionRating(value: string): RatingBadgeRating {
  return QG_STATUS_MAPPING[value as QGStatus] ?? (value as RatingBadgeRating);
}

function getPortfolioRatingBadgeSegmentLabelForDistributionKey(
  key: string,
  formatMessage: (descriptor: { id: string }) => string,
): string {
  return isQGStatus(key) ? formatMessage({ id: `metric.level.${key}` }) : key;
}

export function buildPortfolioRatingBadgePieChartSegments(args: {
  distribution: PortfolioRatingBadgeDistribution;
  formatMessage: (descriptor: { id: string }) => string;
}): PieChartSegment[] {
  const { distribution, formatMessage } = args;
  const filteredDistribution = Object.entries(distribution).filter(([, value]) => value > 0);
  const total = filteredDistribution.reduce((sum, [, value]) => sum + value, 0);

  return filteredDistribution.map(([key, count]) => {
    const rawPercentage = total > 0 ? (count / total) * 100 : 0;
    const label = getPortfolioRatingBadgeSegmentLabelForDistributionKey(key, formatMessage);
    const needsMinimumSize = rawPercentage < RATING_DONUT_MIN_VISUAL_PERCENT && rawPercentage > 0;
    const visualCount = needsMinimumSize
      ? (total * RATING_DONUT_MIN_VISUAL_PERCENT) / 100
      : undefined;

    return {
      color: getPortfolioRatingColor(mapDistributionRating(key)),
      count,
      label,
      percentage: formatPercentage(rawPercentage),
      value: key,
      visualCount,
    };
  });
}
