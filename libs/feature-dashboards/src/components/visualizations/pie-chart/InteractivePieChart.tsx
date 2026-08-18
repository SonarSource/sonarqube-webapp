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

import { useMemo, useRef, useState } from 'react';
import { useResizeObserver } from '~shared/helpers/useResizeObserver';
import { PieChartPastry, type PieChartSegment } from '../../../types/visualization';
import { ChartHorizontalLegend, segmentsToLegendItems } from '../ChartHorizontalLegend';
import { PieChart } from './PieChart';
import { useActiveSegmentIndex } from './useActiveSegmentIndex';

// Total horizontal extent the labels need: the SVG has overflow:visible, and labels
// are anchored at (radius + LABEL_OFFSET) and extend LABEL_MAX_WIDTH further outward.
// 2 × (90 radius + 45 offset + 90 max width) = 450px. Narrower containers clip the labels.
const LABEL_WIDTH_THRESHOLD = 450;

interface InteractivePieChartProps {
  ariaLabel: string;
  getSegmentUrl: (segment: PieChartSegment) => string | undefined;
  onSegmentClick: (segment: PieChartSegment) => void;
  pastry?: PieChartPastry;
  segments: PieChartSegment[];
  selectedSegmentLabel?: string;
  showLegend: boolean;
}

export function InteractivePieChart(props: Readonly<InteractivePieChartProps>) {
  const {
    ariaLabel,
    getSegmentUrl,
    onSegmentClick,
    pastry,
    selectedSegmentLabel,
    segments,
    showLegend,
  } = props;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [observedWidth] = useResizeObserver(containerRef);
  const containerWidth = observedWidth ?? 0;
  const { activeIndex } = useActiveSegmentIndex(segments, selectedSegmentLabel, hoveredIndex);

  const showLabelsOnChart = containerWidth >= LABEL_WIDTH_THRESHOLD;

  const legendItems = useMemo(
    () => segmentsToLegendItems(segments, getSegmentUrl),
    [segments, getSegmentUrl],
  );

  return (
    <div
      className="sw-h-full sw-flex sw-flex-col sw-items-center sw-justify-center sw-gap-4"
      data-testid="pie-chart-container"
      ref={containerRef}
    >
      <div className="sw-flex sw-items-center sw-justify-center">
        <PieChart
          ariaLabel={ariaLabel}
          height={180}
          hoveredIndex={activeIndex}
          onHoverChange={setHoveredIndex}
          onSegmentClick={onSegmentClick}
          pastry={pastry}
          segments={segments}
          showLabels={showLabelsOnChart}
          width={180}
        />
      </div>

      {showLegend && (
        <ChartHorizontalLegend
          containerWidth={containerWidth}
          focusedSeriesIndex={activeIndex ?? undefined}
          items={legendItems}
          onLegendMouseLeave={() => {
            setHoveredIndex(null);
          }}
          onSeriesHover={(seriesIndex) => {
            setHoveredIndex(seriesIndex ?? null);
          }}
          onSeriesSelect={(seriesIndex) => {
            onSegmentClick(segments[seriesIndex]);
          }}
        />
      )}
    </div>
  );
}
