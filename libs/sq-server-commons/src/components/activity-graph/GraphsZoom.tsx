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

import { useRef } from 'react';
import { useResizeObserver } from '~shared/helpers/useResizeObserver';
import { Serie } from '../../types/project-activity';
import { ZoomTimeLine } from '../charts/ZoomTimeLine';
import { hasHistoryData } from './utils';

interface GraphsZoomProps {
  graphEndDate?: Date;
  graphStartDate?: Date;
  leakPeriodDate?: Date;
  loading: boolean;
  metricsType: string;
  onUpdateGraphZoom: (from?: Date, to?: Date) => void;
  series: Serie[];
  showAreas?: boolean;
}

const ZOOM_TIMELINE_PADDING_TOP = 0;
const ZOOM_TIMELINE_PADDING_RIGHT = 10;
const ZOOM_TIMELINE_PADDING_BOTTOM = 18;
const ZOOM_TIMELINE_PADDING_LEFT = 60;
const ZOOM_TIMELINE_HEIGHT = 64;

export default function GraphsZoom(props: GraphsZoomProps) {
  const { loading, series, graphEndDate, leakPeriodDate, metricsType, showAreas, graphStartDate } =
    props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth] = useResizeObserver(containerRef);

  return (
    // We hide this for screen readers; they should use date inputs instead.
    <div
      aria-hidden
      className="activity-graph-zoom sw-min-w-full sw-overflow-hidden sw-w-0"
      ref={containerRef}
    >
      <div className="sw-overflow-hidden sw-w-full">
        {!loading && hasHistoryData(series) && containerWidth !== undefined && (
          <ZoomTimeLine
            endDate={graphEndDate}
            height={ZOOM_TIMELINE_HEIGHT}
            leakPeriodDate={leakPeriodDate}
            metricType={metricsType}
            padding={[
              ZOOM_TIMELINE_PADDING_TOP,
              ZOOM_TIMELINE_PADDING_RIGHT,
              ZOOM_TIMELINE_PADDING_BOTTOM,
              ZOOM_TIMELINE_PADDING_LEFT,
            ]}
            series={series}
            showAreas={showAreas}
            startDate={graphStartDate}
            updateZoom={props.onUpdateGraphZoom}
            width={containerWidth}
          />
        )}
      </div>
    </div>
  );
}
