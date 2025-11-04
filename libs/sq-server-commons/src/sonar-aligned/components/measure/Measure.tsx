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

import { RatingBadgeRating, RatingBadgeSize } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { QGStatus } from '~shared/types/common';
import { MetricKey, MetricType } from '~shared/types/metrics';
import RatingTooltipContent from '../../../components/measure/RatingTooltipContent';
import RatingComponent from '../../../context/metrics/RatingComponent';
import { QualityGateIndicator, TrendUpCircleIcon } from '../../../design-system';
import { formatMeasure } from '../../../sonar-aligned/helpers/measures';
import { BranchLike } from '../../../types/branch-like';

type FontClass =
  | 'sw-heading-xs'
  | 'sw-heading-sm'
  | 'sw-heading-md'
  | 'sw-heading-lg'
  | 'sw-heading-xl'
  | 'sw-typo-default'
  | 'sw-typo-semibold'
  | 'sw-typo-bold'
  | 'sw-typo-sm'
  | 'sw-typo-sm-semibold'
  | 'sw-typo-lg'
  | 'sw-typo-lg-semibold'
  | 'sw-typo-label'
  | 'sw-typo-helper-text'
  | 'sw-typo-display';

interface Props {
  badgeSize?: RatingBadgeSize.ExtraSmall | RatingBadgeSize.Small | RatingBadgeSize.Medium;
  branchLike?: BranchLike;
  className?: string;
  componentKey: string;
  decimals?: number;
  fontClassName?: FontClass;
  forceRatingMetric?: boolean;
  metricKey: string;
  metricType: string;
  small?: boolean;
  value: string | number | undefined;
}

export default function Measure({
  className,
  componentKey,
  badgeSize,
  decimals,
  fontClassName,
  metricKey,
  branchLike,
  metricType,
  forceRatingMetric,
  small,
  value,
}: Readonly<Props>) {
  const intl = useIntl();
  const classNameWithFont = classNames(className, fontClassName);

  const getTooltip = useCallback(
    (_: RatingBadgeRating, value: string | undefined, metric?: MetricKey) =>
      value !== undefined &&
      metric !== undefined && <RatingTooltipContent metricKey={metric} value={value} />,
    [],
  );

  const getLabel = useCallback(
    (rating: RatingBadgeRating) =>
      rating
        ? intl.formatMessage({ id: 'metric.has_rating_X' }, { '0': rating })
        : intl.formatMessage({ id: 'metric.no_rating' }),
    [intl],
  );

  if (value === undefined) {
    return (
      <span
        aria-label={
          metricType === MetricType.Rating ? intl.formatMessage({ id: 'metric.no_rating' }) : ''
        }
        className={classNameWithFont}
      >
        —
      </span>
    );
  }

  if (metricType === MetricType.Level) {
    const formatted = formatMeasure(value, MetricType.Level);

    return (
      <>
        <QualityGateIndicator
          className="sw-mr-2"
          size={small ? 'sm' : 'md'}
          status={(value as QGStatus) ?? 'NONE'}
        />
        <span className={small ? '' : 'sw-typo-lg'}>{formatted}</span>
      </>
    );
  }

  if (metricType === MetricType.ScaRisk) {
    return (
      <div className={className}>
        <TrendUpCircleIcon />
      </div>
    );
  }

  if (metricType !== MetricType.Rating) {
    const formattedValue = formatMeasure(value, metricType, {
      decimals,
      omitExtraDecimalZeros: metricType === MetricType.Percent,
    });
    return <span className={classNameWithFont}>{formattedValue ?? '—'}</span>;
  }

  const rating = (
    <RatingComponent
      branchLike={branchLike}
      componentKey={componentKey}
      forceMetric={forceRatingMetric}
      getLabel={getLabel}
      getTooltip={getTooltip}
      ratingMetric={metricKey as MetricKey}
      size={badgeSize ?? (small ? RatingBadgeSize.Small : RatingBadgeSize.Medium)}
    />
  );

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <span className={className} tabIndex={0}>
        {rating}
      </span>
    </>
  );
}
