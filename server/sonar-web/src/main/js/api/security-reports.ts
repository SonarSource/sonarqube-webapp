/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import { SecurityHotspot } from '../app/types';
import { getJSON } from '../helpers/request';
import throwGlobalError from '../app/utils/throwGlobalError';

export function getSecurityHotspots(data: {
  project: string;
  standard: 'owaspTop10' | 'sansTop25' | 'cwe';
  includeDistribution?: boolean;
  branch?: string;
}): Promise<{ categories: Array<SecurityHotspot> }> {
  return getJSON('/api/security_reports/show', data)
    .then(data => {
      /* MOCK, must be removed after backend implementation */
      data.categories = data.categories.map((v: SecurityHotspot, index: number) => {
        v.activeRules = index;
        v.totalRules = 200;
        return v;
      });
      return data;
    })
    .catch(throwGlobalError);
}
