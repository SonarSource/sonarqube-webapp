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
import { BareButton } from '../../sonar-aligned/components/buttons';

export const IssueIndicatorButton = styled(BareButton)`
  color: ${cssVar('color-text-subtle')};
  text-decoration: none;

  white-space: nowrap;
`;

export const DuplicationBlock = styled(BareButton)`
  background-color: var(--code-viewer-duplication-marker-background);
  outline: none;

  display: block;
  height: 100%;
  width: ${cssVar('dimension-width-50', '0.25rem')};
  margin-left: ${cssVar('dimension-space-25', '0.125rem')};
  cursor: pointer;
`;

export const LineSCMStyled = styled(BareButton)`
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
    color: ${cssVar('color-text-subtle')};
  }
`;
