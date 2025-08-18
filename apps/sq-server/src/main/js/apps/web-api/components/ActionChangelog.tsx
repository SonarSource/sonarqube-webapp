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

import { Text } from '@sonarsource/echoes-react';
import { Badge } from '~design-system';
import { WebApi } from '~sq-server-commons/types/types';

interface Props {
  changelog: WebApi.Changelog[];
}

export default function ActionChangelog({ changelog }: Props) {
  return (
    <Text as="ul" className="sw-list-none sw-max-w-full sw-pl-0">
      {changelog.map((item, index) => (
        <li key={index}>
          <Badge className="sw-mr-2" variant="default">
            {item.version}
          </Badge>
          {item.description}
        </li>
      ))}
    </Text>
  );
}
