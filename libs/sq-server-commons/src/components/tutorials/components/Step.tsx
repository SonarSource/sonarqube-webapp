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

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import styled from '@emotion/styled';
import * as React from 'react';
import {
  Card,
  TutorialStep,
  TutorialStepList,
  themeBorder,
  themeColor,
} from '../../../design-system';

interface Props {
  finished?: boolean;
  onOpen?: VoidFunction;
  open: boolean;
  renderForm: () => React.ReactNode;
  renderResult?: () => React.ReactNode;
  stepNumber?: number;
  stepTitle: React.ReactNode;
}

const CLOSED_STEP_OPACITY = 0.4;

export default function Step(props: Props) {
  const { finished, open, stepNumber, stepTitle } = props;

  const clickable = !open && finished && props.onOpen !== undefined;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (props.onOpen !== undefined) {
      props.onOpen();
    }
  };

  return (
    <StyledCard
      className="sw-mb-2 sw-px-0"
      clickable={Boolean(clickable)}
      onClick={clickable ? handleClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div
        className="sw-flex sw-items-center sw-justify-between sw-px-6"
        style={{
          opacity: !open && !finished ? CLOSED_STEP_OPACITY : undefined,
        }}
      >
        <TutorialStepList className="sw-flex-1">
          <TutorialStep stepNumber={stepNumber} title={stepTitle}>
            {open ? <div>{props.renderForm()}</div> : <div className="sw-px-5 sw-pb-4" />}
          </TutorialStep>
        </TutorialStepList>
        {!open && props.renderResult?.()}
      </div>
    </StyledCard>
  );
}

const StyledCard = styled(Card)<{ clickable: boolean }>`
  --focus: ${themeColor('buttonSecondaryBorder')};

  ${({ clickable, theme }) =>
    clickable &&
    `
    cursor: pointer;


    &:focus,
    &:active {
      outline: ${themeBorder('focus', 'var(--focus)')({ theme })}
    }
`};
`;
