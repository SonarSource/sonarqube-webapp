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
import { forwardRef, Ref, useCallback, useRef } from 'react';
import { LocationMarker } from '../LocationMarker';

interface Props {
  hideLocationIndex?: boolean;
  index: number;
  leading?: boolean;
  message?: string;
  onLocationSelect?: (index: number) => void;
  selected: boolean;
}

function LineMarkerFunc(
  { hideLocationIndex, index, leading, message, onLocationSelect, selected }: Props,
  ref: Ref<HTMLElement>,
) {
  const element = useRef<HTMLDivElement | null>(null);
  const elementMessage = useRef<HTMLDivElement | null>(null);

  const handleClick = useCallback(() => {
    onLocationSelect?.(index);
  }, [index, onLocationSelect]);

  return (
    <Wrapper className={classNames({ leading })} ref={element}>
      <LocationMarker
        onClick={handleClick}
        ref={ref as React.RefObject<HTMLDivElement | null>}
        selected={selected}
        text={hideLocationIndex ? undefined : index + 1}
      />
      {message && <Message ref={elementMessage}>{message}</Message>}
    </Wrapper>
  );
}

const Message = styled.div`
  position: absolute;
  font: ${cssVar('typography-text-default-regular')};
  border-radius: ${cssVar('border-radius-100', '0.125rem')};
  padding-left: ${cssVar('dimension-space-50', '0.25rem')};
  padding-right: ${cssVar('dimension-space-50', '0.25rem')};
  left: 0;

  z-index: 1;
  bottom: calc(100% + 0.25rem);
  width: max-content;
  max-width: var(--max-width);
  color: var(--code-viewer-issue-message-tooltip-text);
  background-color: var(--code-viewer-issue-message-tooltip-background);
  visibility: hidden;

  &.message-right {
    left: auto;
    right: 0;
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  vertical-align: top;

  &:not(:first-of-type) {
    margin-left: ${cssVar('dimension-space-50', '0.25rem')};
  }

  &.leading {
    margin-left: calc(var(--width) - 0.25rem);
  }

  &:hover ${Message} {
    visibility: visible;
  }
`;

export const LineMarker = forwardRef<HTMLElement, Props>(LineMarkerFunc);
