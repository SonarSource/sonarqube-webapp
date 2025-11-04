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

import { isDefined } from '~shared/helpers/types';
import { MetricKey } from '~shared/types/metrics';
import { ProjectKeyValidationResult } from '../types/component';
import { ProjectsQuery } from '../types/projects';
import { PROJECT_KEY_MAX_LEN } from './constants';
import { RequestData } from './request';

// This is the regex used on the backend:
//   [\p{Alnum}\-_.:]*[\p{Alpha}\-_.:]+[\p{Alnum}\-_.:]*
// See sonar-core/src/main/java/org/sonar/core/component/ComponentKeys.java
export const PROJECT_KEY_REGEX = /^[\w\-.:]*[a-z\-_.:]+[\w\-.:]*$/i;
export const PROJECT_KEY_INVALID_CHARACTERS = /[^\w\-:.]+/gi;

export function validateProjectKey(projectKey: string): ProjectKeyValidationResult {
  if (projectKey.length === 0) {
    return ProjectKeyValidationResult.Empty;
  } else if (projectKey.length > PROJECT_KEY_MAX_LEN) {
    return ProjectKeyValidationResult.TooLong;
  } else if (PROJECT_KEY_REGEX.test(projectKey)) {
    return ProjectKeyValidationResult.Valid;
  } else if (/^[0-9]+$/.test(projectKey)) {
    return ProjectKeyValidationResult.OnlyDigits;
  }
  return ProjectKeyValidationResult.InvalidChar;
}

export const propertyToMetricMapLegacy: Record<string, string | undefined> = {
  analysis_date: 'analysisDate',
  reliability: 'reliability_rating',
  new_reliability: 'new_reliability_rating',
  security: 'security_rating',
  new_security: 'new_security_rating',
  security_review: 'security_review_rating',
  new_security_review: 'new_security_review_rating',
  maintainability: 'sqale_rating',
  new_maintainability: 'new_maintainability_rating',
  coverage: 'coverage',
  new_coverage: 'new_coverage',
  duplications: 'duplicated_lines_density',
  new_duplications: 'new_duplicated_lines_density',
  size: 'ncloc',
  new_lines: 'new_lines',
  gate: 'alert_status',
  languages: 'languages',
  tags: 'tags',
  search: 'query',
  qualifier: 'qualifier',
  creation_date: 'creationDate',
};

export const propertyToMetricMap: Record<string, string | undefined> = {
  ...propertyToMetricMapLegacy,
  reliability: 'software_quality_reliability_rating',
  new_reliability: 'new_software_quality_reliability_rating',
  security: 'software_quality_security_rating',
  new_security: 'new_software_quality_security_rating',
  maintainability: 'software_quality_maintainability_rating',
  new_maintainability: 'new_software_quality_maintainability_rating',
};

export function convertToFilter(
  query: ProjectsQuery,
  isFavorite: boolean,
  isStandardMode: boolean,
): string {
  const conditions: string[] = [];

  if (isFavorite) {
    conditions.push('isFavorite');
  }

  if (isDefined(query.gate)) {
    conditions.push(`${mapPropertyToMetric('gate', isStandardMode)}=${query.gate}`);
  }

  [MetricKey.coverage, MetricKey.new_coverage].forEach((property) => {
    pushMetricToArray(query, property, conditions, convertCoverage, isStandardMode);
  });

  ['duplications', 'new_duplications'].forEach((property) => {
    pushMetricToArray(query, property, conditions, convertDuplications, isStandardMode);
  });

  ['size', MetricKey.new_lines].forEach((property) => {
    pushMetricToArray(query, property, conditions, convertSize, isStandardMode);
  });

  [
    'reliability',
    'security',
    'security_review',
    'maintainability',
    'new_reliability',
    'new_security',
    'new_security_review',
    'new_maintainability',
  ].forEach((property) => {
    pushMetricToArray(query, property, conditions, convertIssuesRating, isStandardMode);
  });

  ['languages', 'tags', 'qualifier'].forEach((property) => {
    pushMetricToArray(query, property, conditions, convertArrayMetric, isStandardMode);
  });

  if (isDefined(query.search)) {
    conditions.push(`${mapPropertyToMetric('search', isStandardMode)} = "${query.search}"`);
  }

  return conditions.join(' and ');
}

const viewParems = ['sort', 'view'];

export function hasFilterParams(query: ProjectsQuery) {
  return Object.keys(query)
    .filter((key) => !viewParems.includes(key))
    .some((key) => query[key] !== undefined);
}

export function hasViewParams(query: ProjectsQuery) {
  return Object.keys(query)
    .filter((key) => viewParems.includes(key))
    .some((key) => query[key] !== undefined);
}

function convertIssuesRating(metric: string, rating: number): string {
  if (rating > 1 && rating < 5) {
    return `${metric} >= ${rating}`;
  }

  return `${metric} = ${rating}`;
}

