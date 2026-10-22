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

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCheck, IconX, Tooltip, cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ComponentProps, ReactNode } from 'react';

type Resolution = 'FAILED' | 'COMPLETED' | 'IN_PROGRESS';

const resolutionColors: Record<Resolution, string> = {
  FAILED: cssVar('color-background-danger-default'),
  COMPLETED: cssVar('color-icon-success'),
  IN_PROGRESS: cssVar('color-background-accent-default'),
};

function getStepContent(index: number, progressIndex: number, resolution: Resolution): ReactNode {
  if (index < progressIndex || (index === progressIndex && resolution === 'COMPLETED')) {
    return <IconCheck />;
  }
  if (index === progressIndex && resolution === 'FAILED') {
    return <IconX />;
  }
  return index + 1;
}

function getStepLabelColor(
  isLatest: boolean,
  isDone: boolean,
  resolution: Resolution,
  isDisabled: boolean,
) {
  if (isDisabled) {
    return cssVar('color-text-subtle');
  }
  if (isLatest && resolution !== 'COMPLETED') {
    return resolutionColors[resolution];
  }
  return isDone ? undefined : cssVar('color-text-subtle');
}

type Props<T extends string | number> = {
  activeStep?: T;
  disabledSteps?: T[];
  progress: T;
  resolution?: Resolution;
  stepNames: Record<T, string>;
  stepTooltips?: Partial<Record<T, string>>;
  steps: T[];
} & (
  | { onChange: (nextStep: T) => void; readOnly?: false }
  | { onChange?: (nextStep: T) => void; readOnly: true }
);

type StepItemProps<T extends string | number> = {
  activeStep?: T;
  isDisabled: boolean;
  index: number;
  onChange?: (step: T) => void;
  progressIndex: number;
  readOnly: boolean;
  resolution: Resolution;
  step: T;
  stepNames: Record<T, string>;
  tooltip?: string;
};

function StepItem<T extends string | number>({
  step,
  index: i,
  activeStep,
  isDisabled,
  progressIndex,
  resolution,
  readOnly,
  onChange,
  stepNames,
  tooltip,
}: Readonly<StepItemProps<T>>) {
  const isActive = activeStep === step;
  const isDone = i <= progressIndex;
  const isLatest = i === progressIndex;
  const isAvailable = isDone || isActive;
  const isClickable = !readOnly && !isDisabled && isAvailable;
  const clickHandler = isClickable ? () => onChange?.(step) : undefined;
  const latestColor = resolutionColors[resolution];
  const labelColor = getStepLabelColor(isLatest, isDone, resolution, isDisabled);

  const stepInner = (
    <>
      <StatusCircle
        accentColor={isLatest ? latestColor : undefined}
        aria-current={isActive ? 'step' : undefined}
        aria-labelledby={`step-${step}`}
        disabled={isDisabled || !isAvailable}
        id={`step-control-${step}`}
        isActive={isActive}
        isLatest={isLatest}
        onClick={clickHandler}
        readOnly={readOnly}
        showPulse={readOnly && isLatest && resolution === 'IN_PROGRESS'}
      >
        {getStepContent(i, progressIndex, resolution)}
      </StatusCircle>
      <label
        className={classNames(
          'sw:mt-2 sw:block ',
          isClickable && 'sw:hover:underline sw:cursor-pointer',
          isActive && 'sw:font-bold',
        )}
        htmlFor={`step-control-${step}`}
        id={`step-${step}`}
        style={{ color: labelColor }}
      >
        {stepNames[step]}
      </label>
    </>
  );

  return (
    <li className="sw:w-[160px] sw:text-center">
      {tooltip ? (
        <Tooltip content={tooltip}>
          <div>{stepInner}</div>
        </Tooltip>
      ) : (
        stepInner
      )}
    </li>
  );
}

