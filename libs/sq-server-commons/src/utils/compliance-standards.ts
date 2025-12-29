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

import { StandardsInformation, StandardsInformationKey } from '~shared/types/security';
import { STANDARDS_REGISTRY } from './compliance-standards-registry';

// Re-export to keep everything compliance standards related in one place
export { STANDARDS_REGISTRY } from './compliance-standards-registry';

// Derived from STANDARDS_REGISTRY - maps frontend key to backend key
export const COMPLIANCE_STANDARDS_BACKEND_KEYS = Object.fromEntries(
  STANDARDS_REGISTRY.map((s) => [s.key, s.backendKey]),
) as Record<StandardsInformationKey, string>;

// Derived from STANDARDS_REGISTRY - maps backend key to frontend key
export const BACKEND_KEY_TO_FRONTEND: Record<string, string> = Object.fromEntries(
  STANDARDS_REGISTRY.map((s) => [s.backendKey, s.key]),
);

// Derived from STANDARDS_REGISTRY - maps frontend key to query property name
const FRONTEND_KEY_TO_QUERY_PROP: Record<string, string> = Object.fromEntries(
  STANDARDS_REGISTRY.map((s) => [s.key, s.queryProp]),
);

// All standards that use complianceStandards
const COMPLIANCE_STANDARDS = Object.keys(FRONTEND_KEY_TO_QUERY_PROP);

export function buildComplianceStandards(query: object): string | undefined {
  const standardGroups: string[] = [];
  const q = query as Record<string, unknown>;

  for (const [frontendKey, queryProp] of Object.entries(FRONTEND_KEY_TO_QUERY_PROP)) {
    const values = q[queryProp] as string[] | undefined;
    if (values?.length) {
      const backendKey =
        COMPLIANCE_STANDARDS_BACKEND_KEYS[
          frontendKey as keyof typeof COMPLIANCE_STANDARDS_BACKEND_KEYS
        ];
      standardGroups.push(`${backendKey}=${values.join(',')}`);
    }
  }

  return standardGroups.length > 0 ? standardGroups.join('&') : undefined;
}

export function mapFacetToBackendName(facet: string): string {
  // All compliance standards use the complianceStandards facet
  if (COMPLIANCE_STANDARDS.includes(facet)) {
    return 'complianceStandards';
  }
  return facet;
}

function processComplianceStandardGroup(group: string, result: Record<string, string[]>): void {
  const [backendKey, categoriesString] = group.split('=');
  if (!backendKey || !categoriesString) {
    return;
  }

  const frontendKey = BACKEND_KEY_TO_FRONTEND[backendKey];
  if (!frontendKey) {
    return;
  }

  const queryProp = FRONTEND_KEY_TO_QUERY_PROP[frontendKey];
  if (queryProp) {
    result[queryProp] = categoriesString.split(',');
  }
}

export function parseComplianceStandards(
  complianceStandardsString?: string,
): Record<string, string[]> {
  if (!complianceStandardsString) {
    return {};
  }

  const result: Record<string, string[]> = {};
  const groups = complianceStandardsString.split('&');

  for (const group of groups) {
    processComplianceStandardGroup(group, result);
  }

  return result;
}

export function mapBackendFacetKeyToFrontend(backendKey: string): string {
  return BACKEND_KEY_TO_FRONTEND[backendKey] || backendKey;
}

export interface StandardData {
  fetching: boolean;
  open: boolean;
  stats: Record<string, number> | undefined;
  values: string[];
}

export function buildStandardsPropsFromQuery(
  query: object,
  facets: Record<string, Record<string, number> | undefined>,
  loadingFacets: Record<string, boolean>,
  openFacets: Record<string, boolean>,
  standardKeys: StandardsInformationKey[] = STANDARDS_REGISTRY.map((s) => s.key),
): Record<StandardsInformationKey, StandardData> {
  const result: Partial<Record<StandardsInformationKey, StandardData>> = {};
  const q = query as Record<string, unknown>;

  for (const key of standardKeys) {
    const queryProp = FRONTEND_KEY_TO_QUERY_PROP[key];
    if (queryProp) {
      const queryValue = q[queryProp];
      result[key] = {
        fetching: loadingFacets[queryProp] === true,
        open: !!openFacets[queryProp],
        stats: facets[queryProp],
        values: Array.isArray(queryValue) ? (queryValue as string[]) : [],
      };
    }
  }

  return result as Record<StandardsInformationKey, StandardData>;
}

export function populateStandardsFromParsed(
  parsedComplianceStandards: Record<string, string[]>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const standard of STANDARDS_REGISTRY) {
    result[standard.queryProp] = parsedComplianceStandards[standard.queryProp] ?? [];
  }

  return result;
}

export function createEmptyStandardsInformation(): StandardsInformation {
  return Object.fromEntries(STANDARDS_REGISTRY.map((s) => [s.key, {}])) as StandardsInformation;
}
