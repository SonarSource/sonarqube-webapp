/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import classNames from 'classnames';
import { FlagMessage } from '~design-system';
import { HealthTypes } from '~sq-server-commons/types/types';

interface Props {
  className?: string;
  health: HealthTypes;
  healthCause: string;
}

export default function HealthCauseItem({ className, health, healthCause }: Readonly<Props>) {
  return (
    <FlagMessage
      className={classNames('-sw-my-2', className)}
      variant={health === HealthTypes.RED ? 'error' : 'warning'}
    >
      {healthCause}
    </FlagMessage>
  );
}
