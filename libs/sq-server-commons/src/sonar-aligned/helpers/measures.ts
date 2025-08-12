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
  durationFormatter,
  floatFormatter,
  intFormatter,
  levelFormatter,
  millisecondsFormatter,
  noFormatter,
  percentFormatter,
  ratingFormatter,
  shortDurationFormatter,
  shortIntFormatter,
} from '~shared/helpers/measures';
import {
  RISK_SEVERITY_LABELS,
  SCA_RISK_SEVERITY_METRIC_THRESHOLDS,
  SCA_RISK_SEVERITY_METRIC_VALUES,
} from '~shared/helpers/sca';
import { MetricType } from '~shared/types/metrics';
import { ReleaseRiskSeverity } from '~shared/types/sca';
import { getIntl } from '../../helpers/l10nBundle';

type FormatterOption =
  | { roundingFunc?: (x: number) => number }
  | { decimals?: number; omitExtraDecimalZeros?: boolean };

type Formatter = (value: string | number, options?: FormatterOption) => string;
/**
 * Format a measure value for a given type
 * ! For Ratings, use formatRating instead
 */

export function formatMeasure(
  value: string | number | undefined,
  type: string,
  options?: FormatterOption,
): string {
  const formatter = getFormatter(type);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFormatter(value, formatter, options);
}

function useFormatter(
  value: string | number | undefined,
  formatter: Formatter,
  options?: FormatterOption,
): string {
  return value !== undefined && value !== '' ? formatter(value, options) : '';
}

function getFormatter(type: string): Formatter {
  const { formatMessage } = getIntl();
  const FORMATTERS: Record<string, Formatter> = {
    INT: intFormatter,
    SHORT_INT: shortIntFormatter.bind(null, formatMessage),
    FLOAT: floatFormatter,
    PERCENT: percentFormatter,
    WORK_DUR: durationFormatter.bind(null, formatMessage),
    SHORT_WORK_DUR: shortDurationFormatter.bind(null, formatMessage),
    RATING: ratingFormatter,
    LEVEL: levelFormatter.bind(null, formatMessage),
    MILLISEC: millisecondsFormatter,
    [MetricType.ScaRisk]: makeRiskMetricOptionsFormatter(),
  };
  return FORMATTERS[type] || noFormatter;
}

export function makeRiskMetricOptionsFormatter() {
  const { formatMessage } = getIntl();
  const scaRiskMetrics: Record<string, ReleaseRiskSeverity> = {
    ...SCA_RISK_SEVERITY_METRIC_THRESHOLDS,
    ...SCA_RISK_SEVERITY_METRIC_VALUES,
  };

  return (value: string | number): string => {
    const valueStr = value.toString();
    if (scaRiskMetrics[valueStr]) {
      return formatMessage({ id: RISK_SEVERITY_LABELS[scaRiskMetrics[valueStr]] });
    }
    return formatMessage({ id: 'unknown' });
  };
}
