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

export const SubnavigationSubheading = styled.h3`
  display: flex;
  box-sizing: border-box;
  font: ${cssVar('typography-text-default-regular')};
  padding-left: ${cssVar('dimension-space-200', '1rem')};
  padding-right: ${cssVar('dimension-space-200', '1rem')};
  padding-bottom: ${cssVar('dimension-space-100', '0.5rem')};
  padding-top: ${cssVar('dimension-space-300', '1.5rem')};
  width: 100%;

  color: ${cssVar('color-text-subtle')};
  background-color: ${cssVar('color-background-neutral-subtle-default')};
`;
SubnavigationSubheading.displayName = 'SubnavigationSubheading';
