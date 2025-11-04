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
import { IntlShape } from 'react-intl';
import { getCurrentLocale } from '~adapters/helpers/l10n';
import { isDefined } from '../helpers/types';
import { Measure } from '../types/measures';
import {
  RISK_SEVERITY_LABELS,
  SCA_RISK_SEVERITY_METRIC_THRESHOLD_KEYS,
  SCA_RISK_SEVERITY_METRIC_THRESHOLDS,
} from './sca';

type RatingLabel = Exclude<keyof typeof RatingBadgeRating, 'Null'>;
type FormatMessageFunction = IntlShape['formatMessage'];

const HOURS_IN_DAY = 8;

function getLanguagesSortedByNCLOC(measures: Measure[]) {
  return (
    measures
      .flatMap((measure) =>
        measure.value?.split(';').map((pair) => {
          const [language, count] = pair.split('=');
          return { language, count: Number.parseInt(count, 10) };
        }),
      )
      .filter(isDefined)
      .sort((a, b) => b.count - a.count) || []
  );
}

function noFormatter(value: string | number): string | number {
  return value;
}

function intFormatter(value: string | number): string {
  return numberFormatter(value);
}

function floatFormatter(value: string | number): string {
  return numberFormatter(value, 1, 5);
}

/**
 * Formats a percentage value.
 * @param value - The value to format.
 * @param decimals - The number of decimal places to display.
 * @param omitExtraDecimalZeros - If omitExtraDecimalZeros is true, all trailing decimal 0s will be removed,
 * except for the first decimal.
 * E.g. for decimals=3:
 * - omitExtraDecimalZeros: false, value: 45.450 => 45.450
 * - omitExtraDecimalZeros: true, value: 45.450 => 45.45
 * - omitExtraDecimalZeros: false, value: 85 => 85.000
 * - omitExtraDecimalZeros: true, value: 85 => 85.0
 */
function percentFormatter(
  value: string | number,
  { decimals, omitExtraDecimalZeros }: { decimals?: number; omitExtraDecimalZeros?: boolean } = {},
): string {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  if (value === 100) {
    return '100%';
  } else if (omitExtraDecimalZeros && decimals) {
    return `${numberFormatter(value, 1, decimals)}%`;
  }
  return `${numberFormatter(value, decimals || 1)}%`;
}

function ratingFormatter(value: string | number): RatingLabel {
  if (typeof value === 'string') {
    value = parseInt(value, 10);
  }
  return String.fromCharCode(97 + value - 1).toUpperCase() as RatingLabel;
}

function levelFormatter(formatMessage: FormatMessageFunction, value: string | number): string {
  if (typeof value === 'number') {
    value = value.toString();
  }
  const l10nKey = `metric.level.${value}`;
  const result = formatMessage({ id: l10nKey });

  // if couldn't translate, return the initial value
  return l10nKey !== result ? result : value;
}

function millisecondsFormatter(value: string | number): string {
  const ONE_SECOND = 1000;
  const ONE_MINUTE = 60 * ONE_SECOND;

  if (typeof value === 'string') {
    value = parseInt(value, 10);
  }
  if (value >= ONE_MINUTE) {
    const minutes = Math.round(value / ONE_MINUTE);
    return `${minutes}min`;
  } else if (value >= ONE_SECOND) {
    const seconds = Math.round(value / ONE_SECOND);
    return `${seconds}s`;
  }
  return `${value}ms`;
}

