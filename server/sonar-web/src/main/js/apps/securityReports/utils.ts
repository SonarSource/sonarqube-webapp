/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
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
export function renderOwaspTop10Category(
  standards: T.Standards,
  category: string,
  withPrefix = false
): string {
  const record = standards.owaspTop10[category];
  if (!record) {
    return addPrefix(category.toUpperCase(), 'OWASP', withPrefix);
  } else if (category === 'unknown') {
    return record.title;
  } else {
    return addPrefix(`${category.toUpperCase()} - ${record.title}`, 'OWASP', withPrefix);
  }
}

export function renderCWECategory(standards: T.Standards, category: string): string {
  const record = standards.cwe[category];
  if (!record) {
    return `CWE-${category}`;
  } else if (category === 'unknown') {
    return record.title;
  } else {
    return `CWE-${category} - ${record.title}`;
  }
}

export function renderSansTop25Category(
  standards: T.Standards,
  category: string,
  withPrefix = false
): string {
  const record = standards.sansTop25[category];
  return addPrefix(record ? record.title : category, 'SANS', withPrefix);
}

export function renderSonarSourceSecurityCategory(
  standards: T.Standards,
  category: string,
  withPrefix = false
): string {
  const record = standards.sonarsourceSecurity[category];
  return addPrefix(record ? record.title : category, 'SONAR', withPrefix);
}

function addPrefix(title: string, prefix: string, withPrefix: boolean) {
  return withPrefix ? `${prefix} ${title}` : title;
}

const TYPES_MAP: T.Dict<T.StandardType> = {
  owasp_top_10: 'owaspTop10',
  sans_top_25: 'sansTop25',
  sonarsource_security: 'sonarsourceSecurity'
};

export function getType(type: string): T.StandardType {
  return TYPES_MAP[type] || 'sonarsourceSecurity';
}
