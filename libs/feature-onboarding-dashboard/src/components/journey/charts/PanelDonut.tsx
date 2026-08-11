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

import styled from '@emotion/styled';
import { Card, cssVar, Text, TextSize } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { DonutChart } from '~shared/components/charts/DonutChart';

const DONUT_SIZE = 150;
const DONUT_THICKNESS = 22;

export interface PanelDonutSegment {
  /** Ring/legend swatch color (an Echoes `cssVar` token or severity color). */
  color: string;
  /** Already-translated legend label. */
  label: string;
  value: number;
}

interface Props {
  /** Large percentage shown at the center of the ring, 0–100. */
  centerPercent: number;
  /** Secondary line under the center percentage, e.g. "48 / 120". */
  centerSubLabel: string;
  /** Segments driving both the ring and the legend. */
  segments: PanelDonutSegment[];
  /** When set, renders below the legend — typically a modal with its own trigger. */
  viewAll?: ReactNode;
}

/**
 * A donut with a centered percentage, a legend, and an optional "View all" link. Shared by the
 * "Import repositories" and "Analyze your projects" detail panels of the onboarding dashboard.
 */
export function PanelDonut({ centerPercent, centerSubLabel, segments, viewAll }: Readonly<Props>) {
  return (
    <StyledCard className="sw-min-w-0 sw-max-w-[300px]">
      <Card.Body className="sw-flex sw-items-center sw-justify-center sw-gap-8">
        <div className="sw-flex sw-flex-col sw-items-center sw-gap-4">
          <div
            aria-hidden
            className="sw-relative sw-shrink-0"
            style={{ height: DONUT_SIZE, width: DONUT_SIZE }}
          >
            <DonutChart
              data={segments.map((segment) => ({ fill: segment.color, value: segment.value }))}
              height={DONUT_SIZE}
              padAngle={0.03}
              thickness={DONUT_THICKNESS}
              width={DONUT_SIZE}
            />
            <div className="sw-absolute sw-inset-0 sw-flex sw-flex-col sw-items-center sw-justify-center">
              <Text isHighlighted size={TextSize.Large}>
                {centerPercent}%
              </Text>
              <Text isSubtle size={TextSize.Small}>
                {centerSubLabel}
              </Text>
            </div>
          </div>

          <div className="sw-flex sw-flex-wrap sw-justify-center sw-gap-4">
            {segments.map((segment) => (
              <span className="sw-flex sw-items-center sw-gap-2" key={segment.label}>
                <span
                  aria-hidden
                  className="sw-inline-block sw-shrink-0 sw-rounded-pill"
                  style={{ backgroundColor: segment.color, height: '0.625rem', width: '0.625rem' }}
                />
                <Text isSubtle size={TextSize.Small}>
                  {segment.label}
                </Text>
              </span>
            ))}
          </div>
          {viewAll}
        </div>
      </Card.Body>
    </StyledCard>
  );
}

const StyledCard = styled(Card)`
  background: ${cssVar('color-surface-canvas-default')};
`;
