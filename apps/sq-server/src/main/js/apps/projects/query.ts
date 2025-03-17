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

import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { RawQuery } from '~sq-server-shared/sonar-aligned/types/router';
import { Level, ProjectsQuery } from '~sq-server-shared/types/projects';

export function parseUrlQuery(urlQuery: RawQuery): ProjectsQuery {
  return {
    gate: getAsLevel(urlQuery.gate),
    reliability: getAsNumericRating(urlQuery.reliability),
    new_reliability: getAsNumericRating(urlQuery.new_reliability),
    security: getAsNumericRating(urlQuery.security),
    new_security: getAsNumericRating(urlQuery.new_security),
    security_review: getAsNumericRating(urlQuery.security_review),
    new_security_review: getAsNumericRating(urlQuery.new_security_review),
    maintainability: getAsNumericRating(urlQuery.maintainability),
    new_maintainability: getAsNumericRating(urlQuery.new_maintainability),
    coverage: getAsNumericRating(urlQuery[MetricKey.coverage]),
    new_coverage: getAsNumericRating(urlQuery[MetricKey.new_coverage]),
    duplications: getAsNumericRating(urlQuery.duplications),
    new_duplications: getAsNumericRating(urlQuery.new_duplications),
    size: getAsNumericRating(urlQuery.size),
    new_lines: getAsNumericRating(urlQuery[MetricKey.new_lines]),
    languages: getAsStringArray(urlQuery.languages),
    tags: getAsStringArray(urlQuery.tags),
    qualifier: getAsQualifier(urlQuery.qualifier),
    search: getAsString(urlQuery.search),
    sort: getAsString(urlQuery.sort),
    view: getView(urlQuery.view),
  };
}

function getAsNumericRating(value: any): number | undefined {
  if (value === '' || value == null || isNaN(value)) {
    return undefined;
  }
  const num = Number(value);
  return num > 0 && num < 7 ? num : undefined;
}

function getAsLevel(value: any): Level | undefined {
  if (value === 'ERROR' || value === 'WARN' || value === 'OK') {
    return value;
  }
  return undefined;
}

function getAsString(value: any): string | undefined {
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  return value;
}

function getAsStringArray(value: any): string[] | undefined {
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  return value.split(',');
}

function getAsQualifier(value: string | undefined): ComponentQualifier | undefined {
  return value ? (value as ComponentQualifier) : undefined;
}

function getView(value: any): string | undefined {
  return typeof value !== 'string' || value === 'overall' ? undefined : value;
}
