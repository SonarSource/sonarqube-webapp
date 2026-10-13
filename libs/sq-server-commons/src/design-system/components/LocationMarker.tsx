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
import classNames from 'classnames';
import { forwardRef, LegacyRef } from 'react';
import { isDefined } from '~shared/helpers/types';
import { IssueLocationIcon } from './icons/IssueLocationIcon';

interface Props {
  className?: string;
  onClick?: () => void;
  selected: boolean;
  text?: number | string;
}

function InternalLocationMarker(
  { className, onClick, text, selected }: Props,
  ref: LegacyRef<HTMLDivElement>,
) {
  return (
    <StyledMarker
      className={classNames(className, {
        selected,
        concealed: !isDefined(text),
        'sw-cursor-pointer': isDefined(onClick),
      })}
      onClick={onClick}
      ref={ref}
    >
      {isDefined(text) ? text : <IssueLocationIcon />}
    </StyledMarker>
  );
}

export const LocationMarker = forwardRef<HTMLDivElement, Props>(InternalLocationMarker);

export const StyledMarker = styled.div`
  display: flex;
  flex-grow: 0;
  align-items: center;
  justify-content: center;
  font: ${cssVar('typography-text-default-semi-bold')};
  border-radius: ${cssVar('border-radius-100', '0.125rem')};

  height: 1.125rem;
  color: var(--code-viewer-location-marker-text);
  background-color: var(--code-viewer-location-marker-background);

  &.selected,
  &:hover {
    background-color: var(--code-viewer-location-marker-background-selected);
  }

  &:not(.concealed) {
    padding-left: ${cssVar('dimension-space-50', '0.25rem')};
    padding-right: ${cssVar('dimension-space-50', '0.25rem')};
    align-self: flex-start;
  }
`;
