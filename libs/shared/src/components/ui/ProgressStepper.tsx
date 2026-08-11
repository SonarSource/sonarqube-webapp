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
import tw from 'twin.macro';

type Resolution = 'FAILED' | 'COMPLETED' | 'IN_PROGRESS';

type Props<T extends string | number> = {
  activeStep?: T;
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
  const isClickable = !readOnly && (isDone || isActive);
  const handleClick = () => {
    onChange?.(step);
  };

  let latestColor: string;
  if (resolution === 'FAILED') {
    latestColor = cssVar('color-background-danger-default');
  } else if (resolution === 'COMPLETED') {
    latestColor = cssVar('color-icon-success');
  } else {
    latestColor = cssVar('color-background-accent-default');
  }

  const showCheck = i < progressIndex || (isLatest && resolution === 'COMPLETED');
  const showCross = isLatest && resolution === 'FAILED';

  let stepContent: ReactNode;
  if (showCheck) {
    stepContent = <IconCheck />;
  } else if (showCross) {
    stepContent = <IconX />;
  } else {
    stepContent = i + 1;
  }

  const stepInner = (
    <>
      <StatusCircle
        accentColor={isLatest ? latestColor : undefined}
        aria-current={isActive ? 'step' : undefined}
        aria-labelledby={`step-${step}`}
        disabled={!isDone && !isActive}
        isActive={isActive}
        isLatest={isLatest}
        onClick={readOnly ? undefined : handleClick}
        readOnly={readOnly}
        showPulse={readOnly && isLatest && resolution === 'IN_PROGRESS'}
      >
        {stepContent}
      </StatusCircle>
      <label
        className={classNames(
          'sw-mt-2 sw-block ',
          isClickable && 'hover:sw-underline sw-cursor-pointer',
          isActive && 'sw-font-bold',
        )}
        id={`step-${step}`}
        onClick={isClickable ? handleClick : undefined}
        style={{
          color:
            isLatest && resolution !== 'COMPLETED'
              ? latestColor
              : isDone
                ? undefined
                : cssVar('color-text-subtle'),
        }}
      >
        {stepNames[step]}
      </label>
    </>
  );

  return (
    <li className="sw-w-[160px] sw-text-center">
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
    <nav aria-label="Progress stepper" className="sw-relative sw-inline-block sw-mt-1">
      <ProgressLine>
        <ProgressLineFill style={{ width: `${Math.round((progressIndex / maxIndex) * 100)}%` }} />
      </ProgressLine>
      <ol className="sw-flex sw-relative">
        {steps.map((step, i) => (
          <StepItem
            activeStep={activeStep}
            index={i}
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
    <div className="sw-relative sw-h-1000 sw-aspect-square sw-m-auto">
      {showPulse && <PulseRing style={{ backgroundColor: accentColor }} />}
      <Circle
        {...rem}
        className={classNames(readOnly && 'sw-pointer-events-none', className)}
        style={{
          backgroundColor: isLatest ? accentColor : undefined,
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
  ${tw`sw-absolute sw-inset-0 sw-rounded-pill sw-pointer-events-none`}
  z-index: 0;
  animation: ${pulse} 1.8s ease-out infinite;
`;

const Circle = styled.button`
  all: unset;
  position: relative;
  z-index: 1;
  ${tw`sw-rounded-pill sw-h-1000 sw-aspect-square sw-cursor-pointer sw-transition-all`}
  ${tw`sw-flex sw-justify-center sw-items-center sw-m-auto sw-font-semibold`}
  background-color: ${cssVar('color-icon-success')};
  color: ${cssVar('color-text-on-color')};

  &:disabled {
    background-color: ${cssVar('color-background-neutral-subtle-default')};
    color: ${cssVar('color-text-default')};
    ${tw`sw-cursor-not-allowed`}
  }
  &:hover {
    box-shadow: ${cssVar('box-shadow-small')};
  }
`;

const Ring = styled.div`
  ${tw`sw-absolute sw-w-full sw-h-full`}
  ${tw`sw-flex sw-justify-center sw-items-center sw-m-auto sw-font-semibold `}
  ${tw`sw-rounded-pill sw-pointer-events-none`};
`;

const ProgressLine = styled.div`
  position: absolute;
  ${tw`sw-h-200 sw-top-4`}
  width: calc(100% - 160px);
  left: 80px;
  background-color: ${cssVar('color-background-neutral-subtle-default')};
`;

const ProgressLineFill = styled.div`
  ${tw`sw-h-200`}
  background-color: ${cssVar('color-icon-success')};
  transition: width 0.2s ease-in-out;
`;
