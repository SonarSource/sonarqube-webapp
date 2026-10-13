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

export const NumberedListItem = styled.li`
  counter-increment: li;
  margin-bottom: ${cssVar('dimension-space-200', '1rem')};
  margin-left: ${cssVar('dimension-space-50', '0.25rem')};

  &::before {
    width: 19px;
    height: 19px;
    color: ${cssVar('color-text-accent')};
    background-color: ${cssVar('color-background-accent-weak-default')};
    border-radius: 20px;
    content: counter(li);

    font: ${cssVar('typography-text-default-semi-bold')};
    padding: ${cssVar('dimension-space-50', '0.25rem')};
    margin-right: ${cssVar('dimension-space-150', '0.75rem')};
    display: inline-block;
    text-align: center;
  }
`;

NumberedListItem.displayName = 'NumberedListItem';
