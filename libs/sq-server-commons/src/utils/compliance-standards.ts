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

import {
  BACKEND_KEY_TO_FRONTEND,
  FRONTEND_KEY_TO_QUERY_PROP,
} from '~shared/helpers/compliance-standards-registry';
import { STANDARDS_REGISTRY } from '~shared/helpers/compliance-standards-registry-definitions';
import { StandardsInformation, StandardsInformationKey } from '~shared/types/security';

export {
  BACKEND_KEY_TO_FRONTEND,
  buildComplianceStandards,
  buildComplianceStandardsForCategory,
  COMPLIANCE_STANDARDS_BACKEND_KEYS,
  mapFacetToBackendName,
  parseComplianceStandards,
  populateStandardsFromParsed,
} from '~shared/helpers/compliance-standards-registry';

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

export function createEmptyStandardsInformation(): StandardsInformation {
  return Object.fromEntries(STANDARDS_REGISTRY.map((s) => [s.key, {}])) as StandardsInformation;
}
