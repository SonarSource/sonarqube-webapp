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

import { Button, ButtonVariety, Card, cssVar, IconLock, Text } from '@sonarsource/echoes-react';
import { noop } from 'lodash';

const BACKDROP_VIEWBOX = '0 0 400 120';
const BACKDROP_POLYLINE = '0,104 57,92 114,96 171,70 229,58 286,62 343,30 400,16';
const BACKDROP_OPACITY = 0.4;

interface Props {
  ctaLabel: string;
  message: string;
  onCta?: () => void;
  title: string;
}

/**
 * Placeholder shown in place of the onboarding statistics that are still locked at the current
 * journey level: a faint chart backdrop behind a lock icon, an explanation and a single
 * call-to-action nudging the user towards the next step.
 */
export function LockedStatisticsCard({ ctaLabel, message, onCta = noop, title }: Readonly<Props>) {
  return (
    <Card>
      <Card.Body className="sw-relative sw-overflow-hidden sw-py-10">
        <DecorativeChartBackdrop />

        <div className="sw-relative sw-z-normal sw-flex sw-flex-col sw-items-center sw-gap-3 sw-text-center">
          <IconLock color="echoes-color-icon-subtle" />
          <Text isHighlighted>{title}</Text>
          <Text isSubtle>{message}</Text>
          <Button enablePreventDefault onClick={onCta} variety={ButtonVariety.Default}>
            {ctaLabel}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

/** Purely decorative rising line, hinting at the chart that the CTA unlocks. */
function DecorativeChartBackdrop() {
  return (
    <svg
      aria-hidden
      className="sw-absolute sw-inset-0 sw-h-full sw-w-full"
      preserveAspectRatio="none"
      style={{ opacity: BACKDROP_OPACITY }}
      viewBox={BACKDROP_VIEWBOX}
    >
      <polyline
        fill="none"
        points={BACKDROP_POLYLINE}
        stroke={cssVar('color-border-weak')}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
