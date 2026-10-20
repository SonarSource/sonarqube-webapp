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
import { ButtonProps, DangerButtonSecondary } from '../sonar-aligned/components/buttons';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

const StyledFailedQGConditionLink = styled(DangerButtonSecondary)`
  font: ${cssVar('typography-text-default-regular')};
  height: 28px;
  padding-left: ${cssVar('dimension-space-100', '0.5rem')};
  padding-right: ${cssVar('dimension-space-50', '0.25rem')};
  padding-top: 0;
  padding-bottom: 0;
  border-radius: ${cssVar('border-radius-100', '0.125rem')};

  &:active,
  &:focus,
  &:focus-visible,
  &:focus-within,
  &:hover,
  &:visited {
    border-bottom-color: ${cssVar('color-border-danger-weak')};
  }
`;

export function FailedQGConditionLink({ children, ...props }: ButtonProps) {
  return (
    <StyledFailedQGConditionLink {...props}>
      {children}
      <ChevronRightIcon className="sw:ml-1 sw:-mr-1" />
    </StyledFailedQGConditionLink>
  );
}
