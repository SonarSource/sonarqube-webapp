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
import { ReactNode } from 'react';
import { DonutChart } from '~shared/components/charts/DonutChart';
import { StepCardVisual } from '../../../types/types';
import { OnboardingProgressDonut } from '../../progress/OnboardingProgressDonut';

const AVATAR_SIZE = '3.25rem';
/** Filled circle sitting inside the ring for the "bound" binding visual. */
const INNER_AVATAR_SIZE = '1rem';
const DONUT_SIZE = 64;
const DONUT_THICKNESS = 6;

interface Props {
  /** Ring completion (0–100) when `visual` is `donut`. */
  donutPercent?: number;
  isSelected: boolean;
  onSelect: () => void;
  /** Large value rendered in the left slot when `visual` is `number`. */
  primaryValue?: ReactNode;
  /** Subtle caption under the title (e.g. "Unbound", "48 / 120"). */
  secondaryLine?: ReactNode;
  title: string;
  visual: StepCardVisual;
}

function Avatar({
  background,
  icon,
  size = AVATAR_SIZE,
}: Readonly<{ background: string; icon: ReactNode; size?: string }>) {
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

/** A full ring with an icon (or filled avatar) centered inside — used by the binding step. */
function IconRing({ icon, ringColor }: Readonly<{ icon: ReactNode; ringColor: string }>) {
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
      <div className="sw-absolute sw-inset-0 sw-flex sw-items-center sw-justify-center">{icon}</div>
    </div>
  );
}

function VisualSlot({
  donutPercent,
  primaryValue,
  visual,
}: Readonly<Pick<Props, 'donutPercent' | 'primaryValue' | 'visual'>>) {
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
    case StepCardVisual.Number:
      return (
        <Text isHighlighted size={TextSize.Large}>
          {primaryValue}
        </Text>
      );
    case StepCardVisual.AvatarDone:
      return (
        <IconRing
          icon={
            <Avatar
              background={cssVar('color-background-success-default')}
              icon={<IconCheck color="echoes-color-icon-on-color" />}
              size={INNER_AVATAR_SIZE}
            />
          }
          ringColor={cssVar('color-background-success-weak-default')}
        />
      );
    case StepCardVisual.AvatarLocked:
      return (
        <Avatar
          background={cssVar('color-background-neutral-subtle-default')}
          icon={<IconLock color="echoes-color-icon-subtle" />}
        />
      );
    case StepCardVisual.AvatarUnbound:
    default:
      return (
        <IconRing
          icon={<IconLink color="echoes-color-icon-subtle" />}
          ringColor={cssVar('color-background-neutral-subtle-default')}
        />
      );
  }
}

/**
 * A single selectable card in the onboarding stepper. Renders as a button so it is keyboard
 * operable; the selected state is conveyed with an accent ring and `aria-pressed`.
 */
export function StepCard({
  donutPercent,
  isSelected,
  onSelect,
  primaryValue,
  secondaryLine,
  title,
  visual,
}: Readonly<Props>) {
  return (
    <button
      aria-label={title}
      aria-pressed={isSelected}
      className="sw-flex sw-items-center sw-w-full sw-cursor-pointer sw-rounded-2 sw-border-0 sw-bg-transparent sw-p-0 sw-text-left"
      onClick={onSelect}
      style={{
        boxShadow: isSelected ? `0 0 0 2px ${cssVar('color-border-accent-default')}` : undefined,
      }}
      type="button"
    >
      <Card className="sw-min-w-0">
        <Card.Body className="sw-flex sw-items-center">
          <div className="sw-flex sw-items-center sw-gap-4 sw-py-2">
            <VisualSlot donutPercent={donutPercent} primaryValue={primaryValue} visual={visual} />
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
