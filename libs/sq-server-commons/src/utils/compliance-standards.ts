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

export const COMPLIANCE_STANDARDS_BACKEND_KEYS = {
  [StandardsInformationKey.OWASP_TOP10]: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2017',
  [StandardsInformationKey.OWASP_TOP10_2021]:
    'owasp_top10:urn:sonar-security-standard:owasp:top10:2021',
  [StandardsInformationKey.OWASP_TOP10_2025]:
    'owasp_top10:urn:sonar-security-standard:owasp:top10:2025',
  [StandardsInformationKey.STIG_ASD_V5R3]: 'stig_asd:urn:sonar-security-standard:stig:asd:v5',
  [StandardsInformationKey.STIG_ASD_V6]: 'stig_asd:urn:sonar-security-standard:stig:asd:v6',
} as const;

export const BACKEND_KEY_TO_FRONTEND: Record<string, string> = {
  'owasp_top10:urn:sonar-security-standard:owasp:top10:2017': StandardsInformationKey.OWASP_TOP10,
  'owasp_top10:urn:sonar-security-standard:owasp:top10:2021':
    StandardsInformationKey.OWASP_TOP10_2021,
  'owasp_top10:urn:sonar-security-standard:owasp:top10:2025':
    StandardsInformationKey.OWASP_TOP10_2025,
  'stig_asd:urn:sonar-security-standard:stig:asd:v5': StandardsInformationKey.STIG_ASD_V5R3,
  'stig_asd:urn:sonar-security-standard:stig:asd:v6': StandardsInformationKey.STIG_ASD_V6,
};

interface ComplianceStandardsQuery {
  owaspTop10?: string[];
  'owaspTop10-2021'?: string[];
  'owaspTop10-2025'?: string[];
  'stig-ASD_V5R3'?: string[];
  'stig-ASD_V6'?: string[];
}

export function buildComplianceStandards(query: ComplianceStandardsQuery): string | undefined {
  const standardGroups: string[] = [];

  const { owaspTop10 } = query;
  if (owaspTop10?.length) {
    standardGroups.push(
      `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.OWASP_TOP10]}=${owaspTop10.join(',')}`,
    );
  }

  const owaspTop102021 = query['owaspTop10-2021'];
  if (owaspTop102021?.length) {
    standardGroups.push(
      `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.OWASP_TOP10_2021]}=${owaspTop102021.join(',')}`,
    );
  }

  const owaspTop102025 = query['owaspTop10-2025'];
  if (owaspTop102025?.length) {
    standardGroups.push(
      `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.OWASP_TOP10_2025]}=${owaspTop102025.join(',')}`,
    );
  }

  const stigV5R3 = query['stig-ASD_V5R3'];
  if (stigV5R3?.length) {
    standardGroups.push(
      `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.STIG_ASD_V5R3]}=${stigV5R3.join(',')}`,
    );
  }

  const stigV6 = query['stig-ASD_V6'];
  if (stigV6?.length) {
    standardGroups.push(
      `${COMPLIANCE_STANDARDS_BACKEND_KEYS[StandardsInformationKey.STIG_ASD_V6]}=${stigV6.join(',')}`,
    );
  }

  return standardGroups.length > 0 ? standardGroups.join('&') : undefined;
}

export function mapFacetToBackendName(facet: string): string {
  if (
    facet === StandardsInformationKey.OWASP_TOP10 ||
    facet === StandardsInformationKey.OWASP_TOP10_2021 ||
    facet === StandardsInformationKey.OWASP_TOP10_2025 ||
    facet === StandardsInformationKey.STIG_ASD_V5R3 ||
    facet === StandardsInformationKey.STIG_ASD_V6
  ) {
    return 'complianceStandards';
  }
  return facet;
}

function processComplianceStandardGroup(
  group: string,
  result: Partial<ComplianceStandardsQuery>,
): void {
  const [backendKey, categoriesString] = group.split('=');
  if (!backendKey || !categoriesString) {
    return;
  }

  const frontendKey = BACKEND_KEY_TO_FRONTEND[backendKey];
  if (!frontendKey) {
    return;
  }

  const categories = categoriesString.split(',');

  switch (frontendKey) {
    case StandardsInformationKey.OWASP_TOP10:
      result.owaspTop10 = categories;
      break;
    case StandardsInformationKey.OWASP_TOP10_2021:
      result['owaspTop10-2021'] = categories;
      break;
    case StandardsInformationKey.OWASP_TOP10_2025:
      result['owaspTop10-2025'] = categories;
      break;
    case StandardsInformationKey.STIG_ASD_V5R3:
      result['stig-ASD_V5R3'] = categories;
      break;
    case StandardsInformationKey.STIG_ASD_V6:
      result['stig-ASD_V6'] = categories;
      break;
  }
}

export function parseComplianceStandards(
  complianceStandardsString?: string,
): Partial<ComplianceStandardsQuery> {
  if (!complianceStandardsString) {
    return {};
  }

  const result: Partial<ComplianceStandardsQuery> = {};
  const groups = complianceStandardsString.split('&');

  for (const group of groups) {
    processComplianceStandardGroup(group, result);
  }

  return result;
}

export function mapBackendFacetKeyToFrontend(backendKey: string): string {
  return BACKEND_KEY_TO_FRONTEND[backendKey] || backendKey;
}
