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

import { useMemo } from 'react';
import { formatCurrency } from '../utils/format';

interface DonutSegment {
  color: string;
  label: string;
  value: number;
}

interface Props {
  centerLabel: string;
  centerValue: string;
  segments: DonutSegment[];
}

const SIZE = 240;
const STROKE_WIDTH = 28;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;
const INNER_DIAMETER = 2 * (RADIUS - STROKE_WIDTH / 2);

function ValueDonutChart({ segments, centerValue, centerLabel }: Props) {
  const computed = useMemo(() => {
    const active = segments.filter((s) => s.value > 0);
    const total = active.reduce((sum, s) => sum + s.value, 0);
    if (total === 0) {
      return [];
    }

    const totalGap = active.length * GAP;
    const availableLength = CIRCUMFERENCE - totalGap;
    let offset = 0;

    return active.map((s) => {
      const fraction = s.value / total;
      const dashLength = fraction * availableLength;
      const result = {
        ...s,
        dashLength,
        dashOffset: offset,
        percentage: Math.round(fraction * 100),
      };
      offset += dashLength + GAP;
      return result;
    });
  }, [segments]);

  if (computed.length === 0) {
    return null;
  }

  return (
    <div className="sw-flex sw-items-center sw-justify-center sw-gap-12">
      <div className="sw-relative sw-shrink-0" style={{ height: SIZE, width: SIZE }}>
        <svg height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            stroke="#EEF4FC"
            strokeWidth={STROKE_WIDTH}
          />
          {computed.map((seg) => (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              fill="none"
              key={seg.label}
              r={RADIUS}
              stroke={seg.color}
              strokeDasharray={`${seg.dashLength} ${CIRCUMFERENCE - seg.dashLength}`}
              strokeDashoffset={-seg.dashOffset}
              strokeLinecap="round"
              strokeWidth={STROKE_WIDTH}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: 'stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out',
              }}
            />
          ))}
        </svg>
        <div className="sw-absolute sw-inset-0 sw-flex sw-items-center sw-justify-center sw-pointer-events-none">
          <div
            className="sw-flex sw-flex-col sw-items-center sw-justify-center sw-text-center"
            style={{ width: INNER_DIAMETER, height: INNER_DIAMETER }}
          >
            <div
              className="sw-font-bold sw-leading-tight"
              style={{
                fontSize: 28,
                background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {centerValue}
            </div>
            <div
              className="sw-leading-tight sw-mt-1 sw-font-medium"
              style={{ color: '#69809B', fontSize: 12 }}
            >
              {centerLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="sw-flex sw-flex-col sw-gap-4">
        {computed.map((seg) => (
          <div
            className="sw-flex sw-items-start sw-gap-3 sw-p-3"
            key={seg.label}
            style={{
              borderRadius: 10,
              border: '1px solid rgba(183, 211, 242, 0.3)',
              backgroundColor: 'white',
              minWidth: 200,
            }}
          >
            <div
              className="sw-shrink-0 sw-mt-0.5"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: seg.color,
              }}
            />
            <div className="sw-flex sw-flex-col sw-flex-1">
              <div className="sw-flex sw-items-baseline sw-justify-between sw-gap-3">
                <span className="sw-font-semibold" style={{ fontSize: 15, color: '#290042' }}>
                  {formatCurrency(seg.value)}
                </span>
                <span className="sw-text-sm sw-font-medium" style={{ color: '#69809B' }}>
                  {seg.percentage}%
                </span>
              </div>
              <span className="sw-text-xs sw-mt-0.5" style={{ color: '#69809B' }}>
                {seg.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ValueDonutChart };
