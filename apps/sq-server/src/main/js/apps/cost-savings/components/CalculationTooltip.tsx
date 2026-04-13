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

import { Tooltip } from '@sonarsource/echoes-react';
import type { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  content: ReactNode;
}

function CalculationTooltip({ content, children }: Props) {
  return (
    <Tooltip content={content}>
      {children ?? (
        <span
          className="sw-inline-flex sw-items-center sw-justify-center sw-rounded-full sw-cursor-help sw-ml-1 sw-align-middle sw-font-semibold"
          style={{
            color: '#126ED3',
            backgroundColor: '#EEF4FC',
            fontSize: '10px',
            height: '16px',
            lineHeight: '16px',
            width: '16px',
          }}
        >
          i
        </span>
      )}
    </Tooltip>
  );
}

export { CalculationTooltip };
