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

import { isNil, mapValues, omitBy } from 'lodash';
import { createSearchParams, URLSearchParamsInit } from 'react-router-dom';
import { RawQuery } from '../types/router';

export function cleanQuery(query: RawQuery): RawQuery {
  return omitBy(query, isNil);
}

export function parseAsString<T extends string>(value: string | undefined | null): T {
  return (value ?? '') as T;
}

export function parseAsArray<T>(value: string | undefined, itemParser: (x: string) => T): T[] {
  return value ? value.split(',').map(itemParser) : [];
}

export function queryToSearchString(query: RawQuery | URLSearchParamsInit = {}) {
  let filteredQuery = query;

  if (typeof query !== 'string' && !Array.isArray(query) && !(query instanceof URLSearchParams)) {
    filteredQuery = cleanQuery(query);
    mapValues(filteredQuery, (value) => (value as string).toString());
    filteredQuery = omitBy(filteredQuery, (value: string) => value.length === 0);
  }

  const queryString = createSearchParams(filteredQuery).toString();

  return queryString ? `?${queryString}` : undefined;
}

export function filterQueryToSearchString(
  query: RawQuery | URLSearchParamsInit,
  filter: string[] | ((key: string) => boolean),
) {
  const searchParams = createSearchParams(query);
  const filteredParams = Array.from(searchParams.entries()).filter(([key]) => {
    if (Array.isArray(filter)) {
      return filter.includes(key);
    }
    return filter(key);
  });

  return queryToSearchString(filteredParams);
}
