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

import { Badge, BadgeProps } from '@sonarsource/echoes-react';
import classNames from 'classnames';

interface Props {
  method: string;
}

export default function RestMethodPill({ method }: Readonly<Props>) {
  const getMethodColor = (method: string): BadgeProps['variety'] => {
    switch (method) {
      case 'get':
        return 'success';
      case 'delete':
        return 'danger';
      case 'post':
        return 'info';
      case 'put':
        return 'highlight';
      case 'patch':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <Badge
      className={classNames('sw-self-center sw-inline-flex sw-justify-center sw-min-w-[50px]')}
      variety={getMethodColor(method)}
    >
      {method.toUpperCase()}
    </Badge>
  );
}
