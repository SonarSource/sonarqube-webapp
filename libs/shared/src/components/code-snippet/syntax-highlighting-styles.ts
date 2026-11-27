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

import { css } from '@emotion/react';
import { cssVar } from '@sonarsource/echoes-react';

export const syntaxHighlightingStyles = css`
  &.code-wrap {
    display: block;
    padding-block: ${cssVar('dimension-space-50', '0.25rem')};
    white-space: pre-wrap;
    word-break: break-all;

    &.wrap-words {
      overflow-wrap: break-word;
      word-break: normal;
    }

    &.simple-one-line,
    .code-snippet-simple-oneline & {
      display: inline;
      padding-block: 0;
    }
  }

  &.simple-one-line,
  .code-snippet-simple-oneline & {
    min-height: ${cssVar('dimension-height-500', '1.25rem')};
    padding-block: 0;
    padding-inline: ${cssVar('dimension-space-50', '0.25rem')};
  }

  code {
    background: ${cssVar('color-code-background-default')};
    color: ${cssVar('color-code-text-default')};
    font: ${cssVar('typography-code-default')};

    &.hljs {
      padding: unset;
    }
  }

  .hljs-meta,
  .hljs-variable {
    color: ${cssVar('color-code-text-default')};
  }

  .hljs-doctag,
  .hljs-title,
  .hljs-title.class_,
  .hljs-title.function_ {
    color: ${cssVar('color-code-text-annotation')};
  }

  .hljs-comment {
    color: ${cssVar('color-code-text-comment')};
    font: ${cssVar('typography-code-comment')};
  }

  .hljs-keyword,
  .hljs-tag,
  .hljs-type {
    color: ${cssVar('color-code-text-keyword')};
    font: ${cssVar('typography-code-highlight')};
  }

  .hljs-literal,
  .hljs-number {
    color: ${cssVar('color-code-text-constant')};
  }

  .hljs-string {
    color: ${cssVar('color-code-text-string')};
  }

  .hljs-meta .hljs-keyword {
    color: ${cssVar('color-code-text-preprocessing-directive')};
  }

  .sonar-underline {
    position: relative;
    text-decoration: underline var(--code-viewer-issue-squiggle);
    text-decoration: underline var(--code-viewer-issue-squiggle) wavy;
    text-decoration-skip-ink: none;
    text-decoration-thickness: 2px;
  }

  mark {
    background-color: ${cssVar('color-code-background-highlight')};
    border-radius: ${cssVar('border-radius-200', '0.25rem')};
    color: ${cssVar('color-code-text-highlight')};
    font-weight: ${cssVar('font-weight-regular')};
    padding: ${cssVar('dimension-space-50', '0.25rem')};
  }
`;
