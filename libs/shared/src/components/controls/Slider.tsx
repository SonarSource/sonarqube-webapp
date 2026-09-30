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
import * as RadixSlider from '@radix-ui/react-slider';
import { cssVar } from '@sonarsource/echoes-react';
import { useId } from 'react';
import tw from 'twin.macro';

interface SliderStep {
  label: string;
  value: string;
}

export interface SliderProps {
  ariaLabel?: string;
  className?: string;
  id?: string;
  isDisabled?: boolean;
  label?: string;
  onChange: (value: string) => void;
  /** Called once per interaction (drag or keypress) with its final, settled value - unlike
   * `onChange`, which fires on every intermediate step a drag passes through on its way there.
   * Useful for side effects that should react to a deliberate value change, not a step merely
   * crossed mid-drag on the way back to where it started. */
  onCommit?: (value: string) => void;
  steps: SliderStep[];
  value: string;
}

/**
 * A discrete, draggable slider across a fixed set of named steps, built directly on Radix's
 * unstyled Slider primitive - the same primitive family Echoes itself is built on internally
 * (react-radio-group, react-tooltip, etc. are all Radix under the hood) - since Echoes has no
 * Slider component of its own.
 *
 * Works in terms of the step `value` strings passed in `steps`, never Radix's own numeric index,
 * so callers never deal with translating between the two.
 */
export function Slider({
  ariaLabel,
  className,
  id,
  isDisabled,
  label,
  onChange,
  onCommit,
  steps,
  value,
}: Readonly<SliderProps>) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const labelId = `${sliderId}-label`;
  const selectedIndex = Math.max(
    0,
    steps.findIndex((step) => step.value === value),
  );

  const handleValueChange = ([newIndex]: number[]) => {
    const step = steps[newIndex];
    if (step) {
      onChange(step.value);
    }
  };

  const handleValueCommit = ([newIndex]: number[]) => {
    const step = steps[newIndex];
    if (step) {
      onCommit?.(step.value);
    }
  };

  return (
    <div className={className}>
      {label && <Label id={labelId}>{label}</Label>}

      {/* Radix puts role="slider" on the Thumb, not the Root, so the accessible name has to be
       * attached there rather than via a <label htmlFor> pointing at the Root. */}
      <SliderRoot
        disabled={isDisabled}
        id={sliderId}
        max={steps.length - 1}
        min={0}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        step={1}
        value={[selectedIndex]}
      >
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb
          aria-label={ariaLabel}
          aria-labelledby={!ariaLabel && label ? labelId : undefined}
          aria-valuetext={steps[selectedIndex]?.label}
        />
      </SliderRoot>

      <Graduations>
        {steps.map((step, index) => {
          const isFirst = index === 0 && steps.length > 1;
          const isLast = index === steps.length - 1 && steps.length > 1;

          let position: 'center' | 'end' | 'start' = 'center';
          if (isFirst) {
            position = 'start';
          } else if (isLast) {
            position = 'end';
          }

          return (
            <Graduation
              key={step.value}
              position={position}
              style={{ left: `${steps.length > 1 ? (index / (steps.length - 1)) * 100 : 50}%` }}
            >
              <GraduationTick />
              <GraduationLabel>{step.label}</GraduationLabel>
            </Graduation>
          );
        })}
      </Graduations>
    </div>
  );
}

const Label = styled.label`
  ${tw`sw-block sw-mb-2 sw-font-semibold`}
  color: ${cssVar('color-text-default')};
`;

const SliderRoot = styled(RadixSlider.Root)`
  ${tw`sw-relative sw-flex sw-items-center sw-select-none sw-touch-none sw-w-full sw-h-600`}

  &[data-disabled] {
    ${tw`sw-cursor-not-allowed sw-opacity-50`}
  }
`;

const SliderTrack = styled(RadixSlider.Track)`
  ${tw`sw-relative sw-grow sw-rounded-pill sw-h-100`}
  background-color: ${cssVar('color-background-neutral-subtle-default')};
`;

const SliderRange = styled(RadixSlider.Range)`
  ${tw`sw-absolute sw-rounded-pill sw-h-full`}
  background-color: ${cssVar('color-background-accent-default')};
`;

const SliderThumb = styled(RadixSlider.Thumb)`
  ${tw`sw-block sw-rounded-pill sw-cursor-pointer sw-transition-shadow sw-w-400 sw-h-400`}
  background-color: ${cssVar('color-background-accent-default')};
  box-shadow: ${cssVar('box-shadow-small')};

  &:hover {
    box-shadow: ${cssVar('box-shadow-medium')};
  }
  &:focus-visible {
    outline: 2px solid ${cssVar('color-focus-default')};
    outline-offset: 2px;
  }
  &[data-disabled] {
    ${tw`sw-cursor-not-allowed`}
  }
`;

const Graduations = styled.div`
  ${tw`sw-relative sw-w-full sw-mt-2`}
  height: 1.75rem;
`;

/* Positioned at the same percentage Radix uses for the Thumb (min 0 / max steps.length - 1), then
 * shifted back by half its own width, so the tick and label - which move together as a single
 * block - line up with the stop they represent instead of drifting off it once step labels have
 * different widths.
 *
 * The first and last graduations get an extra inward shift on top of that, so their label never
 * sits flush against - or spills past - the ends of the slider track. */
const Graduation = styled.div<{ position: 'center' | 'end' | 'start' }>`
  ${tw`sw-absolute sw-top-0 sw-flex sw-flex-col sw-items-center sw-gap-1`}
  transform: ${({ position }) => {
    switch (position) {
      case 'start':
        return 'translateX(calc(-50% + 0.5rem))';
      case 'end':
        return 'translateX(calc(-50% - 0.5rem))';
      case 'center':
      default:
        return 'translateX(-50%)';
    }
  }};
`;

const GraduationTick = styled.span`
  ${tw`sw-block sw-rounded-pill sw-w-25 sw-h-200`}
  background-color: ${cssVar('color-border-bold')};
`;

const GraduationLabel = styled.span`
  ${tw`sw-text-xs sw-whitespace-nowrap`}
  color: ${cssVar('color-text-subtle')};
`;