export function ProgressStepper<T extends string | number>(props: Readonly<Props<T>>) {
  const {
    steps,
    activeStep,
    disabledSteps = [],
    progress,
    stepNames,
    stepTooltips,
    onChange,
    readOnly = false,
    resolution = 'IN_PROGRESS',
  } = props;

  const progressIndex = steps.indexOf(progress);
  const maxIndex = steps.length - 1;
  return (
    <nav aria-label="Progress stepper" className="sw:relative sw:inline-block sw:mt-1">
      <ProgressLine>
        <ProgressLineFill style={{ width: `${Math.round((progressIndex / maxIndex) * 100)}%` }} />
      </ProgressLine>
      <ol className="sw:flex sw:relative">
        {steps.map((step, i) => (
          <StepItem
            activeStep={activeStep}
            index={i}
            isDisabled={disabledSteps.includes(step)}
            key={i}
            onChange={onChange}
            progressIndex={progressIndex}
            readOnly={readOnly}
            resolution={resolution}
            step={step}
            stepNames={stepNames}
            tooltip={stepTooltips?.[step]}
          />
        ))}
      </ol>
    </nav>
  );
}

type StatusCircleProps = {
  accentColor?: string;
  children: ReactNode;
  isActive: boolean;
  isLatest: boolean;
  readOnly?: boolean;
  showPulse?: boolean;
} & Omit<ComponentProps<typeof Circle>, 'readOnly'>;

function StatusCircle(props: Readonly<StatusCircleProps>) {
  const {
    isLatest,
    isActive,
    readOnly = false,
    showPulse = false,
    accentColor,
    children,
    className,
    ...rem
  } = props;

  return (
    <div className="sw:relative sw:h-1000 sw:aspect-square sw:m-auto">
      {showPulse && <PulseRing style={{ backgroundColor: accentColor }} />}
      <Circle
        {...rem}
        className={classNames(readOnly && 'sw:pointer-events-none', className)}
        style={{
          backgroundColor: isLatest && !rem.disabled ? accentColor : undefined,
          fontWeight: isActive ? 'bold' : undefined,
          boxShadow: isActive ? cssVar('box-shadow-small') : undefined,
        }}
      >
        {isActive ? (
          <Ring
            style={{
              boxShadow: `0 0 0 1px ${cssVar('color-surface-default')},
    0 0 0 4px ${isLatest && accentColor ? accentColor : cssVar('color-icon-success')}`,
            }}
          >
            {children}
          </Ring>
        ) : (
          children
        )}
      </Circle>
    </div>
  );
}

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  80% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
`;

const PulseRing = styled.div`
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: ${cssVar('border-radius-full', '625rem')};
  z-index: 0;
  animation: ${pulse} 1.8s ease-out infinite;
`;

const Circle = styled.button`
  all: unset;
  position: relative;
  z-index: 1;
  aspect-ratio: 1 / 1;
  height: ${cssVar('dimension-height-1000', '2.5rem')};
  cursor: pointer;
  border-radius: ${cssVar('border-radius-full', '625rem')};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${cssVar('font-weight-semi-bold')};
  background-color: ${cssVar('color-icon-success')};
  color: ${cssVar('color-text-on-color')};

  &:disabled {
    background-color: ${cssVar('color-background-neutral-subtle-default')};
    color: ${cssVar('color-text-default')};
    cursor: not-allowed;
  }
  &:hover {
    box-shadow: ${cssVar('box-shadow-small')};
  }
`;

const Ring = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${cssVar('font-weight-semi-bold')};
  pointer-events: none;
  border-radius: ${cssVar('border-radius-full', '625rem')};
`;

const ProgressLine = styled.div`
  position: absolute;
  top: ${cssVar('dimension-space-200', '1rem')};
  height: ${cssVar('dimension-height-200', '0.5rem')};
  width: calc(100% - 160px);
  left: 80px;
  background-color: ${cssVar('color-background-neutral-subtle-default')};
`;

const ProgressLineFill = styled.div`
  height: ${cssVar('dimension-height-200', '0.5rem')};
  background-color: ${cssVar('color-icon-success')};
  transition: width 0.2s ease-in-out;
`;
