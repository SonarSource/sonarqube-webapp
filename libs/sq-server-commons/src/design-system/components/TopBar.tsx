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
import { LAYOUT_VIEWPORT_MIN_WIDTH } from '../helpers';

const TopBarNewLayoutCompatible = styled.nav`
  padding-left: ${cssVar('dimension-space-300', '1.5rem')};
  padding-right: ${cssVar('dimension-space-300', '1.5rem')};
  padding-top: ${cssVar('dimension-space-200', '1rem')};
  box-sizing: border-box;
  width: 100%;
  font-family: ${cssVar('font-family-sans')};
  font-size: 0.875rem;
  line-height: 1.25rem;

  background-color: ${cssVar('color-surface-default')};
  color: ${cssVar('color-text-default')};
  border-bottom: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
`;

export const TopBar = styled(TopBarNewLayoutCompatible)`
  min-width: ${LAYOUT_VIEWPORT_MIN_WIDTH}px;
`;
