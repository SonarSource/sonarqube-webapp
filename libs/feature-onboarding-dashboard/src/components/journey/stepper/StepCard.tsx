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
  Card,
  cssVar,
  IconCheck,
  IconLink,
  IconLock,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { DonutChart } from '~shared/components/charts/DonutChart';
import { OnboardingProgressDonut } from '~shared/components/onboarding/OnboardingProgressDonut';
import { StepCardVisual } from '../../../types/types';

/** Filled circle sitting inside the ring for the "bound" binding visual. */
const INNER_AVATAR_SIZE = '1rem';
const DONUT_SIZE = 64;
const DONUT_THICKNESS = 6;

interface Props {
  /** Ring completion (0–100) when `visual` is `donut`. */
  donutPercent?: number;
  isLocked?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  /** Value shown inside the ring when `visual` is `countRing`. Folded into the accessible name. */
  ringLabel?: string;
  /** Subtle caption under the title (e.g. "Unbound", "48 / 120"). */
  secondaryLine?: ReactNode;
  title: string;
  visual: StepCardVisual;
}

function Avatar({
  background,
  icon,
  size,
}: Readonly<{ background: string; icon: ReactNode; size: string }>) {
  return (
    <span
      aria-hidden
      className="sw-flex sw-shrink-0 sw-items-center sw-justify-center sw-rounded-pill"
      style={{ backgroundColor: background, height: size, width: size }}
    >
      {icon}
    </span>
  );
}

/** A full ring with arbitrary content (icon, avatar or value) centered inside. */
function Ring({ center, ringColor }: Readonly<{ center: ReactNode; ringColor: string }>) {
  return (
    <div
      aria-hidden
      className="sw-relative sw-shrink-0"
      style={{ height: DONUT_SIZE, width: DONUT_SIZE }}
    >
      <DonutChart
        data={[{ fill: ringColor, value: 100 }]}
        height={DONUT_SIZE}
        thickness={DONUT_THICKNESS}
        width={DONUT_SIZE}
      />
      <div className="sw-absolute sw-inset-0 sw-flex sw-items-center sw-justify-center">
        {center}
      </div>
    </div>
  );
}

function VisualSlot({
  donutPercent,
  ringLabel,
  visual,
}: Readonly<Pick<Props, 'donutPercent' | 'ringLabel' | 'visual'>>) {
  switch (visual) {
    case StepCardVisual.Donut:
      return (
        <OnboardingProgressDonut
          showLabel
          size={DONUT_SIZE}
          thickness={DONUT_THICKNESS}
          value={donutPercent ?? 0}
        />
      );
    case StepCardVisual.AvatarDone:
      return (
        <Ring
          center={
            <Avatar
              background={cssVar('color-background-success-default')}
              icon={<IconCheck color="echoes-color-icon-on-color" />}
              size={INNER_AVATAR_SIZE}
            />
          }
          ringColor={cssVar('color-background-success-weak-default')}
        />
      );
    case StepCardVisual.CountRing:
      return (
        <Ring
          center={<Text isHighlighted>{ringLabel}</Text>}
          ringColor={cssVar('color-background-info-default')}
        />
      );
    case StepCardVisual.RingLocked:
      return (
        <Ring
          center={<IconLock color="echoes-color-icon-disabled" />}
          ringColor={cssVar('color-background-neutral-bolder-default')}
        />
      );
    case StepCardVisual.AvatarUnbound:
    default:
      return (
        <Ring
          center={<IconLink color="echoes-color-icon-subtle" />}
          ringColor={cssVar('color-background-neutral-subtle-default')}
        />
      );
  }
}

export function StepCard({
  donutPercent,
  isLocked = false,
  isSelected,
  onSelect,
  ringLabel,
  secondaryLine,
  title,
  visual,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  // The ring is aria-hidden and aria-label overrides the card's content, so whatever the ring
  // alone carries has to be repeated here or it is never announced.
  let accessibleName = title;
  if (isLocked) {
    accessibleName = formatMessage(
      { id: 'onboarding_dashboard.journey.step.locked_aria_label' },
      { title },
    );
  } else if (ringLabel !== undefined) {
    accessibleName = formatMessage(
      { id: 'onboarding_dashboard.journey.step.ring_count_aria_label' },
      { count: ringLabel, title },
    );
  } else if (visual === StepCardVisual.Donut) {
    accessibleName = formatMessage(
      { id: 'onboarding_dashboard.journey.step.ring_count_aria_label' },
      {
        count: formatMessage(
          { id: 'onboarding_dashboard.percent' },
          { percent: donutPercent ?? 0 },
        ),
        title,
      },
    );
  }

  return (
    <button
      aria-disabled={isLocked}
      aria-label={accessibleName}
      aria-pressed={isSelected}
      className={classNames(
        'sw-flex sw-items-center sw-w-full sw-rounded-2 sw-border-0 sw-bg-transparent sw-p-0 sw-text-left',
        isLocked ? 'sw-cursor-not-allowed' : 'sw-cursor-pointer',
      )}
      onClick={isLocked ? undefined : onSelect}
      style={{
        boxShadow: isSelected ? `0 0 0 2px ${cssVar('color-border-accent-default')}` : undefined,
      }}
      type="button"
    >
      <Card className="sw-min-w-0">
        <Card.Body className="sw-flex sw-items-center">
          <div className="sw-flex sw-items-center sw-gap-4 sw-py-2">
            <VisualSlot donutPercent={donutPercent} ringLabel={ringLabel} visual={visual} />
            <div className="sw-flex sw-min-w-0 sw-flex-col">
              <Text isHighlighted>{title}</Text>
              {secondaryLine !== undefined && (
                <Text isSubtle size={TextSize.Small}>
                  {secondaryLine}
                </Text>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </button>
  );
}
