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

import { LinkStandalone } from '@sonarsource/echoes-react';
import { useId } from 'react';
import type { To } from 'react-router-dom';
import Measure from '~adapters/components/measure/Measure';
import { MetricKey, MetricType } from '~shared/types/metrics';
import {
  getWidgetTitleId,
  useOptionalWidgetInstanceContext,
} from '../../dashboard-layout/shared/WidgetInstanceContext';
import { Sparkline, SPARKLINE_HEIGHT, SPARKLINE_WIDTH } from './Sparkline';
import { TrendIndicator, type TrendIndicatorProps } from './TrendIndicator';

const COUNT_TALL_SPARKLINE_MAX_HEIGHT_PX = 80;
const COUNT_NUMBER_DISPLAY_MIN_GRID_ROWS = 5;

/** Count widget: link wraps large digits — avoid default link styling clashing with the measure typography. */
function isNonEmptyLinkTarget(linkTo: To | undefined): linkTo is To {
  if (linkTo === undefined) {
    return false;
  }
  if (typeof linkTo === 'string') {
    return linkTo !== '';
  }
  return true;
}

export interface CountWidgetProps {
  /**
   * When set, the value is linked (project dashboard). Omit for portfolio (non-interactive display).
   */
  linkTo?: To;
  metricKey: MetricKey;
  /** Metric metadata `type` is a string; `Measure` accepts the resolved enum. */
  metricType: MetricType | string;
  showTrendIndicator?: boolean;
  sparklineSeries?: ReadonlyArray<number>;
  trendIndicatorData?: TrendIndicatorProps;
  /** Optional unit label rendered below the value (e.g. "issues / 1K LOC"). */
  unitLabel?: string;
  value: string;
}

export function CountWidget({
  linkTo,
  metricKey,
  metricType,
  sparklineSeries,
  showTrendIndicator,
  trendIndicatorData,
  unitLabel,
  value,
}: Readonly<CountWidgetProps>) {
  const widgetInstance = useOptionalWidgetInstanceContext();
  const gridRows = widgetInstance?.dimensions.height;
  const isTallLayout = gridRows !== undefined && gridRows >= COUNT_NUMBER_DISPLAY_MIN_GRID_ROWS;
  const measureTextId = useId();
  const widgetTitleId =
    widgetInstance?.widgetKey !== undefined
      ? getWidgetTitleId(widgetInstance.widgetKey)
      : undefined;

  const countTypographyClassName = isTallLayout ? 'sw-typo-display' : 'sw-heading-xl';

  const measureEl = isNonEmptyLinkTarget(linkTo) ? (
    <LinkStandalone
      aria-labelledby={widgetTitleId ? `${measureTextId} ${widgetTitleId}` : undefined}
      className="sw-font-inherit sw-text-inherit sw-no-underline hover:sw-underline"
      to={linkTo}
    >
      <span className="sw-contents" id={measureTextId}>
        <Measure badgeSize="xl" metricKey={metricKey} metricType={metricType} value={value} />
      </span>
    </LinkStandalone>
  ) : (
    <span className="sw-font-inherit">
      <Measure badgeSize="xl" metricKey={metricKey} metricType={metricType} value={value} />
    </span>
  );

  const measureWithUnitEl = unitLabel ? (
    <span className="sw-flex sw-items-baseline sw-gap-2">
      {measureEl}
      <span className="sw-typo-sm sw-whitespace-nowrap sw-text-subtext sw-font-normal">
        {unitLabel}
      </span>
    </span>
  ) : (
    measureEl
  );

  if (!showTrendIndicator || !trendIndicatorData) {
    return (
      <div
        className={`sw-flex sw-h-full sw-flex-1 sw-flex-col sw-items-center sw-justify-center sw-leading-none ${countTypographyClassName}`}
        data-testid="count-widget"
      >
        {measureWithUnitEl}
      </div>
    );
  }

  const trendProps: TrendIndicatorProps = {
    isPending: trendIndicatorData.isPending ?? false,
    trendData: trendIndicatorData.trendData ?? null,
  };

  if (sparklineSeries === undefined) {
    return (
      <div
        className="sw-flex sw-h-full sw-min-h-0 sw-flex-col sw-items-center sw-justify-center sw-gap-1 sw-leading-none"
        data-testid="count-widget"
      >
        <div className={`sw-leading-none ${countTypographyClassName}`}>{measureWithUnitEl}</div>
        <TrendIndicator {...trendProps} />
      </div>
    );
  }

  const sparklineData = [...sparklineSeries];
  const sparklineHeight = isTallLayout ? COUNT_TALL_SPARKLINE_MAX_HEIGHT_PX : SPARKLINE_HEIGHT;

  if (isTallLayout) {
    return (
      <div
        className="sw-flex sw-h-full sw-min-h-0 sw-flex-col sw-justify-center"
        data-testid="count-widget"
      >
        <div className="sw-flex sw-shrink-0 sw-flex-col sw-items-center sw-gap-1 sw-py-1">
          <div className={`sw-leading-none ${countTypographyClassName}`}>{measureWithUnitEl}</div>
          <TrendIndicator {...trendProps} />
        </div>
        <div className="sw-box-border sw-flex sw-w-full sw-shrink-0 sw-items-end sw-max-h-[80px] sw-justify-center sw-overflow-hidden">
          <Sparkline
            data={sparklineData}
            fullWidth={isTallLayout}
            height={sparklineHeight}
            width={SPARKLINE_WIDTH}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="sw-flex sw-h-full sw-min-h-0 sw-flex-col sw-items-center sw-justify-center sw-gap-2 sw-leading-none"
      data-testid="count-widget"
    >
      <div
        className={`sw-flex sw-w-full sw-items-center sw-justify-center sw-gap-2 sw-leading-none ${countTypographyClassName}`}
      >
        {measureWithUnitEl}
        <Sparkline
          className="sw-min-w-0 sw-max-w-[80px] sw-flex-1"
          data={sparklineData}
          fullWidth={isTallLayout}
          height={sparklineHeight}
          preserveAspectRatio="none"
          width={SPARKLINE_WIDTH}
        />
      </div>
      <TrendIndicator {...trendProps} />
    </div>
  );
}
