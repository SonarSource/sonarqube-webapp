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

/**
 * Display label for a rule row: `(language) name`, or just `name` when the language is unknown or
 * when `includeLanguage` is `false`. Falls back to the raw rule key when the name hasn't been
 * resolved (e.g. deleted/external rule).
 */
export function formatRuleDisplayLabel(
  ruleKey: string,
  rule: { langName?: string; name?: string } | undefined,
  { includeLanguage = true }: { includeLanguage?: boolean } = {},
): string {
  if (!rule?.name) {
    return ruleKey;
  }

  return includeLanguage && rule.langName ? `(${rule.langName}) ${rule.name}` : rule.name;
}