function numberFormatter(
  value: string | number,
  minimumFractionDigits = 0,
  maximumFractionDigits = minimumFractionDigits,
) {
  const { format } = new Intl.NumberFormat(getCurrentLocale(), {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  if (typeof value === 'string') {
    return format(parseFloat(value));
  }
  return format(value);
}

function numberRound(
  value: number,
  fraction = 1000,
  roundingFunc: (x: number) => number = Math.round,
) {
  return roundingFunc(value * fraction) / fraction;
}

function shortIntFormatter(
  formatMessage: FormatMessageFunction,
  value: string | number,
  option?: { roundingFunc?: (x: number) => number },
): string {
  const shortIntFormats = [
    { unit: 10000000000, formatUnit: 1000000000, fraction: 0, suffix: 'short_number_suffix.g' },
    { unit: 1000000000, formatUnit: 1000000000, fraction: 1, suffix: 'short_number_suffix.g' },
    { unit: 10000000, formatUnit: 1000000, fraction: 0, suffix: 'short_number_suffix.m' },
    { unit: 1000000, formatUnit: 1000000, fraction: 1, suffix: 'short_number_suffix.m' },
    { unit: 10000, formatUnit: 1000, fraction: 0, suffix: 'short_number_suffix.k' },
    { unit: 1000, formatUnit: 1000, fraction: 1, suffix: 'short_number_suffix.k' },
  ];

  const roundingFunc = option?.roundingFunc;
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  for (let i = 0; i < shortIntFormats.length; i++) {
    const { unit, formatUnit, fraction, suffix } = shortIntFormats[i];
    const nextFraction = unit / (shortIntFormats[i + 1] ? shortIntFormats[i + 1].unit / 10 : 1);
    const roundedValue = numberRound(value / unit, nextFraction, roundingFunc);
    if (Math.abs(roundedValue) >= 1) {
      return (
        numberFormatter(
          numberRound(value / formatUnit, Math.pow(10, fraction), roundingFunc),
          0,
          fraction,
        ) + formatMessage({ id: suffix })
      );
    }
  }

  return numberFormatter(value);
}

function formatDuration(
  formatMessage: FormatMessageFunction,
  isNegative: boolean,
  days: number,
  hours: number,
  minutes: number,
): string {
  let formatted = '';
  if (shouldDisplayDays(days)) {
    formatted += formatMessage(
      { id: 'work_duration.x_days' },
      {
        '0': isNegative ? -1 * days : days,
      },
    );
  }
  if (shouldDisplayHours(days, hours)) {
    formatted = addSpaceIfNeeded(formatted);
    formatted += formatMessage(
      { id: 'work_duration.x_hours' },
      {
        '0': isNegative && formatted.length === 0 ? -1 * hours : hours,
      },
    );
  }
  if (shouldDisplayMinutes(days, hours, minutes)) {
    formatted = addSpaceIfNeeded(formatted);
    formatted += formatMessage(
      { id: 'work_duration.x_minutes' },
      {
        '0': isNegative && formatted.length === 0 ? -1 * minutes : minutes,
      },
    );
  }
  return formatted;
}

function formatDurationShort(
  formatMessage: FormatMessageFunction,
  isNegative: boolean,
  days: number,
  hours: number,
  minutes: number,
): string {
  if (shouldDisplayDaysInShortFormat(days)) {
    const roundedDays = Math.round(days);
    const formattedDays = shortIntFormatter(
      formatMessage,
      isNegative ? -1 * roundedDays : roundedDays,
    );
    return formatMessage(
      { id: 'work_duration.x_days' },
      {
        '0': formattedDays,
      },
    );
  }

  if (shouldDisplayHoursInShortFormat(hours)) {
    const roundedHours = Math.round(hours);
    const formattedHours = shortIntFormatter(
      formatMessage,
      isNegative ? -1 * roundedHours : roundedHours,
    );
    return formatMessage(
      { id: 'work_duration.x_hours' },
      {
        '0': formattedHours,
      },
    );
  }

  const formattedMinutes = numberFormatter(isNegative ? -1 * minutes : minutes, 0, 0);
  return formatMessage(
    { id: 'work_duration.x_minutes' },
    {
      '0': formattedMinutes,
    },
  );
}

function durationFormatter(formatMessage: FormatMessageFunction, value: string | number): string {
  if (typeof value === 'string') {
    value = parseInt(value, 10);
  }
  if (value === 0) {
    return '0';
  }
  const hoursInDay = HOURS_IN_DAY;
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const days = Math.floor(absValue / hoursInDay / 60);
  let remainingValue = absValue - days * hoursInDay * 60;
  const hours = Math.floor(remainingValue / 60);
  remainingValue -= hours * 60;
  return formatDuration(formatMessage, isNegative, days, hours, remainingValue);
}

function shortDurationFormatter(
  formatMessage: FormatMessageFunction,
  value: string | number,
): string {
  if (typeof value === 'string') {
    value = parseInt(value, 10);
  }
  if (value === 0) {
    return '0';
  }
  const hoursInDay = HOURS_IN_DAY;
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const days = absValue / hoursInDay / 60;
  let remainingValue = absValue - Math.floor(days) * hoursInDay * 60;
  const hours = remainingValue / 60;
  remainingValue -= Math.floor(hours) * 60;
  return formatDurationShort(formatMessage, isNegative, days, hours, remainingValue);
}

function scaRiskFormatter(
  formatMessage: FormatMessageFunction,
  value: SCA_RISK_SEVERITY_METRIC_THRESHOLD_KEYS,
): string {
  const severity = SCA_RISK_SEVERITY_METRIC_THRESHOLDS[value];
  if (severity === undefined) {
    throw new Error(`Threshold '${value}' not valid`);
  }

  return formatMessage({ id: RISK_SEVERITY_LABELS[severity] });
}

/*
 * Debt Formatters
 */

function shouldDisplayDays(days: number): boolean {
  return days > 0;
}

function shouldDisplayDaysInShortFormat(days: number): boolean {
  return days > 0.9;
}

function shouldDisplayHours(days: number, hours: number): boolean {
  return hours > 0 && days < 10;
}

function shouldDisplayHoursInShortFormat(hours: number): boolean {
  return hours > 0.9;
}

function shouldDisplayMinutes(days: number, hours: number, minutes: number): boolean {
  return minutes > 0 && hours < 10 && days === 0;
}

function addSpaceIfNeeded(value: string): string {
  return value.length > 0 ? `${value} ` : value;
}

export {
  durationFormatter,
  floatFormatter,
  getLanguagesSortedByNCLOC,
  intFormatter,
  levelFormatter,
  millisecondsFormatter,
  noFormatter,
  numberFormatter,
  percentFormatter,
  ratingFormatter,
  scaRiskFormatter,
  shortDurationFormatter,
  shortIntFormatter,
};
