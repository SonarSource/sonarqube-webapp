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
import { ClipboardButton } from '../clipboard';

export const CodeSnippetFrame = styled.div`
  background-color: ${cssVar('color-code-background-default')};
  border: ${cssVar('border-width-default')} solid ${cssVar('color-code-border-default')};
  border-radius: ${cssVar('border-radius-400', '0.5rem')};
  margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};
  margin-top: ${cssVar('dimension-space-100', '0.5rem')};
  padding-block: ${cssVar('dimension-space-300')};
  padding-left: ${cssVar('dimension-space-300')};
  position: relative;

  &.code-snippet-with-copy {
    align-items: start;
    column-gap: ${cssVar('dimension-space-200')};
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    padding-right: ${cssVar('dimension-space-300')};

    &.code-snippet-highlighted-oneline {
      align-items: center;
    }

    > .hljs {
      grid-column: 1;
      grid-row: 1;
      min-width: 0;

      &:not(.code-wrap) {
        white-space: pre;
      }
    }
  }

  &.code-snippet-simple-oneline {
    border-radius: ${cssVar('border-radius-200', '0.25rem')};
    margin-bottom: 0;
    margin-top: 0;
    padding: 0;
  }
`;

export const CodeSnippetCopyButton = styled(ClipboardButton)`
  font: ${cssVar('typography-text-default-regular')};
  grid-column: 2;
  grid-row: 1;
  user-select: none;
`;
