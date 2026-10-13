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
import { BaseLink } from './Link';
import { LocationMarker, StyledMarker } from './LocationMarker';

interface Props {
  additionalMarkers?: React.ReactNode;
  className?: string;
  message?: string;
  onClick?: () => void;
  selected: boolean;
  step?: number;
}

export function FlowStep(props: Props) {
  const { additionalMarkers, className, message, selected, step } = props;

  return (
    <StyledLink className={className} onClick={props.onClick} to={{}}>
      <>
        <LocationMarker selected={selected} text={step} />
        {additionalMarkers}
      </>
      <span>{message}</span>
    </StyledLink>
  );
}

const StyledLink = styled(BaseLink)`
  border-radius: ${cssVar('border-radius-100', '0.125rem')};
  padding: ${cssVar('dimension-space-50', '0.25rem')};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${cssVar('dimension-space-100', '0.5rem')};
  font: ${cssVar('typography-text-default-regular')};

  color: ${cssVar('color-text-default')};
  border-bottom: none;

  &.selected,
  &:hover {
    background-color: var(--code-viewer-location-selected-background);
  }

  &:hover ${StyledMarker} {
    background-color: var(--code-viewer-location-marker-background-selected);
  }
`;