function convertCoverage(metric: string, coverage: number): string {
  switch (coverage) {
    case 1:
      return metric + ' >= 80';
    case 2:
      return metric + ' < 80';
    case 3:
      return metric + ' < 70';
    case 4:
      return metric + ' < 50';
    case 5:
      return metric + ' < 30';
    case 6:
      return metric + '= NO_DATA';
    default:
      return '';
  }
}

function convertDuplications(metric: string, duplications: number): string {
  switch (duplications) {
    case 1:
      return metric + ' < 3';
    case 2:
      return metric + ' >= 3';
    case 3:
      return metric + ' >= 5';
    case 4:
      return metric + ' >= 10';
    case 5:
      return metric + ' >= 20';
    case 6:
      return metric + '= NO_DATA';
    default:
      return '';
  }
}

function convertSize(metric: string, size: number): string {
  switch (size) {
    case 1:
      return metric + ' < 1000';
    case 2:
      return metric + ' >= 1000';
    case 3:
      return metric + ' >= 10000';
    case 4:
      return metric + ' >= 100000';
    case 5:
      return metric + ' >= 500000';
    default:
      return '';
  }
}

function mapPropertyToMetric(property?: string, isStandardMode = false): string | undefined {
  if (property === undefined) {
    return;
  }
  return (isStandardMode ? propertyToMetricMapLegacy : propertyToMetricMap)[property];
}

function pushMetricToArray(
  query: ProjectsQuery,
  property: string,
  conditionsArray: string[],
  convertFunction: (metric: string, value: ProjectsQuery[string]) => string,
  isStandardMode: boolean,
): void {
  const metric = mapPropertyToMetric(property, isStandardMode);
  if (query[property] !== undefined && metric !== undefined) {
    conditionsArray.push(convertFunction(metric, query[property]));
  }
}

function convertArrayMetric(metric: string, items: string | string[]): string {
  if (!Array.isArray(items) || items.length < 2) {
    return `${metric} = ${items.toString()}`;
  }

  return `${metric} IN (${items.join(', ')})`;
}

export function convertToSorting(
  { sort }: ProjectsQuery,
  isStandardMode: boolean,
): { asc?: boolean; s?: string } {
  if (sort?.startsWith('-')) {
    return {
      s: (isStandardMode ? propertyToMetricMapLegacy : propertyToMetricMap)[sort.substring(1)],
      asc: false,
    };
  }

  return {
    s: (isStandardMode ? propertyToMetricMapLegacy : propertyToMetricMap)[sort ?? ''],
  };
}

export function convertToQueryData(
  query: ProjectsQuery,
  isFavorite: boolean,
  isStandardMode: boolean,
  defaultData = {},
) {
  const data: RequestData = { ...defaultData };
  const filter = convertToFilter(query, isFavorite, isStandardMode);
  const sort = convertToSorting(query, isStandardMode);

  if (filter) {
    data.filter = filter;
  }

  if (sort.s) {
    data.s = sort.s;
  }

  if (sort.asc !== undefined) {
    data.asc = sort.asc;
  }

  return data;
}

export const LEGACY_FACETS = [
  MetricKey.reliability_rating,
  MetricKey.security_rating,
  MetricKey.security_review_rating,
  MetricKey.sqale_rating,
  MetricKey.coverage,
  MetricKey.duplicated_lines_density,
  MetricKey.ncloc,
  MetricKey.alert_status,
  'languages',
  'tags',
  'qualifier',
];

export const FACETS = [
  MetricKey.software_quality_reliability_rating,
  MetricKey.software_quality_security_rating,
  MetricKey.software_quality_maintainability_rating,
  MetricKey.security_review_rating,
  MetricKey.coverage,
  MetricKey.duplicated_lines_density,
  MetricKey.ncloc,
  MetricKey.alert_status,
  'languages',
  'tags',
  'qualifier',
];

export const LEGACY_LEAK_FACETS = [
  MetricKey.new_reliability_rating,
  MetricKey.new_security_rating,
  MetricKey.new_security_review_rating,
  MetricKey.new_maintainability_rating,
  MetricKey.new_coverage,
  MetricKey.new_duplicated_lines_density,
  MetricKey.new_lines,
  MetricKey.alert_status,
  'languages',
  'tags',
  'qualifier',
];

export const LEAK_FACETS = [
  MetricKey.new_software_quality_reliability_rating,
  MetricKey.new_software_quality_security_rating,
  MetricKey.new_software_quality_maintainability_rating,
  MetricKey.new_security_review_rating,
  MetricKey.new_coverage,
  MetricKey.new_duplicated_lines_density,
  MetricKey.new_lines,
  MetricKey.alert_status,
  'languages',
  'tags',
  'qualifier',
];

export function defineFacets(query: ProjectsQuery, isStandardMode: boolean): string[] {
  if (query.view === 'leak') {
    return isStandardMode ? LEGACY_LEAK_FACETS : LEAK_FACETS;
  }

  return isStandardMode ? LEGACY_FACETS : FACETS;
}
