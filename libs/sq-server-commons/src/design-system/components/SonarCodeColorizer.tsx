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

export const SonarCodeColorizer = styled.div`
  & pre {
    ${tw`sw-code`}

    color: ${cssVar('color-code-text-default')};
  }

  /* for example java annotations */
  & .a {
    color: ${cssVar('color-code-text-annotation')};
  }

  /* constants */
  & .c {
    ${tw`sw-code-highlight`}

    color: ${cssVar('color-code-text-constant')};
  }

  /* classic comment */
  & .cd {
    ${tw`sw-code-comment`}

    color: ${cssVar('color-code-text-comment')};
  }

  /* javadoc */
  & .j {
    ${tw`sw-code-comment`}

    color: ${cssVar('color-code-text-comment')};
  }

  /* C++ doc */
  & .cppd {
    ${tw`sw-code-comment`}

    color: ${cssVar('color-code-text-comment')};
  }

  /* keyword */
  & .k {
    ${tw`sw-code-highlight`}

    color: ${cssVar('color-code-text-keyword')};
  }

  /* string */
  & .s {
    color: ${cssVar('color-code-text-string')};
  }

  /* keyword light */
  & .h {
    color: ${cssVar('color-code-text-keyword-subtle')};
  }

  /* preprocessing directive */
  & .p {
    color: ${cssVar('color-code-text-preprocessing-directive')};
  }
`;
SonarCodeColorizer.displayName = 'SonarCodeColorizer';
