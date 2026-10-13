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
import { BareButton } from '../../sonar-aligned';

export const SCMHighlight = styled.h6`
  color: var(--code-viewer-tooltip-highlight-text);

  font: ${cssVar('typography-text-default-semi-bold')};
  text-align: right;
  min-width: 6rem;
  margin-right: ${cssVar('dimension-space-200', '1rem')};
  margin-top: ${cssVar('dimension-space-50', '0.25rem')};
  margin-bottom: ${cssVar('dimension-space-50', '0.25rem')};
`;

export const LineSCMStyledDiv = styled.div`
  outline: none;

  padding-right: ${cssVar('dimension-space-100', '0.5rem')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  white-space: nowrap;
  cursor: pointer;
  height: 100%;
  width: 100%;

  &:hover {
    color: ${cssVar('color-text-strong')};
  }
`;

export const DuplicationHighlight = styled.h6`
  color: var(--code-viewer-tooltip-highlight-text);

  margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};
  font-weight: ${cssVar('font-weight-semi-bold')};
`;

export const LineStyled = styled.tr`
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: var(--columns);
  align-items: center;

  font: ${cssVar('typography-code-default')};
`;
LineStyled.displayName = 'LineStyled';

export const LineMeta = styled.td`
  color: ${cssVar('color-text-subtle')};
  background-color: var(--line-background);
  outline: none;

  height: 100%;
  width: 100%;
  box-sizing: border-box;
  user-select: none;

  ${LineStyled}:hover & {
    background-color: var(--code-viewer-line-background-hover);
  }
`;

export const LineCodePreFormatted = styled.pre`
  position: relative;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 4;
`;

export const LineCodeLayers = styled.td`
  position: relative;
  display: grid;
  height: 100%;
  background-color: var(--line-background);
  border-left: 1px solid var(--code-viewer-line-border);

  ${LineStyled}:hover & {
    background-color: var(--code-viewer-line-background-hover);
  }
`;

export const UnderlineLabels = styled.div<{ transparentBackground?: boolean }>`
  position: absolute;
  display: flex;
  gap: ${cssVar('dimension-space-50', '0.25rem')};
  padding-left: ${cssVar('dimension-space-50', '0.25rem')};
  padding-right: ${cssVar('dimension-space-50', '0.25rem')};
  right: 0;

  height: 1.125rem;
  margin-top: -1.125rem;
  background-color: ${({ transparentBackground }) =>
    transparentBackground ? 'transparent' : 'var(--code-viewer-line-background)'};
`;

export const UnderlineLabel = styled.span`
  border-top-left-radius: ${cssVar('border-radius-200', '0.25rem')};
  border-top-right-radius: ${cssVar('border-radius-200', '0.25rem')};
  padding-left: ${cssVar('dimension-space-50', '0.25rem')};
  padding-right: ${cssVar('dimension-space-50', '0.25rem')};
`;

export const NewCodeUnderlineLabel = styled(UnderlineLabel)`
  color: var(--code-viewer-new-code-underline-text);
  background-color: var(--code-viewer-new-code-underline-background);
`;

export const CoveredUnderlineLabel = styled(UnderlineLabel)`
  color: var(--code-viewer-covered-underline-text);
  background-color: var(--code-viewer-covered-underline-background);
`;

export const UncoveredUnderlineLabel = styled(UnderlineLabel)`
  color: var(--code-viewer-uncovered-underline-text);
  background-color: var(--code-viewer-uncovered-underline-background);
`;

export const LineCodeEllipsisStyled = styled(BareButton)`
  display: flex;
  align-items: center;
  gap: ${cssVar('dimension-space-100', '0.5rem')};
  padding-left: ${cssVar('dimension-space-100', '0.5rem')};
  padding-right: ${cssVar('dimension-space-100', '0.5rem')};
  padding-top: ${cssVar('dimension-space-50', '0.25rem')};
  padding-bottom: ${cssVar('dimension-space-50', '0.25rem')};
  font: ${cssVar('typography-code-default')};
  width: 100%;
  box-sizing: border-box;

  border-top: 1px solid var(--code-viewer-line-border);
  border-bottom: 1px solid var(--code-viewer-line-border);

  color: ${cssVar('color-text-subtle')};
  background-color: var(--code-viewer-ellipsis-background);

  &:hover {
    background-color: var(--code-viewer-ellipsis-background-hover);
  }
`;
