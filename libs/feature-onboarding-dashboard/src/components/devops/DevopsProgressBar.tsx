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
import { clampPercent } from '../dashboardSeverity';

interface Props {
  ariaLabel: string;
  /** Bar fill color (brand color per platform). */
  color: string;
  value: number;
}

export function DevopsProgressBar({ ariaLabel, color, value }: Readonly<Props>) {
  const clamped = clampPercent(value);

  return (
    <Track>
      <Fill
        aria-label={ariaLabel}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(clamped)}
        role="progressbar"
        style={{ backgroundColor: color, width: `${clamped}%` }}
      />
    </Track>
  );
}

const Track = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 9999px;
  background-color: ${cssVar('color-background-neutral-subtle-default')};
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  border-radius: 9999px;
  transition: width 0.2s ease-in-out;
`;
