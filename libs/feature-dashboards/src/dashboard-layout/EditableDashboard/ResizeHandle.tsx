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

const ResizeHandleSpan = styled.span({
  color: cssVar('color-icon-subtle'),
  cursor: 'nwse-resize',
  display: 'inline-flex',
  height: '14px',
  lineHeight: 0,
  width: '14px',
});

export function ResizeHandle() {
  return (
    <ResizeHandleSpan>
      <svg
        fill="none"
        height="14"
        viewBox="0 0 14 14"
        width="14"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1 11.1538L12.2 1M7.4 13L13 7.46154" stroke="currentColor" strokeLinecap="round" />
      </svg>
    </ResizeHandleSpan>
  );
}
