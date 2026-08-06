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

import { isEmpty } from 'lodash';
import { SoftwareImpactSeverity } from '../types/clean-code-taxonomy';
import { RawQuery } from '../types/router';
import { parseAsArray, parseAsString } from './query';

export function parseSeverities<P extends string>(
  query: RawQuery,
  key: P extends SoftwareImpactSeverity ? 'impactSeverities' : 'severities',
  activeKey: P extends SoftwareImpactSeverity ? 'active_impactSeverities' : 'active_severities',
) {
  const hasActiveProfileFilter = Boolean(query.activation === 'true' && query.qprofile);
  const keyValue = query[key] as string | undefined;
  const activeKeyValue = query[activeKey] as string | undefined;

  if (hasActiveProfileFilter) {
    return {
      [key]: [],
      [activeKey]: parseAsArray<P>(
        !isEmpty(keyValue) && isEmpty(activeKeyValue) ? keyValue : activeKeyValue,
        parseAsString,
      ),
    } as {
      [K in typeof key | typeof activeKey]: P[];
    };
  }

  return {
    [activeKey]: [],
    [key]: parseAsArray<P>(
      !isEmpty(activeKeyValue) && isEmpty(keyValue) ? activeKeyValue : keyValue,
      parseAsString,
    ),
  } as {
    [K in typeof key | typeof activeKey]: P[];
  };
}
