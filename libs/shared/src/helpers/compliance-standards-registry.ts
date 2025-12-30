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

import { StandardsInformation, StandardsInformationKey } from '../types/security';
import {
  renderCASACategory,
  renderCWECategory,
  renderOwaspAsvs40Category,
  renderOwaspAsvs50Category,
  renderOwaspMasvsV2Category,
  renderOwaspMobileTop102024Category,
  renderOwaspTop102021Category,
  renderOwaspTop102025Category,
  renderOwaspTop10Category,
  renderOwaspTop10ForLlm2025Category,
  renderPciDss32Category,
  renderPciDss40Category,
  renderSonarSourceSecurityCategory,
  renderStigCategory,
  renderStigV6Category,
} from './security-standards';

export interface StandardDefinition {
  backendKey: string;
  displayName: string;
  key: StandardsInformationKey;
  queryProp: string;
  renderCategory: (standards: StandardsInformation, category: string) => string;
  showMoreEnabled?: boolean;
}

export const STANDARDS_REGISTRY: StandardDefinition[] = [
  {
    key: StandardsInformationKey.SONARSOURCE,
    backendKey: 'sonar_standard:urn:sonar-security-standard:sonar:standard:unversioned',
    queryProp: 'sonarsourceSecurity',
    displayName: 'sonarsourceSecurity',
    renderCategory: renderSonarSourceSecurityCategory,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.OWASP_TOP10_2025,
    backendKey: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2025',
    queryProp: 'owaspTop10-2025',
    displayName: 'owaspTop10_2025',
    renderCategory: renderOwaspTop102025Category,
    showMoreEnabled: false,
  },
  {
    key: StandardsInformationKey.OWASP_TOP10_2021,
    backendKey: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2021',
    queryProp: 'owaspTop10-2021',
    displayName: 'owaspTop10_2021',
    renderCategory: renderOwaspTop102021Category,
    showMoreEnabled: false,
  },
  {
    key: StandardsInformationKey.OWASP_TOP10,
    backendKey: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2017',
    queryProp: 'owaspTop10',
    displayName: 'owaspTop10',
    renderCategory: renderOwaspTop10Category,
    showMoreEnabled: false,
  },
  {
    key: StandardsInformationKey.OWASP_MOBILE_TOP10_2024,
    backendKey: 'owasp_mobile-top10:urn:sonar-security-standard:owasp:mobile-top10:2024',
    queryProp: 'owaspMobileTop10-2024',
    displayName: 'owaspMobileTop10_2024',
    renderCategory: renderOwaspMobileTop102024Category,
    showMoreEnabled: false,
  },
  {
    key: StandardsInformationKey.OWASP_TOP10_FOR_LLM_2025,
    backendKey: 'owasp_llm-top10:urn:sonar-security-standard:owasp:llm-top10:2025',
    queryProp: 'owaspLlmTop10-2025',
    displayName: 'owaspLlmTop10_2025',
    renderCategory: renderOwaspTop10ForLlm2025Category,
    showMoreEnabled: false,
  },
  {
    key: StandardsInformationKey.OWASP_ASVS_5_0,
    backendKey: 'owasp_asvs:urn:sonar-security-standard:owasp:asvs:5.0',
    queryProp: 'owaspAsvs-5.0',
    displayName: 'owaspAsvs_5.0',
    renderCategory: renderOwaspAsvs50Category,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.OWASP_ASVS_4_0,
    backendKey: 'owasp_asvs:urn:sonar-security-standard:owasp:asvs:4.0',
    queryProp: 'owaspAsvs-4.0',
    displayName: 'owaspAsvs_4.0',
    renderCategory: renderOwaspAsvs40Category,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.OWASP_MASVS_V2,
    backendKey: 'owasp_masvs:urn:sonar-security-standard:owasp:masvs:v2',
    queryProp: 'owaspMasvs-v2',
    displayName: 'owaspMasvs_v2',
    renderCategory: renderOwaspMasvsV2Category,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.PCI_DSS_4_0,
    backendKey: 'pci_dss:urn:sonar-security-standard:pci:dss:4.0',
    queryProp: 'pciDss-4.0',
    displayName: 'pciDss_4.0',
    renderCategory: renderPciDss40Category,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.PCI_DSS_3_2,
    backendKey: 'pci_dss:urn:sonar-security-standard:pci:dss:3.2',
    queryProp: 'pciDss-3.2',
    displayName: 'pciDss_3.2',
    renderCategory: renderPciDss32Category,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.CASA,
    backendKey: 'casa_standard:urn:sonar-security-standard:casa:standard:unversioned',
    queryProp: 'casa',
    displayName: 'casa',
    renderCategory: renderCASACategory,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.STIG_ASD_V6,
    backendKey: 'stig_asd:urn:sonar-security-standard:stig:asd:v6',
    queryProp: 'stig-ASD_V6',
    displayName: 'stigAsd_v6',
    renderCategory: renderStigV6Category,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.STIG_ASD_V5R3,
    backendKey: 'stig_asd:urn:sonar-security-standard:stig:asd:v5',
    queryProp: 'stig-ASD_V5R3',
    displayName: 'stigAsd_v5r3',
    renderCategory: renderStigCategory,
    showMoreEnabled: true,
  },
  {
    key: StandardsInformationKey.CWE,
    backendKey: 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.18',
    queryProp: 'cwe',
    displayName: 'cwe',
    renderCategory: renderCWECategory,
    showMoreEnabled: false,
  },
];

export function getStandardDefinition(
  key: StandardsInformationKey,
): StandardDefinition | undefined {
  return STANDARDS_REGISTRY.find((s) => s.key === key);
}

export const ALL_STANDARD_KEYS = STANDARDS_REGISTRY.map((s) => s.key);
