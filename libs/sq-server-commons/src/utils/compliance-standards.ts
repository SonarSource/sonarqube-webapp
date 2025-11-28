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

import { StandardsInformationKey } from '~shared/types/security';

/**
 * Mapping for compliance standards that use the complianceStandards parameter.
 * These standards require a special format: backendKey=category
 */
export const COMPLIANCE_STANDARDS_BACKEND_KEYS = {
  [StandardsInformationKey.OWASP_TOP10_2025]:
    'owasp_top10:urn:sonar-security-standard:owasp:top10:2025',
  [StandardsInformationKey.STIG_ASD_V5R3]: 'stig_asd:urn:sonar-security-standard:stig:asd:v5',
  [StandardsInformationKey.STIG_ASD_V6]: 'stig_asd:urn:sonar-security-standard:stig:asd:v6',
} as const;

/**
 * Reverse mapping: backend key to frontend key.
 * Used when parsing API responses.
 */
export const BACKEND_KEY_TO_FRONTEND: Record<string, string> = {
  'owasp_top10:urn:sonar-security-standard:owasp:top10:2025':
    StandardsInformationKey.OWASP_TOP10_2025,
  'stig_asd:urn:sonar-security-standard:stig:asd:v5': StandardsInformationKey.STIG_ASD_V5R3,
  'stig_asd:urn:sonar-security-standard:stig:asd:v6': StandardsInformationKey.STIG_ASD_V6,
};

/**
 * Interface for query objects that contain compliance standard filters.
 */
interface ComplianceStandardsQuery {
  'owaspTop10-2025'?: string[];
  'stig-ASD_V5R3'?: string[];
  'stig-ASD_V6'?: string[];
}

/**
 * Builds the complianceStandards array for API requests.
 * Converts frontend standard keys and categories into the backend format:
 * backendKey=category (e.g., "owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A01")
 *
 * @param query - Query object containing compliance standard filters
 * @returns Array of formatted compliance standards for the API
 */
export function buildComplianceStandards(query: ComplianceStandardsQuery): string[] {
  const complianceStandards: string[] = [];

  const owaspTop102025 = query['owaspTop10-2025'];
  if (owaspTop102025?.length) {
    owaspTop102025.forEach((category) => {
      complianceStandards.push(
        `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.OWASP_TOP10_2025]}=${category}`,
      );
    });
  }

  const stigV5R3 = query['stig-ASD_V5R3'];
  if (stigV5R3?.length) {
    stigV5R3.forEach((category) => {
      complianceStandards.push(
        `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.STIG_ASD_V5R3]}=${category}`,
      );
    });
  }

  const stigV6 = query['stig-ASD_V6'];
  if (stigV6?.length) {
    stigV6.forEach((category) => {
      complianceStandards.push(
        `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.STIG_ASD_V6]}=${category}`,
      );
    });
  }

  return complianceStandards;
}

/**
 * Maps a frontend facet key to its backend equivalent.
 * For new compliance standards, they map to 'complianceStandards'.
 *
 * @param facet - Frontend facet key
 * @returns Backend facet name
 */
export function mapFacetToBackendName(facet: string): string {
  if (
    facet === StandardsInformationKey.OWASP_TOP10_2025 ||
    facet === StandardsInformationKey.STIG_ASD_V5R3 ||
    facet === StandardsInformationKey.STIG_ASD_V6
  ) {
    return 'complianceStandards';
  }
  return facet;
}

/**
 * Maps a backend facet key to its frontend equivalent.
 * Used when parsing API responses.
 *
 * @param backendKey - Backend facet key from API response
 * @returns Frontend facet key
 */
export function mapBackendFacetKeyToFrontend(backendKey: string): string {
  return BACKEND_KEY_TO_FRONTEND[backendKey] || backendKey;
}
