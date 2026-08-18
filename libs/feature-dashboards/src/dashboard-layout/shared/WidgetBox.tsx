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
import { ReactNode } from 'react';
import { GRID_CONSTANTS } from '../ReadonlyDashboard/constants';

const WidgetBoxWrapper = styled.div`
  background-color: ${cssVar('color-surface-default')};
  border-radius: ${GRID_CONSTANTS.BORDER_RADIUS};
  padding: ${GRID_CONSTANTS.PADDING};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

interface WidgetBoxProps {
  children: ReactNode;
  className?: string;
  'data-widget-key'?: string;
  style?: React.CSSProperties;
}

export function WidgetBox({ children, className, style, ...rest }: Readonly<WidgetBoxProps>) {
  return (
    <WidgetBoxWrapper className={className} style={style} {...rest}>
      {children}
    </WidgetBoxWrapper>
  );
}
