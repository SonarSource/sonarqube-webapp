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

import { SquareFillIcon } from '@primer/octicons-react';
import {
  Button,
  ButtonSize,
  ButtonVariety,
  Popover,
  Text,
  Tooltip,
} from '@sonarsource/echoes-react';
import { type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import type { PieChartSegment } from '../../types/visualization';

const ITEM_GAP_PX = 12;
const LEGEND_ICON_WIDTH_PX = 16;
const LEGEND_LABEL_CHAR_WIDTH_PX = 7;
const LEGEND_LABEL_MAX_WIDTH_PX = 120;
const LEGEND_ITEM_INNER_GAP_PX = 4;
const MORE_BUTTON_HORIZONTAL_PADDING_PX = 24;
const MORE_BUTTON_PLACEHOLDER_COUNT = 99;

export interface LegendItem {
  color: string;
  label: string;
  seriesIndex?: number;
  url?: string;
  visible?: boolean;
}

export function segmentsToLegendItems(
  segments: PieChartSegment[],
  getUrl?: (segment: PieChartSegment) => string | undefined,
): LegendItem[] {
  return segments.map((segment, index) => ({
    color: segment.color,
    label: segment.label,
    seriesIndex: index,
    url: getUrl?.(segment),
  }));
}

function estimateLegendItemWidth(label: string): number {
  const labelWidth = Math.min(label.length * LEGEND_LABEL_CHAR_WIDTH_PX, LEGEND_LABEL_MAX_WIDTH_PX);
  return LEGEND_ICON_WIDTH_PX + LEGEND_ITEM_INNER_GAP_PX + labelWidth;
}

function estimateTextWidth(text: string): number {
  return text.length * LEGEND_LABEL_CHAR_WIDTH_PX;
}

function isLabelTruncated(label: string): boolean {
  return estimateTextWidth(label) > LEGEND_LABEL_MAX_WIDTH_PX;
}

function LegendLabel({
  children,
  isHighlighted,
}: Readonly<{ children: ReactNode; isHighlighted: boolean }>) {
  return (
    <span
      className="sw-relative sw-inline-flex sw-overflow-hidden sw-text-ellipsis sw-whitespace-nowrap"
      style={{ maxWidth: LEGEND_LABEL_MAX_WIDTH_PX }}
    >
      <Text
        aria-hidden="true"
        className="sw-invisible sw-overflow-hidden sw-text-ellipsis sw-whitespace-nowrap"
        isHighlighted
        isSubtle
      >
        {children}
      </Text>
      <Text
        className="sw-absolute sw-left-0 sw-top-0 sw-overflow-hidden sw-text-ellipsis sw-whitespace-nowrap sw-max-w-full"
        isHighlighted={isHighlighted}
        isSubtle={!isHighlighted}
      >
        {children}
      </Text>
    </span>
  );
}

function LegendItemMeasure({ item }: Readonly<{ item: LegendItem }>) {
  return (
    <div className="sw-flex sw-items-center sw-gap-1 sw-flex-shrink-0" data-legend-item>
      <SquareFillIcon fill={item.color} size={16} />
      <LegendLabel isHighlighted={false}>{item.label}</LegendLabel>
    </div>
  );
}

interface LegendItemDisplayProps {
  isHighlighted: boolean;
  isSelected: boolean;
  item: LegendItem;
  onClick?: () => void;
  onMouseEnter?: () => void;
  testId?: string;
}

function LegendItemDisplay({
  isHighlighted,
  isSelected,
  item,
  onClick,
  onMouseEnter,
  testId,
}: Readonly<LegendItemDisplayProps>) {
  const innerContent = (
    <>
      <SquareFillIcon fill={item.color} size={16} />
      <LegendLabel isHighlighted={isHighlighted}>{item.label}</LegendLabel>
    </>
  );

  const legendItem =
    item.url === undefined ? (
      <button
        aria-pressed={isSelected}
        className="sw-flex sw-flex-shrink-0 sw-cursor-pointer sw-items-center sw-gap-1 sw-border-0 sw-bg-transparent sw-p-0"
        data-legend-item
        data-testid={testId}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        type="button"
      >
        {innerContent}
      </button>
    ) : (
      <Link
        className="sw-flex sw-flex-shrink-0 sw-items-center sw-gap-1 sw-no-underline hover:sw-underline"
        data-legend-item
        data-testid={testId}
        onMouseEnter={onMouseEnter}
        to={item.url}
      >
        {innerContent}
      </Link>
    );

  if (!isLabelTruncated(item.label)) {
    return legendItem;
  }

  return <Tooltip content={item.label}>{legendItem}</Tooltip>;
}

function sumItemWidths(itemWidths: number[], count: number): number {
  if (count <= 0) {
    return 0;
  }

  return itemWidths.slice(0, count).reduce((sum, width, index) => {
    return sum + width + (index > 0 ? ITEM_GAP_PX : 0);
  }, 0);
}

function computeVisibleLegendItemCount({
  containerWidth,
  itemWidths,
  moreButtonWidth,
}: {
  containerWidth: number;
  itemWidths: number[];
  moreButtonWidth: number;
}): number {
  if (itemWidths.length === 0 || containerWidth <= 0) {
    return 0;
  }

  if (sumItemWidths(itemWidths, itemWidths.length) <= containerWidth) {
    return itemWidths.length;
  }

  const availableForItems = containerWidth - moreButtonWidth - ITEM_GAP_PX;
  let visibleCount = 0;

  for (let index = 0; index < itemWidths.length; index++) {
    if (sumItemWidths(itemWidths, index + 1) > availableForItems) {
      break;
    }
    visibleCount = index + 1;
  }

  return Math.max(1, visibleCount);
}

interface ChartHorizontalLegendProps {
  containerWidth: number;
  focusedSeriesIndex?: number;
  items: LegendItem[];
  legendContainerRef?: RefObject<HTMLDivElement | null>;
  onLegendMouseEnter?: () => void;
  onLegendMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => void;
  onSeriesHover?: (seriesIndex: number | undefined) => void;
  onSeriesSelect?: (seriesIndex: number) => void;
  selectedSeriesIndex?: number;
}

export function ChartHorizontalLegend({
  containerWidth,
  focusedSeriesIndex,
  items,
  selectedSeriesIndex,
  legendContainerRef,
  onLegendMouseEnter,
  onLegendMouseLeave,
  onSeriesHover,
  onSeriesSelect,
}: Readonly<ChartHorizontalLegendProps>) {
  const { formatMessage } = useIntl();
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  const moreMessage = formatMessage(
    { id: 'dashboard.chart.legend.more' },
    { count: MORE_BUTTON_PLACEHOLDER_COUNT },
  );

  useLayoutEffect(() => {
    const measureContainer = measureRef.current;
    if (!measureContainer || containerWidth <= 0) {
      setVisibleCount(items.length);
      return;
    }

    const itemElements = measureContainer.querySelectorAll('[data-legend-item]');
    const itemWidths = Array.from(itemElements).map((element, index) => {
      const label = items[index]?.label ?? '';
      const estimatedWidth = estimateLegendItemWidth(label);
      const measuredWidth = element.getBoundingClientRect().width;

      return Math.max(measuredWidth, estimatedWidth);
    });
    const estimatedMoreButtonWidth =
      estimateTextWidth(moreMessage) + MORE_BUTTON_HORIZONTAL_PADDING_PX;
    const measuredMoreButtonWidth = moreMeasureRef.current?.getBoundingClientRect().width ?? 0;
    const moreButtonWidth = Math.max(measuredMoreButtonWidth, estimatedMoreButtonWidth);

    setVisibleCount(
      computeVisibleLegendItemCount({
        containerWidth,
        itemWidths,
        moreButtonWidth,
      }),
    );
  }, [containerWidth, items, moreMessage]);

  if (items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const overflowCount = overflowItems.length;

  return (
    <div className="sw-relative sw-w-full sw-min-w-0">
      <div
        aria-hidden
        className="sw-invisible sw-pointer-events-none sw-absolute sw-left-0 sw-top-0 sw-flex sw-items-center sw-gap-3"
        data-testid="chart-horizontal-legend-measure"
        ref={measureRef}
      >
        {items.map((item) => (
          <LegendItemMeasure item={item} key={`${item.color}-${item.label}`} />
        ))}
        <div ref={moreMeasureRef}>
          <Button size={ButtonSize.Medium} variety={ButtonVariety.Default}>
            {moreMessage}
          </Button>
        </div>
      </div>
      <div
        className="sw-flex sw-justify-center sw-min-w-0 sw-items-center sw-gap-3 sw-overflow-x-hidden"
        data-testid="chart-horizontal-legend"
        onMouseEnter={onLegendMouseEnter}
        onMouseLeave={onLegendMouseLeave}
        ref={legendContainerRef}
      >
        {visibleItems.map((item) => (
          <LegendItemDisplay
            isHighlighted={
              item.seriesIndex !== undefined && item.seriesIndex === focusedSeriesIndex
            }
            isSelected={item.seriesIndex !== undefined && item.seriesIndex === selectedSeriesIndex}
            item={item}
            key={`${item.color}-${item.label}`}
            onClick={
              item.seriesIndex === undefined
                ? undefined
                : () => {
                    onSeriesSelect?.(item.seriesIndex as number);
                  }
            }
            onMouseEnter={
              item.seriesIndex === undefined
                ? undefined
                : () => {
                    onSeriesHover?.(item.seriesIndex);
                  }
            }
            testId="chart-horizontal-legend-item"
          />
        ))}
        {overflowCount > 0 && (
          <Popover
            description={
              <div className="sw-flex sw-flex-col sw-gap-1">
                {overflowItems.map((item) => (
                  <LegendItemDisplay
                    isHighlighted={
                      item.seriesIndex !== undefined && item.seriesIndex === focusedSeriesIndex
                    }
                    isSelected={
                      item.seriesIndex !== undefined && item.seriesIndex === selectedSeriesIndex
                    }
                    item={item}
                    key={`${item.color}-${item.label}`}
                    onClick={
                      item.seriesIndex === undefined
                        ? undefined
                        : () => {
                            onSeriesSelect?.(item.seriesIndex as number);
                          }
                    }
                    onMouseEnter={
                      item.seriesIndex === undefined
                        ? undefined
                        : () => {
                            onSeriesHover?.(item.seriesIndex);
                          }
                    }
                  />
                ))}
              </div>
            }
            side="top"
          >
            <Button
              data-testid="chart-horizontal-legend-more"
              size={ButtonSize.Medium}
              variety={ButtonVariety.Default}
            >
              {formatMessage({ id: 'dashboard.chart.legend.more' }, { count: overflowCount })}
            </Button>
          </Popover>
        )}
      </div>
    </div>
  );
}
