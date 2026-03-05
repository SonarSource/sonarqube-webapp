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
  SecurityStandard,
  StandardQueryProp,
  StandardsInformation,
  StandardsInformationKey,
} from '../types/security';
import {
  renderCASACategory,
  renderCWECategory,
  renderOwaspAsvs40Category,
  renderOwaspMobileTop102024Category,
  renderOwaspTop102021Category,
  renderOwaspTop10Category,
  renderPciDss32Category,
  renderPciDss40Category,
  renderSonarSourceSecurityCategory,
  renderStigCategory,
} from './security-standards';

export interface StandardDefinition {
  availableInPDFReports?: boolean;
  backendKey: string;
  displayName: string;
  enumKey: string;
  key: StandardsInformationKey;
  levels?: string[];
  pdfLabel?: string;
  queryProp: StandardQueryProp;
  renderCategory: (standards: StandardsInformation, category: string) => string;
  showMoreEnabled?: boolean;
  url?: string;
  version?: string;
}

export const STANDARDS_REGISTRY: StandardDefinition[] = [
  {
    availableInPDFReports: true,
    backendKey: 'sonar_standard:urn:sonar-security-standard:sonar:standard:unversioned',
    displayName: 'sonarsourceSecurity',
    enumKey: 'SONARSOURCE',
    key: StandardsInformationKey.SONARSOURCE,
    pdfLabel: 'Sonar',
    queryProp: SecurityStandard.SONARSOURCE,
    renderCategory: renderSonarSourceSecurityCategory,
    showMoreEnabled: true,
  },
  {
    availableInPDFReports: true,
    backendKey: 'pci_dss:urn:sonar-security-standard:pci:dss:4.0',
    displayName: 'pciDss_4.0',
    enumKey: 'PCI_DSS',
    key: StandardsInformationKey.PCI_DSS_4_0,
    pdfLabel: 'PCI DSS',
    queryProp: SecurityStandard.PCI_DSS_4_0,
    renderCategory: renderPciDss40Category,
    showMoreEnabled: true,
    version: '4.0',
  },
  {
    availableInPDFReports: true,
    backendKey: 'pci_dss:urn:sonar-security-standard:pci:dss:3.2',
    displayName: 'pciDss_3.2',
    enumKey: 'PCI_DSS',
    key: StandardsInformationKey.PCI_DSS_3_2,
    pdfLabel: 'PCI DSS',
    queryProp: SecurityStandard.PCI_DSS_3_2,
    renderCategory: renderPciDss32Category,
    showMoreEnabled: true,
    version: '3.2',
  },
  // {
  //   availableInPDFReports: true,
  //   backendKey: 'owasp_asvs:urn:sonar-security-standard:owasp:asvs:5.0',
  //   displayName: 'owaspAsvs_5.0',
  //   enumKey: 'OWASP_ASVS',
  //   key: StandardsInformationKey.OWASP_ASVS_5_0,
  //   levels: ['1', '2', '3'],
  //   pdfLabel: 'OWASP ASVS',
  //   queryProp: SecurityStandard.OWASP_ASVS_5_0,
  //   renderCategory: renderOwaspAsvs50Category,
  //   showMoreEnabled: true,
  //   url: 'https://owasp.org/www-project-application-security-verification-standard/',
  //   version: '5.0',
  // },
  {
    availableInPDFReports: true,
    backendKey: 'owasp_asvs:urn:sonar-security-standard:owasp:asvs:4.0',
    displayName: 'owaspAsvs_4.0',
    enumKey: 'OWASP_ASVS',
    key: StandardsInformationKey.OWASP_ASVS_4_0,
    levels: ['1', '2', '3'],
    pdfLabel: 'OWASP ASVS',
    queryProp: SecurityStandard.OWASP_ASVS_4_0,
    renderCategory: renderOwaspAsvs40Category,
    showMoreEnabled: true,
    url: 'https://owasp.org/www-project-application-security-verification-standard/',
    version: '4.0',
  },
  // {
  //   availableInPDFReports: true,
  //   backendKey: 'owasp_masvs:urn:sonar-security-standard:owasp:masvs:v2',
  //   displayName: 'owaspMasvs_v2',
  //   enumKey: 'OWASP_MASVS',
  //   key: StandardsInformationKey.OWASP_MASVS_V2,
  //   pdfLabel: 'OWASP MASVS',
  //   queryProp: SecurityStandard.OWASP_MASVS,
  //   renderCategory: renderOwaspMasvsV2Category,
  //   showMoreEnabled: true,
  //   url: 'https://mas.owasp.org/MASVS/',
  // },
  // {
  //   availableInPDFReports: true,
  //   backendKey: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2025',
  //   displayName: 'owaspTop10_2025',
  //   enumKey: 'OWASP_TOP10',
  //   key: StandardsInformationKey.OWASP_TOP10_2025,
  //   pdfLabel: 'OWASP Top 10',
  //   queryProp: SecurityStandard.OWASP_TOP10_2025,
  //   renderCategory: renderOwaspTop102025Category,
  //   showMoreEnabled: false,
  //   url: 'https://owasp.org/Top10/',
  //   version: '2025',
  // },
  {
    availableInPDFReports: true,
    backendKey: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2021',
    displayName: 'owaspTop10_2021',
    enumKey: 'OWASP_TOP10',
    key: StandardsInformationKey.OWASP_TOP10_2021,
    pdfLabel: 'OWASP Top 10',
    queryProp: SecurityStandard.OWASP_TOP10_2021,
    renderCategory: renderOwaspTop102021Category,
    showMoreEnabled: false,
    url: 'https://owasp.org/Top10/',
    version: '2021',
  },
  {
    availableInPDFReports: true,
    backendKey: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2017',
    displayName: 'owaspTop10',
    enumKey: 'OWASP_TOP10',
    key: StandardsInformationKey.OWASP_TOP10,
    pdfLabel: 'OWASP Top 10',
    queryProp: SecurityStandard.OWASP_TOP10,
    renderCategory: renderOwaspTop10Category,
    showMoreEnabled: false,
    url: 'https://owasp.org/Top10/',
    version: '2017',
  },
  {
    availableInPDFReports: true,
    backendKey: 'owasp_mobile-top10:urn:sonar-security-standard:owasp:mobile-top10:2024',
    displayName: 'owaspMobileTop10_2024',
    enumKey: 'OWASP_MOBILE_TOP10',
    key: StandardsInformationKey.OWASP_MOBILE_TOP10_2024,
    pdfLabel: 'OWASP Mobile Top 10',
    queryProp: SecurityStandard.OWASP_MOBILE_TOP10_2024,
    renderCategory: renderOwaspMobileTop102024Category,
    showMoreEnabled: false,
    url: 'https://owasp.org/www-project-mobile-top-10/',
    version: '2024',
  },
  // {
  //   availableInPDFReports: true,
  //   backendKey: 'owasp_llm-top10:urn:sonar-security-standard:owasp:llm-top10:2025',
  //   displayName: 'owaspLlmTop10_2025',
  //   enumKey: 'OWASP_LLM_TOP10',
  //   key: StandardsInformationKey.OWASP_TOP10_FOR_LLM_2025,
  //   pdfLabel: 'OWASP Top 10 for LLM',
  //   queryProp: SecurityStandard.OWASP_LLM_TOP10,
  //   renderCategory: renderOwaspTop10ForLlm2025Category,
  //   showMoreEnabled: false,
  //   url: 'https://genai.owasp.org/llm-top-10/',
  //   version: '2025',
  // },
  {
    availableInPDFReports: true,
    backendKey: 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.18:2024',
    displayName: 'cwe_2024',
    enumKey: 'CWE_TOP_25',
    key: StandardsInformationKey.CWE_2024,
    pdfLabel: 'CWE Top 25',
    queryProp: 'cwe-2024',
    renderCategory: renderCWECategory,
    showMoreEnabled: false,
    url: 'https://cwe.mitre.org/top25/index.html',
    version: '2024',
  },
  {
    availableInPDFReports: true,
    backendKey: 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.16:2023',
    displayName: 'cwe_2023',
    enumKey: 'CWE_TOP_25',
    key: StandardsInformationKey.CWE_2023,
    pdfLabel: 'CWE Top 25',
    queryProp: 'cwe-2023',
    renderCategory: renderCWECategory,
    showMoreEnabled: false,
    url: 'https://cwe.mitre.org/top25/index.html',
    version: '2023',
  },
  {
    availableInPDFReports: true,
    backendKey: 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.15:2022',
    displayName: 'cwe_2022',
    enumKey: 'CWE_TOP_25',
    key: StandardsInformationKey.CWE_2022,
    pdfLabel: 'CWE Top 25',
    queryProp: 'cwe-2022',
    renderCategory: renderCWECategory,
    showMoreEnabled: false,
    url: 'https://cwe.mitre.org/top25/index.html',
    version: '2022',
  },
  {
    availableInPDFReports: true,
    backendKey: 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.14:2021',
    displayName: 'cwe_2021',
    enumKey: 'CWE_TOP_25',
    key: StandardsInformationKey.CWE_2021,
    pdfLabel: 'CWE Top 25',
    queryProp: 'cwe-2021',
    renderCategory: renderCWECategory,
    showMoreEnabled: false,
    url: 'https://cwe.mitre.org/top25/index.html',
    version: '2021',
  },
  {
    availableInPDFReports: false,
    backendKey: 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.18',
    displayName: 'cwe',
    enumKey: 'CWE_TOP_25',
    key: StandardsInformationKey.CWE,
    pdfLabel: 'CWE',
    queryProp: SecurityStandard.CWE,
    renderCategory: renderCWECategory,
    showMoreEnabled: false,
    url: 'https://cwe.mitre.org/',
  },
  // {
  //   availableInPDFReports: true,
  //   backendKey: 'stig_asd:urn:sonar-security-standard:stig:asd:v6',
  //   displayName: 'stigAsd_v6',
  //   enumKey: 'STIG',
  //   key: StandardsInformationKey.STIG_ASD_V6,
  //   pdfLabel: 'STIG',
  //   queryProp: SecurityStandard.STIG_V6,
  //   renderCategory: renderStigV6Category,
  //   showMoreEnabled: true,
  //   version: 'ASD_V6',
  // },
  {
    availableInPDFReports: true,
    backendKey: 'stig_asd:urn:sonar-security-standard:stig:asd:v5',
    displayName: 'stigAsd_v5r3',
    enumKey: 'STIG',
    key: StandardsInformationKey.STIG_ASD_V5R3,
    pdfLabel: 'STIG',
    queryProp: SecurityStandard.STIG_V5R3,
    renderCategory: renderStigCategory,
    showMoreEnabled: true,
    version: 'ASD_V5R3',
  },
  {
    availableInPDFReports: true,
    backendKey: 'casa_standard:urn:sonar-security-standard:casa:standard:unversioned',
    displayName: 'casa',
    enumKey: 'CASA',
    key: StandardsInformationKey.CASA,
    pdfLabel: 'CASA',
    queryProp: SecurityStandard.CASA,
    renderCategory: renderCASACategory,
    showMoreEnabled: true,
  },
];
