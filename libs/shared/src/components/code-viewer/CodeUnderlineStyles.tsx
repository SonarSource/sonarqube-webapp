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

export const LineCodeLayer = styled.div`
  grid-row: 1;
  grid-column: 1;
`;

export const NewCodeUnderline = styled(LineCodeLayer)`
  background-color: ${cssVar('color-background-accent-weak-default')};
`;

export const CoveredUnderline = styled(LineCodeLayer)`
  background-color: ${cssVar('color-background-success-weak-default')};
`;

export const UncoveredUnderline = styled(LineCodeLayer)`
  background-color: ${cssVar('color-background-danger-weak-default')};
`;

export const PartiallyCoveredUnderline = styled(LineCodeLayer)`
  background-color: ${cssVar('color-background-warning-weak-default')};
`;

const UnderlineLabel = styled.span`
  border-top-left-radius: ${cssVar('border-radius-200')};
  border-top-right-radius: ${cssVar('border-radius-200')};

  padding-left: ${cssVar('dimension-space-50')};
  padding-right: ${cssVar('dimension-space-50')};
`;

export const NewCodeUnderlineLabel = styled(UnderlineLabel)`
  color: ${cssVar('color-background-selected-bold-pressed')};
  background-color: ${cssVar('color-background-accent-weak-default')};
`;

export const CoveredUnderlineLabel = styled(UnderlineLabel)`
  color: ${cssVar('color-background-success-active')};
  background-color: ${cssVar('color-background-success-weak-default')};
`;

export const UncoveredUnderlineLabel = styled(UnderlineLabel)`
  color: ${cssVar('color-text-danger')};
  background-color: ${cssVar('color-background-danger-weak-default')};
`;

export const PartiallyCoveredUnderlineLabel = styled(UnderlineLabel)`
  color: ${cssVar('color-text-warning')};
  background-color: ${cssVar('color-background-warning-weak-default')};
`;
