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

import { cssVar } from '@sonarsource/echoes-react';
import { CustomIcon, IconProps } from './Icon';

export function SeverityBlockerIcon({ fill, ...iconProps }: IconProps) {
  return (
    <CustomIcon {...iconProps}>
      <circle
        cx="8"
        cy="8"
        fill={fill ?? cssVar('severity-badge-colors-background-severity-blocker-prefix-default')}
        r="7"
      />
      <rect fill={cssVar('color-icon-on-color')} height="1.5" rx="0.75" width="6" x="5" y="7.2" />
    </CustomIcon>
  );
}
