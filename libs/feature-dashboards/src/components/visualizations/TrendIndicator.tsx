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
  Spinner,
  Text,
  TextSize,
  Tooltip,
} from '@sonarsource/echoes-react';
import type { Path } from 'history';
import { type ReactNode, useId } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  getWidgetTitleId,
  useOptionalWidgetInstanceContext,
} from '../../dashboard-layout/shared/WidgetInstanceContext';

export enum TrendDirection {
  Up = 'up',
  Down = 'down',
  Equal = 'equal',
}

export enum TrendType {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
  Disabled = 'disabled',
}

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
  isPending: boolean;
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
): TrendType {
  if (
    (past === 0 && change === 0) ||
    (past !== 0 && roundedChange === 0) ||
    metricDirection === 0
  ) {
    return TrendType.Neutral;
  }

  const isPositive =
    past === 0
      ? Math.sign(change) === Math.sign(metricDirection)
      : Math.sign(roundedChange) === Math.sign(metricDirection);
  return isPositive ? TrendType.Positive : TrendType.Negative;
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

const BADGE_VARIETY_BY_TYPE: Record<TrendType, BadgeVariety> = {
  [TrendType.Positive]: BadgeVariety.Success,
  [TrendType.Negative]: BadgeVariety.Danger,
  [TrendType.Neutral]: BadgeVariety.Neutral,
  [TrendType.Disabled]: BadgeVariety.Neutral,
};

function TrendIndicatorBadge({
  data,
  zeroPercentWhenNoChange,
}: Readonly<{ data: TrendData; zeroPercentWhenNoChange: boolean }>) {
  const widgetKey = useOptionalWidgetInstanceContext()?.widgetKey;
  const direction = determineTrendDirection(data.change, data.roundedChange, data.past);
  const type = determineTrendType(data.change, data.metricDirection, data.past, data.roundedChange);
  const IconComponent = ICON_BY_DIRECTION[direction];
  const variety = BADGE_VARIETY_BY_TYPE[type];
  const message = getTrendBadgeMessage(data, zeroPercentWhenNoChange);
  const { activityUrl } = data;
  const badgeTextId = useId();
  const widgetTitleId = widgetKey ? getWidgetTitleId(widgetKey) : undefined;

  const badge = (
    <Badge IconLeft={IconComponent} size={BadgeSize.Small} variety={variety}>
      {message}
    </Badge>
  );

  if (activityUrl.pathname === '#') {
    return badge;
  }

  return (
    <LinkStandalone
      aria-labelledby={widgetTitleId ? `${badgeTextId} ${widgetTitleId}` : undefined}
      className="sw-contents"
      to={activityUrl}
    >
      <span className="sw-contents" id={badgeTextId}>
        {badge}
      </span>
    </LinkStandalone>
  );
}

function NoDataTrendIndicatorBadge() {
  return (
    <Badge IconLeft={IconDash} size={BadgeSize.Small} variety={BadgeVariety.Neutral}>
      <FormattedMessage id="dashboard.widget.trend_indicator.no_historical_data" />
    </Badge>
  );
}

export function TrendIndicator({
  compact = false,
  isPending,
  trendData,
  zeroPercentWhenNoChange = false,
}: Readonly<TrendIndicatorProps>) {
  const { formatMessage } = useIntl();

  if (isPending) {
    return <Spinner ariaLabel="Loading trend indicator" />;
  }

  const badge = trendData ? (
    <TrendIndicatorBadge data={trendData} zeroPercentWhenNoChange={zeroPercentWhenNoChange} />
  ) : (
    <NoDataTrendIndicatorBadge />
  );

  if (compact) {
    return (
      <Tooltip
        content={formatMessage({
          id: 'dashboard.widget.trend_indicator.change_last_30_days',
        })}
        delayDuration={300}
      >
        <span className="sw-inline-flex">{badge}</span>
      </Tooltip>
    );
  }

  return (
    <div className="sw-flex sw-flex-wrap sw-items-center sw-gap-2">
      {badge}
      <Text isSubtle size={TextSize.Small}>
        <FormattedMessage id="dashboard.widget.trend_indicator.vs_last_30_days" />
      </Text>
    </div>
  );
}
