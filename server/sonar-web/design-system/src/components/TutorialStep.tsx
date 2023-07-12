/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import tw from 'twin.macro';
import { themeBorder, themeColor, themeContrast } from '../helpers/theme';

interface Props {
  children: React.ReactNode;
  title: React.ReactNode;
}

export function TutorialStep(props: Props) {
  return (
    <Step>
      <Title>{props.title}</Title>
      <StepDetails>{props.children}</StepDetails>
    </Step>
  );
}

const StepDetails = styled.div`
  h3 {
    ${tw`sw-body-sm-highlight`}
    ${tw`sw-my-2`}

    color: ${themeColor('pageContent')};
  }

  &,
  h4,
  h5 {
    ${tw`sw-body-sm`}
    ${tw`sw-mb-2`}

    color: ${themeColor('pageContent')};
  }
`;

const Title = styled.h2`
  ${tw`sw-body-md-highlight`}
  ${tw`sw-inline-block`}
  ${tw`sw-mb-4`}

  color: ${themeColor('pageTitle')};
`;

const Step = styled.li`
  list-style: none;
  counter-increment: li;

  ${tw`sw-mt-10`}

  &::before {
    color: ${themeContrast('pageContentLight')};
    content: counter(li);

    ${tw`sw-inline-block`}
    ${tw`sw-align-middle`}
    ${tw`sw-heading-md`}
    ${tw`sw-mr-2 sw--mt-1`}
  }

  & + & {
    border-top: ${themeBorder('default')};

    ${tw`sw-pt-10`}
  }
`;
