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

import type { RuleMetadataByKey } from '../types/widget-common';

/**
 * Map a `rules/search` response into rule display metadata keyed by rule key, e.g.
 * `{ 'java:S1234': { langName: 'Java', name: 'Rule one' } }`. Used to label portfolio dashboard
 * rule rows/segments with human-readable names instead of raw rule keys.
 */
export function searchRulesResponseToRuleMetadata(
  response: { rules?: ReadonlyArray<{ key: string; langName?: string; name: string }> } | undefined,
): RuleMetadataByKey {
  if (!response?.rules?.length) {
    return {};
  }

  return Object.fromEntries(
    response.rules.map((rule) => [rule.key, { langName: rule.langName, name: rule.name }]),
  );
}
