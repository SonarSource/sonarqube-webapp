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
import tw from 'twin.macro';
import { BareButton } from '../../sonar-aligned';

export const SCMHighlight = styled.h6`
  color: var(--code-viewer-tooltip-highlight-text);

  ${tw`sw-typo-semibold`};
  ${tw`sw-text-right`};
  ${tw`sw-min-w-[6rem]`};
  ${tw`sw-mr-4`};
  ${tw`sw-my-1`};
`;

export const LineSCMStyledDiv = styled.div`
  outline: none;

  ${tw`sw-pr-2`}
  ${tw`sw-truncate`}
  ${tw`sw-whitespace-nowrap`}
  ${tw`sw-cursor-pointer`}
  ${tw`sw-w-full sw-h-full`}

  &:hover {
    color: ${cssVar('color-text-strong')};
  }
`;

export const DuplicationHighlight = styled.h6`
  color: var(--code-viewer-tooltip-highlight-text);

  ${tw`sw-mb-2 sw-font-semibold`};
`;

export const LineStyled = styled.tr`
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: var(--columns);
  align-items: center;

  ${tw`sw-code`}
`;
LineStyled.displayName = 'LineStyled';

export const LineMeta = styled.td`
  color: ${cssVar('color-text-subtle')};
  background-color: var(--line-background);
  outline: none;

  ${tw`sw-w-full sw-h-full`}
  ${tw`sw-box-border`}
  ${tw`sw-select-none`}

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
  ${tw`sw-absolute`}
  ${tw`sw-flex sw-gap-1`}
  ${tw`sw-px-1`}
  ${tw`sw-right-0`}


  height: 1.125rem;
  margin-top: -1.125rem;
  background-color: ${({ transparentBackground }) =>
    transparentBackground ? 'transparent' : 'var(--code-viewer-line-background)'};
`;

export const UnderlineLabel = styled.span`
  ${tw`sw-rounded-t-1`}
  ${tw`sw-px-1`}
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
  ${tw`sw-flex sw-items-center sw-gap-2`}
  ${tw`sw-px-2 sw-py-1`}
  ${tw`sw-code`}
  ${tw`sw-w-full`}
  ${tw`sw-box-border`}

  border-top: 1px solid var(--code-viewer-line-border);
  border-bottom: 1px solid var(--code-viewer-line-border);

  color: ${cssVar('color-text-subtle')};
  background-color: var(--code-viewer-ellipsis-background);

  &:hover {
    background-color: var(--code-viewer-ellipsis-background-hover);
  }
`;
