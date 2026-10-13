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
import { cssVar } from '@sonarsource/echoes-react';

interface Props {
  children: React.ReactNode;
  stepNumber?: number;
  title: React.ReactNode;
}

export function TutorialStep({ children, title, stepNumber }: Props) {
  return (
    <Step stepNumber={stepNumber}>
      <Title>{title}</Title>
      <StepDetails>{children}</StepDetails>
    </Step>
  );
}

const StepDetails = styled.div`
  h3 {
    font: ${cssVar('typography-text-default-semi-bold')};
    margin-top: ${cssVar('dimension-space-100', '0.5rem')};
    margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};

    color: ${cssVar('color-text-default')};
  }

  &,
  h4,
  h5 {
    font: ${cssVar('typography-text-default-regular')};
    margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};

    color: ${cssVar('color-text-default')};
  }
`;

const Title = styled.h2`
  font: ${cssVar('typography-text-large-semi-bold')};
  display: inline-block;
  margin-bottom: ${cssVar('dimension-space-200', '1rem')};

  color: ${cssVar('color-text-strong')};
`;

const Step = styled.li<{ stepNumber?: number }>`
  list-style: none;
  counter-increment: li ${(props) => props.stepNumber};

  &::before {
    color: ${cssVar('color-text-subtle')};
    content: counter(li);

    display: inline-block;
    vertical-align: middle;
    font: ${cssVar('typography-heading-large')};
    letter-spacing: ${cssVar('letter-spacing-decreased')};
    margin-top: -0.25rem;
    margin-right: ${cssVar('dimension-space-100', '0.5rem')};
  }

  & + & {
    border-top: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
    margin-top: ${cssVar('dimension-space-500', '2.5rem')};
    padding-top: ${cssVar('dimension-space-500', '2.5rem')};
  }
`;
