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

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import { ChangeEvent, CSSProperties, KeyboardEvent, useId, useRef } from 'react';

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
  /** Optional secondary text shown next to the label, e.g. a short status for the current value. */
  labelDetail?: string;
  onChange: (value: string) => void;
  steps: SliderStep[];
  value: string;
}

/**
 * A discrete, draggable slider across a fixed set of named steps, built on a native
 * `<input type="range">` rather than a JS-driven primitive - this gets keyboard stepping
 * (Arrow/Home/End), boundary clamping, and a `disabled` state for free from the browser, and a
 * real `<label htmlFor>` association needs no extra ARIA plumbing.
 *
 * Works in terms of the step `value` strings passed in `steps`, never the native input's own
 * numeric index, so callers never deal with translating between the two.
 */
export function Slider({
  ariaLabel,
  className,
  id,
  isDisabled,
  label,
  labelDetail,
  onChange,
  steps,
  value,
}: Readonly<SliderProps>) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIndex = Math.max(
    0,
    steps.findIndex((step) => step.value === value),
  );
  // Kept inside the 1-99 range rather than the full 0-100 - right at the edges, the gradient-fill
  // background (see `sliderTrackStyle`) leaves a sliver of the unfilled color peeking past the
  // thumb by a pixel or two.
  const fillPercentage = steps.length > 1 ? (98 / (steps.length - 1)) * selectedIndex + 1 : 50;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const step = steps[Number(event.target.value)];
    if (step) {
      onChange(step.value);
    }
  };

  // A native range input already steps on Arrow/Home/End by itself in a real browser, but jsdom
  // (and so this component's own tests) doesn't implement that - handled explicitly here instead
  // of relying on it, which also keeps the stepping behavior identical across browsers.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextIndex = selectedIndex + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        nextIndex = selectedIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = steps.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const step = steps[Math.min(Math.max(nextIndex, 0), steps.length - 1)];
    if (step && step.value !== value) {
      onChange(step.value);
    }
  };

  return (
    <div className={className}>
      {label && (
        <div className="sw-flex sw-items-baseline sw-gap-2 sw-mb-2">
          <Label className="sw-font-semibold" htmlFor={sliderId}>
            {label}
          </Label>
          {labelDetail && (
            <span
              className="sw-text-sm"
              id={`${sliderId}-detail`}
              style={{ color: cssVar('color-text-subtle') }}
            >
              {labelDetail}
            </span>
          )}
        </div>
      )}

      <SliderInputWrapper className="sw-relative sw-w-full">
        <SliderInput
          aria-describedby={labelDetail ? `${sliderId}-detail` : undefined}
          aria-label={ariaLabel}
          aria-valuetext={steps[selectedIndex]?.label}
          className="sw-w-full sw-cursor-pointer"
          disabled={isDisabled}
          id={sliderId}
          max={steps.length - 1}
          min={0}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          style={{ '--sliderFilling': `${fillPercentage}%` } as CSSProperties}
          type="range"
          value={selectedIndex}
        />
      </SliderInputWrapper>

      <Graduations className="sw-relative sw-w-full sw-mt-2">
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
              className="sw-absolute sw-top-0 sw-flex sw-flex-col sw-items-center sw-gap-1"
              key={step.value}
              position={position}
              style={{ left: `${steps.length > 1 ? (index / (steps.length - 1)) * 100 : 50}%` }}
            >
              <GraduationLabel
                className="sw-text-xs sw-whitespace-nowrap sw-cursor-pointer"
                disabled={isDisabled}
                onClick={() => {
                  onChange(step.value);
                  inputRef.current?.focus();
                }}
                tabIndex={-1}
                type="button"
              >
                {step.label}
              </GraduationLabel>
            </Graduation>
          );
        })}
      </Graduations>
    </div>
  );
}

const Label = styled.label`
  color: ${cssVar('color-text-default')};
`;

const SLIDER_TRACK_HEIGHT = cssVar('dimension-height-100');
// Both axes deliberately use the same (height) token - Echoes' width/height scale is unequal at
// every step (e.g. meant for buttons), so pairing a `width-N` token with a `height-N` token here
// would render a capsule instead of a circle.
const SLIDER_THUMB_SIZE = cssVar('dimension-height-400');

const SliderInputWrapper = styled.div`
  height: ${SLIDER_TRACK_HEIGHT};
  display: flex;
  align-items: center;
`;

// box-shadow is used instead of border so it doesn't impact the slider thumb size and allows for
// multiple borders for the focus style.
const sliderThumbStyle = css`
  width: ${SLIDER_THUMB_SIZE};
  height: ${SLIDER_THUMB_SIZE};
  margin-top: calc((${SLIDER_TRACK_HEIGHT} - ${SLIDER_THUMB_SIZE}) / 2);
  background-color: ${cssVar('color-background-accent-default')};
  border-radius: 50%;
  box-shadow: ${cssVar('box-shadow-small')};
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  -webkit-appearance: none;
`;

const sliderTrackStyle = css`
  height: ${SLIDER_TRACK_HEIGHT};
  border-radius: 625rem;
  background-color: ${cssVar('color-background-neutral-subtle-default')};
  background-image: linear-gradient(
    ${cssVar('color-background-accent-default')},
    ${cssVar('color-background-accent-default')}
  );
  background-repeat: no-repeat;
  background-size: var(--sliderFilling);
`;

const SliderInput = styled.input`
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover,
  &:focus-visible {
    &::-webkit-slider-thumb {
      box-shadow: ${cssVar('box-shadow-medium')};
    }
    &::-moz-range-thumb {
      box-shadow: ${cssVar('box-shadow-medium')};
    }
  }
  &:focus-visible {
    &::-webkit-slider-thumb {
      outline: 2px solid ${cssVar('color-focus-default')};
      outline-offset: 2px;
    }
    &::-moz-range-thumb {
      outline: 2px solid ${cssVar('color-focus-default')};
      outline-offset: 2px;
    }
  }

  &::-webkit-slider-thumb {
    ${sliderThumbStyle}
  }
  &::-moz-range-thumb {
    ${sliderThumbStyle}
  }
  &::-webkit-slider-runnable-track {
    ${sliderTrackStyle}
  }
  &::-moz-range-track {
    ${sliderTrackStyle}
  }
`;

const Graduations = styled.div`
  height: 1.75rem;
`;

/* Positioned at the same percentage the input uses for its thumb (min 0 / max steps.length - 1),
 * then shifted back by half its own width, so the label lines up with the stop it represents
 * instead of drifting off it once step labels have different widths.
 *
 * The first and last graduations get an extra inward shift on top of that, so their label never
 * sits flush against - or spills past - the ends of the slider track. */
const Graduation = styled.div<{ position: 'center' | 'end' | 'start' }>`
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

/** A step's label, clickable to jump the slider straight to it without needing to drag through
 * every step in between - a plain button reset directly here (rather than importing a shared
 * "bare button" helper) since this `libs/shared` component can't depend on any
 * app/`private`-level design-system code. Taken out of the tab order (`tabIndex={-1}`) since the
 * range input already handles keyboard stepping (Arrow/Home/End) - without that, every step would
 * add its own unlabeled tab stop (e.g. a bare "Blocker" button with no hint of which slider it
 * belongs to), for keyboard/screen-reader users who gain nothing from it. */
const GraduationLabel = styled.button`
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: ${cssVar('color-text-subtle')};

  &:hover {
    color: ${cssVar('color-text-accent')};
  }
  &:disabled {
    cursor: not-allowed;
  }
`;
