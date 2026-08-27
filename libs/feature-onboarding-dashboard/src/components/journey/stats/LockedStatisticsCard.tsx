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

import { Button, ButtonVariety, cssVar, IconLock, Text, TextSize } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import { ReactNode } from 'react';
import { Path } from 'react-router-dom';

const BACKDROP_VIEWBOX = '0 0 400 120';
const BACKDROP_POLYLINE = '0,104 57,92 114,96 171,70 229,58 286,62 343,30 400,16';
const BACKDROP_OPACITY = 0.4;

/**
 * Echoes icons size themselves off the inherited font size — `font-size: calc(1em + 4px)` with a
 * `calc(2em - 16px)` box — so a 28px font size is what yields the 48px lock the design asks for.
 */
const LOCK_ICON_FONT_SIZE_CLASS = 'sw-text-[28px]';

interface Props {
  ctaLabel: string;
  /** Icon shown before the call-to-action label, when the action warrants one. */
  ctaPrefix?: ReactNode;
  /** Where the call-to-action navigates. Levels with no destination yet render an inert button. */
  ctaTo?: Partial<Path>;
  message: string;
  onCta?: () => void;
  title: string;
}

/**
 * Placeholder shown in place of the onboarding statistics that are still locked at the current
 * journey level: a faint chart backdrop behind a lock icon, an explanation and a single
 * call-to-action nudging the user towards the next step.
 *
 * Deliberately borderless: the backdrop bleeds across the full width of the section it replaces,
 * rather than sitting inside card chrome like the statistics it stands in for.
 */
export function LockedStatisticsCard({
  ctaLabel,
  ctaPrefix,
  ctaTo,
  message,
  onCta = noop,
  title,
}: Readonly<Props>) {
  // `Button` forbids `to` on its plain-button variety, so the destination cannot be spread in as a
  // possibly-undefined prop. Levels with no destination yet keep rendering the same inert button.
  const ctaProps = {
    children: ctaLabel,
    prefix: ctaPrefix,
    variety: ButtonVariety.Default,
  } as const;

  return (
    <div className="sw-relative sw-overflow-hidden sw-py-12">
      <DecorativeChartBackdrop />

      <div className="sw-relative sw-z-normal sw-mx-auto sw-flex sw-max-w-abs-500 sw-flex-col sw-items-center sw-gap-6 sw-p-6 sw-text-center">
        <IconLock className={LOCK_ICON_FONT_SIZE_CLASS} color="echoes-color-icon-subtle" />

        <div className="sw-flex sw-flex-col sw-items-center sw-gap-2">
          <Text isHighlighted size={TextSize.Large}>
            {title}
          </Text>
          <Text isSubtle>{message}</Text>
        </div>

        {ctaTo === undefined ? (
          <Button {...ctaProps} enablePreventDefault onClick={onCta} />
        ) : (
          <Button {...ctaProps} to={ctaTo} />
        )}
      </div>
    </div>
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
