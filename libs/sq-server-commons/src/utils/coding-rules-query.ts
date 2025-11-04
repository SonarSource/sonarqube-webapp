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
import {
  CodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
} from '~shared/types/clean-code-taxonomy';
import { RawQuery } from '~shared/types/router';
import { RuleActivationAdvanced, RuleInheritance } from '~shared/types/rules';
import {
  cleanQuery,
  parseAsArray,
  parseAsDate,
  parseAsOptionalBoolean,
  parseAsOptionalString,
  parseAsString,
  queriesEqual,
  serializeDateShort,
  serializeOptionalBoolean,
  serializeString,
  serializeStringArray,
} from '../helpers/query';
import { CodingRulesQuery } from '../types/coding-rules';

export type FacetKey = keyof CodingRulesQuery;

export interface Facet {
  [value: string]: number;
}

export type Facets = { [F in FacetKey]?: Facet };

export type OpenFacets = Record<string, boolean>;

export interface Actives {
  [rule: string]: {
    [profile: string]: RuleActivationAdvanced;
  };
}

export function parseQuery(query: RawQuery): CodingRulesQuery {
  return {
    activation: parseAsOptionalBoolean(query.activation),
    availableSince: parseAsDate(query.available_since),
    cleanCodeAttributeCategories: parseAsArray<CodeAttributeCategory>(
      query.cleanCodeAttributeCategories,
      parseAsString,
    ),
    compareToProfile: parseAsOptionalString(query.compareToProfile),
    cwe: parseAsArray(query.cwe, parseAsString),
    impactSoftwareQualities: parseAsArray<SoftwareQuality>(
      query.impactSoftwareQualities,
      parseAsString,
    ),
    inheritance: parseAsInheritance(query.inheritance),
    languages: parseAsArray(query.languages, parseAsString),
    'owaspMobileTop10-2024': parseAsArray(query['owaspMobileTop10-2024'], parseAsString),
    'owaspMobileTop10-2024Open': parseAsOptionalBoolean(query['owaspMobileTop10-2024Open']),
    'owaspMobileTop10-2024Stats': parseAsOptionalBoolean(query['owaspMobileTop10-2024Stats']),
    owaspTop10: parseAsArray(query.owaspTop10, parseAsString),
    'owaspTop10-2021': parseAsArray(query['owaspTop10-2021'], parseAsString),
    profile: parseAsOptionalString(query.qprofile),
    repositories: parseAsArray(query.repositories, parseAsString),
    ruleKey: parseAsOptionalString(query.rule_key),
    searchQuery: parseAsOptionalString(query.q),
    sonarsourceSecurity: parseAsArray(query.sonarsourceSecurity, parseAsString),
    statuses: parseAsArray(query.statuses, parseAsString),
    tags: parseAsArray(query.tags, parseAsString),
    template: parseAsOptionalBoolean(query.is_template),
    types: parseAsArray(query.types, parseAsString),
    prioritizedRule: parseAsOptionalBoolean(query.prioritizedRule),
    ...parseSeverities(query, 'severities', 'active_severities'),
    ...parseSeverities<SoftwareImpactSeverity>(
      query,
      'impactSeverities',
      'active_impactSeverities',
    ),
  };
}

export function serializeQuery(query: CodingRulesQuery): RawQuery {
  return cleanQuery({
    activation: serializeOptionalBoolean(query.activation),
    active_severities: serializeStringArray(query.active_severities),
    active_impactSeverities: serializeStringArray(query.active_impactSeverities),
    available_since: serializeDateShort(query.availableSince),
    cleanCodeAttributeCategories: serializeStringArray(query.cleanCodeAttributeCategories),
    compareToProfile: serializeString(query.compareToProfile),
    cwe: serializeStringArray(query.cwe),
    inheritance: serializeInheritance(query.inheritance),
    impactSeverities: serializeStringArray(query.impactSeverities),
    impactSoftwareQualities: serializeStringArray(query.impactSoftwareQualities),
    is_template: serializeOptionalBoolean(query.template),
    languages: serializeStringArray(query.languages),
    'owaspMobileTop10-2024': serializeStringArray(query['owaspMobileTop10-2024']),
    owaspTop10: serializeStringArray(query.owaspTop10),
    'owaspTop10-2021': serializeStringArray(query['owaspTop10-2021']),
    q: serializeString(query.searchQuery),
    qprofile: serializeString(query.profile),
    repositories: serializeStringArray(query.repositories),
    rule_key: serializeString(query.ruleKey),
    severities: serializeStringArray(query.severities),
    sonarsourceSecurity: serializeStringArray(query.sonarsourceSecurity),
    statuses: serializeStringArray(query.statuses),
    tags: serializeStringArray(query.tags),
    types: serializeStringArray(query.types),
    prioritizedRule: serializeOptionalBoolean(query.prioritizedRule),
  });
}

function parseSeverities<P extends string>(
  query: RawQuery,
  key: P extends SoftwareImpactSeverity ? 'impactSeverities' : 'severities',
  activeKey: P extends SoftwareImpactSeverity ? 'active_impactSeverities' : 'active_severities',
) {
  const hasActiveProfileFilter = Boolean(query.activation === 'true' && query.qprofile);

  if (hasActiveProfileFilter) {
    return {
      [key]: [],
      [activeKey]: parseAsArray<P>(
        !isEmpty(query[key]) && isEmpty(query[activeKey]) ? query[key] : query[activeKey],
        parseAsString,
      ),
    } as {
      [K in typeof key | typeof activeKey]: P[];
    };
  }

  return {
    [activeKey]: [],
    [key]: parseAsArray<P>(
      !isEmpty(query[activeKey]) && isEmpty(query[key]) ? query[activeKey] : query[key],
      parseAsString,
    ),
  } as {
    [K in typeof key | typeof activeKey]: P[];
  };
}

export function areQueriesEqual(a: RawQuery, b: RawQuery) {
  return queriesEqual(parseQuery(a), parseQuery(b));
}

export function shouldRequestFacet(facet: string): facet is FacetKey {
  const facetsToRequest = [
    'cwe',
    'languages',
    'owaspTop10',
    'owaspMobileTop10-2024',
    'owaspTop10-2021',
    'repositories',
    'severities',
    'active_severities',
    'active_impactSeverities',
    'sonarsourceSecurity',
    'standard',
    'statuses',
    'tags',
    'types',
    'cleanCodeAttributeCategories',
    'impactSoftwareQualities',
    'impactSeverities',
  ];
  return facetsToRequest.includes(facet);
}

export function getOpen(query: RawQuery) {
  return query.open;
}

export function getSelected(query: RawQuery) {
  return query.selected;
}

export function hasRuleKey(query: RawQuery) {
  return Boolean(query.rule_key);
}

function parseAsInheritance(value?: string): RuleInheritance | undefined {
  if (value === 'INHERITED' || value === 'NONE' || value === 'OVERRIDES') {
    return value;
  }
  return undefined;
}

function serializeInheritance(value: RuleInheritance | undefined): string | undefined {
  return value;
}
