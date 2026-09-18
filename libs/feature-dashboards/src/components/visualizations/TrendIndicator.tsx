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

import {
  Badge,
  BadgeSize,
  BadgeVariety,
  IconArrowDownRight,
  IconArrowUpRight,
  IconDash,
  LinkStandalone,
  Popover,
  Spinner,
} from '@sonarsource/echoes-react';
import type { Path } from 'history';
import { type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

enum TrendDirection {
  Up = 'up',
  Down = 'down',
  Equal = 'equal',
}

enum TrendBadgeType {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
  Disabled = 'disabled',
}

export type TrendIndicatorType = 'snapshot' | 'rolling-average' | 'resolved-issues';

const TREND_DESCRIPTION_MESSAGE_IDS: Record<TrendIndicatorType, string> = {
  snapshot: 'dashboard.widget.trend_indicator.description.snapshot',
  'rolling-average': 'dashboard.widget.trend_indicator.description.rolling_average',
  'resolved-issues': 'dashboard.widget.trend_indicator.description.resolved_issues',
};

export interface TrendData {
  activityUrl: Partial<Path>;
  change: number;
  formattedChange: string;
  metricDirection: number;
  past: number;
  roundedChange: number;
}

export interface TrendIndicatorProps {
  /** When true, only the trend badge is shown (e.g. Top list table rows). */
  compact?: boolean;
  historyStartDate?: Date;
  isCurrentPeriodIncomplete?: boolean;
  isHistoryIncomplete?: boolean;
  isPending: boolean;
  requiredHistoryDays?: 30 | 60;
  trendType?: TrendIndicatorType;
  trendData: TrendData | null;
  /**
   * Top list only: show `0%` instead of the default “No change” label when the value is unchanged.
   */
  zeroPercentWhenNoChange?: boolean;
}

function isNoChangeTrend(data: TrendData): boolean {
  const { change, past, roundedChange } = data;
  return (past === 0 && change === 0) || (past !== 0 && roundedChange === 0);
}

function determineTrendDirection(
  change: number,
  roundedChange: number,
  past: number,
): TrendDirection {
  if ((past === 0 && change === 0) || (past !== 0 && roundedChange === 0)) {
    return TrendDirection.Equal;
  }
  return change > 0 ? TrendDirection.Up : TrendDirection.Down;
}

function determineTrendType(
  change: number,
  metricDirection: number,
  past: number,
  roundedChange: number,
): TrendBadgeType {
  if (
    (past === 0 && change === 0) ||
    (past !== 0 && roundedChange === 0) ||
    metricDirection === 0
  ) {
    return TrendBadgeType.Neutral;
  }

  const isPositive =
    past === 0
      ? Math.sign(change) === Math.sign(metricDirection)
      : Math.sign(roundedChange) === Math.sign(metricDirection);
  return isPositive ? TrendBadgeType.Positive : TrendBadgeType.Negative;
}

function getTrendBadgeMessage(data: TrendData, zeroPercentWhenNoChange: boolean): ReactNode {
  const { change, formattedChange, past, roundedChange } = data;

  if (isNoChangeTrend(data)) {
    if (zeroPercentWhenNoChange) {
      return (
        <FormattedMessage
          id="dashboard.widget.trend_indicator.badge.relative"
          values={{ change: '0%' }}
        />
      );
    }
    return <FormattedMessage id="dashboard.widget.trend_indicator.badge.no_change" />;
  }

  if (past === 0) {
    return (
      <FormattedMessage
        id="dashboard.widget.trend_indicator.badge.absolute"
        values={{
          change: `${change > 0 ? '+' : '-'}${formattedChange}`,
        }}
      />
    );
  }

  return (
    <FormattedMessage
      id="dashboard.widget.trend_indicator.badge.relative"
      values={{
        change: `${roundedChange > 0 ? '+' : ''}${formattedChange}`,
      }}
    />
  );
}

const ICON_BY_DIRECTION: Record<TrendDirection, typeof IconArrowUpRight> = {
  [TrendDirection.Up]: IconArrowUpRight,
  [TrendDirection.Down]: IconArrowDownRight,
  [TrendDirection.Equal]: IconDash,
};

const BADGE_VARIETY_BY_TYPE: Record<TrendBadgeType, BadgeVariety> = {
  [TrendBadgeType.Positive]: BadgeVariety.Success,
  [TrendBadgeType.Negative]: BadgeVariety.Danger,
  [TrendBadgeType.Neutral]: BadgeVariety.Neutral,
  [TrendBadgeType.Disabled]: BadgeVariety.Neutral,
};

function TrendIndicatorBadge({
  data,
  zeroPercentWhenNoChange,
}: Readonly<{ data: TrendData; zeroPercentWhenNoChange: boolean }>) {
  const direction = determineTrendDirection(data.change, data.roundedChange, data.past);
  const type = determineTrendType(data.change, data.metricDirection, data.past, data.roundedChange);
  const IconComponent = ICON_BY_DIRECTION[direction];
  const variety = BADGE_VARIETY_BY_TYPE[type];
  const message = getTrendBadgeMessage(data, zeroPercentWhenNoChange);
  return (
    <Badge IconLeft={IconComponent} size={BadgeSize.Small} variety={variety}>
      {message}
    </Badge>
  );
}

function NoDataTrendIndicatorBadge({
  ariaLabel,
}: Readonly<{
  ariaLabel?: string;
}>) {
  return (
    <Badge
      IconLeft={IconDash}
      ariaLabel={ariaLabel}
      size={BadgeSize.Small}
      variety={BadgeVariety.Neutral}
    />
  );
}

function getHistoryDescription({
  historyStartDate,
  isHistoryIncomplete,
  requiredHistoryDays,
  formatDate,
  formatMessage,
}: Readonly<{
  formatDate: ReturnType<typeof useIntl>['formatDate'];
  formatMessage: ReturnType<typeof useIntl>['formatMessage'];
  historyStartDate?: Date;
  isHistoryIncomplete?: boolean;
  requiredHistoryDays?: 30 | 60;
}>): string {
  return historyStartDate
    ? formatMessage(
        {
          id:
            requiredHistoryDays === 60
              ? 'dashboard.widget.trend_indicator.insufficient_history_60_days'
              : 'dashboard.widget.trend_indicator.insufficient_history',
        },
        {
          date: formatDate(historyStartDate, {
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC',
            year: 'numeric',
          }),
        },
      )
    : formatMessage({
        id: isHistoryIncomplete
          ? 'dashboard.widget.trend_indicator.insufficient_history_no_date'
          : 'dashboard.widget.trend_indicator.no_historical_data',
      });
}

function getTrendDescription({
  formatDate,
  formatMessage,
  historyStartDate,
  isCurrentPeriodIncomplete,
  isHistoryIncomplete,
  requiredHistoryDays,
  trendData,
  trendType,
}: Readonly<{
  formatDate: ReturnType<typeof useIntl>['formatDate'];
  formatMessage: ReturnType<typeof useIntl>['formatMessage'];
  historyStartDate?: Date;
  isCurrentPeriodIncomplete?: boolean;
  isHistoryIncomplete?: boolean;
  requiredHistoryDays?: 30 | 60;
  trendData: TrendData | null;
  trendType: TrendIndicatorType;
}>): string {
  const description = formatMessage({ id: TREND_DESCRIPTION_MESSAGE_IDS[trendType] });

  if (trendData === null) {
    if ((trendType === 'resolved-issues' || trendType === 'rolling-average') && historyStartDate) {
      const isResolvedIssues = trendType === 'resolved-issues';
      let unavailableDescriptionId =
        'dashboard.widget.trend_indicator.description.rolling_average.insufficient_history';
      if (isResolvedIssues) {
        unavailableDescriptionId = isCurrentPeriodIncomplete
          ? 'dashboard.widget.trend_indicator.description.resolved_issues.current_period_incomplete'
          : 'dashboard.widget.trend_indicator.description.resolved_issues.insufficient_history';
      }
      return formatMessage(
        { id: unavailableDescriptionId },
        {
          date: formatDate(historyStartDate, {
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC',
            year: 'numeric',
          }),
        },
      );
    }

    const historyDescription = getHistoryDescription({
      formatDate,
      formatMessage,
      historyStartDate,
      isHistoryIncomplete,
      requiredHistoryDays,
    });
    return `${description} ${historyDescription}`;
  }

  return description;
}

export function TrendIndicator({
  compact = false,
  historyStartDate,
  isCurrentPeriodIncomplete,
  isHistoryIncomplete,
  isPending,
  requiredHistoryDays,
  trendType = 'snapshot',
  trendData,
  zeroPercentWhenNoChange = false,
}: Readonly<TrendIndicatorProps>) {
  const { formatDate, formatMessage } = useIntl();

  if (isPending) {
    return <Spinner ariaLabel="Loading trend indicator" />;
  }

  const badge = trendData ? (
    <TrendIndicatorBadge data={trendData} zeroPercentWhenNoChange={zeroPercentWhenNoChange} />
  ) : (
    <NoDataTrendIndicatorBadge
      ariaLabel={
        compact
          ? formatMessage({ id: 'dashboard.widget.trend_indicator.badge.unavailable' })
          : undefined
      }
    />
  );

  const description = getTrendDescription({
    formatDate,
    formatMessage,
    historyStartDate,
    isCurrentPeriodIncomplete,
    isHistoryIncomplete,
    requiredHistoryDays,
    trendData,
    trendType,
  });

  if (compact) {
    return badge;
  }

  const activityLink =
    trendData?.activityUrl.pathname && trendData.activityUrl.pathname !== '#' ? (
      <LinkStandalone to={trendData.activityUrl}>
        <FormattedMessage id="dashboard.widget.trend_indicator.view_activity" />
      </LinkStandalone>
    ) : undefined;

  return (
    <Popover description={description} footer={activityLink}>
      <button
        aria-label={
          trendData === null
            ? formatMessage({ id: 'dashboard.widget.trend_indicator.badge.unavailable' })
            : undefined
        }
        className="sw-inline-flex sw-cursor-pointer sw-appearance-none sw-border-0 sw-bg-transparent sw-p-0"
        type="button"
      >
        {badge}
      </button>
    </Popover>
  );
}
