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
import { cssVar, Text } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { BareButton } from '../sonar-aligned/components/buttons';

interface Props {
  className?: string;
  description: ReactNode;
  image: ReactNode;
  onClick: () => void;
  selected: boolean;
}

export function IllustratedSelectionCard(props: Props) {
  const { className, description, image, onClick, selected } = props;

  return (
    <StyledSelectionCard
      aria-pressed={selected}
      className={classNames(className, { selected })}
      onClick={onClick}
    >
      <ImageContainer>{image}</ImageContainer>
      <DescriptionContainer>
        <Text isSubtle>{description}</Text>
      </DescriptionContainer>
    </StyledSelectionCard>
  );
}

const ImageContainer = styled.div`
  min-height: 116px;
  flex: 1;
  background: ${cssVar('color-surface-canvas-default')};
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${cssVar('border-radius-200', '0.25rem')};
  border-top-right-radius: ${cssVar('border-radius-200', '0.25rem')};
`;

const DescriptionContainer = styled.div`
  background: ${cssVar('color-surface-default')};
  border-top: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
  border-bottom-right-radius: ${cssVar('border-radius-200', '0.25rem')};
  border-bottom-left-radius: ${cssVar('border-radius-200', '0.25rem')};
  padding: ${cssVar('dimension-space-200', '1rem')};
`;

const StyledSelectionCard = styled(BareButton)`
  display: flex;
  flex-direction: column;
  border-radius: ${cssVar('border-radius-200', '0.25rem')};

  min-width: 146px;
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
  transition: border 0.3s ease;

  &:hover,
  &:active {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-accent-default')};
  }

  &:focus {
    outline: 4px solid ${cssVar('color-border-accent-default')};
  }

  &.selected {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-accent-default')};
  }
`;
