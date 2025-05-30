/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import {
  RatingBadge,
  RatingBadgeRating,
  RatingBadgeSize,
  Spinner,
  Tooltip,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { getLeakValue } from '../../components/measure/utils';
import { SOFTWARE_QUALITY_RATING_METRICS_MAP } from '../../helpers/constants';
import { isDiffMetric } from '../../helpers/measures';
import { useMeasureQuery } from '../../queries/measures';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import { formatMeasure } from '../../sonar-aligned/helpers/measures';
import { BranchLike } from '../../types/branch-like';

interface Props {
  branchLike?: BranchLike;
  className?: string;
  componentKey: string;
  forceMetric?: boolean;
  getLabel?: (rating: RatingBadgeRating) => string;
  getTooltip?: (
    rating: RatingBadgeRating,
    value: string | undefined,
    metricKey?: MetricKey,
  ) => React.ReactNode;
  ratingMetric: MetricKey;
  size?: RatingBadgeSize;
}

type RatingMetricKeys =
  | MetricKey.reliability_rating
  | MetricKey.sqale_rating
  | MetricKey.security_rating
  | MetricKey.security_review_rating
  | MetricKey.releasability_rating;

function isNewRatingMetric(metricKey: MetricKey) {
  return metricKey.includes('software_quality_');
}

const useGetMetricKeyForRating = (ratingMetric: RatingMetricKeys): MetricKey | null => {
  const { data: isStandardMode, isLoading } = useStandardExperienceModeQuery();

  const hasSoftwareQualityRating = !!SOFTWARE_QUALITY_RATING_METRICS_MAP[ratingMetric];

  if (isNewRatingMetric(ratingMetric)) {
    return ratingMetric;
  }

  if (isLoading) {
    return null;
  }

  return isStandardMode || !hasSoftwareQualityRating
    ? ratingMetric
    : SOFTWARE_QUALITY_RATING_METRICS_MAP[ratingMetric];
};

export default function RatingComponent(props: Readonly<Props>) {
  const {
    componentKey,
    ratingMetric,
    size = RatingBadgeSize.Small,
    forceMetric,
    className,
    getLabel,
    branchLike,
    getTooltip,
  } = props;

  const metricKey = useGetMetricKeyForRating(ratingMetric as RatingMetricKeys);
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const { data: targetMeasure, isLoading: isLoadingTargetMeasure } = useMeasureQuery(
    { componentKey, metricKey: metricKey ?? '', branchLike },
    { enabled: !forceMetric && !!metricKey },
  );

  const { data: oldMeasure, isLoading: isLoadingOldMeasure } = useMeasureQuery(
    { componentKey, metricKey: ratingMetric, branchLike },
    {
      enabled:
        forceMetric ||
        (!isStandardMode && !isNewRatingMetric(ratingMetric) && targetMeasure === null),
    },
  );

  const isLoading = isLoadingTargetMeasure || isLoadingOldMeasure;

  const measure = forceMetric ? oldMeasure : (targetMeasure ?? oldMeasure);

  const value = isDiffMetric(metricKey ?? '') ? getLeakValue(measure) : measure?.value;
  const rating = formatMeasure(value, MetricType.Rating) as RatingBadgeRating;

  const badge = (
    <RatingBadge
      ariaLabel={getLabel ? getLabel(rating) : (value ?? RatingBadgeRating.Null)}
      {...{ className, rating, size }}
    />
  );

  return (
    <Spinner isLoading={isLoading}>
      {getTooltip ? (
        <>
          <Tooltip content={getTooltip(rating, value, measure?.metric as MetricKey)}>
            {badge}
          </Tooltip>

          {/* The badge is not interactive, so show the tooltip content for screen-readers only */}
          <span className="sw-sr-only">
            {getTooltip(rating, value, measure?.metric as MetricKey)}
          </span>
        </>
      ) : (
        badge
      )}
    </Spinner>
  );
}
