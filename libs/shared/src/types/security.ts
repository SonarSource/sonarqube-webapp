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

export enum SecurityStandard {
  CASA = 'casa',
  CWE = 'cwe',
  OWASP_ASVS_4_0 = 'owaspAsvs-4.0',
  OWASP_ASVS_5_0 = 'owaspAsvs-5.0',
  OWASP_LLM_TOP10 = 'owaspLlmTop10-2025',
  OWASP_MASVS = 'owaspMasvs-v2',
  OWASP_MOBILE_TOP10_2024 = 'owaspMobileTop10-2024',
  OWASP_TOP10 = 'owaspTop10',
  OWASP_TOP10_2021 = 'owaspTop10-2021',
  OWASP_TOP10_2025 = 'owaspTop10-2025',
  PCI_DSS_3_2 = 'pciDss-3.2',
  PCI_DSS_4_0 = 'pciDss-4.0',
  SONARSOURCE = 'sonarsourceSecurity',
  STIG_V5R3 = 'stig-ASD_V5R3',
  STIG_V6 = 'stig-ASD_V6',
}

/** Query param names for compliance standards (SecurityStandard + CWE year-specific keys used in the registry) */
export type StandardQueryProp =
  | SecurityStandard
  | 'cwe-2024'
  | 'cwe-2023'
  | 'cwe-2022'
  | 'cwe-2021';

export enum StandardsInformationKey {
  CASA = 'casa',
  CWE = 'cwe',
  CWE_2024 = 'cwe-2024',
  CWE_2023 = 'cwe-2023',
  CWE_2022 = 'cwe-2022',
  CWE_2021 = 'cwe-2021',
  OWASP_ASVS_4_0 = 'owaspAsvs-4.0',
  OWASP_ASVS_5_0 = 'owaspAsvs-5.0',
  OWASP_MASVS_V2 = 'owaspMasvs-v2',
  OWASP_TOP10_2021 = 'owaspTop10-2021',
  OWASP_TOP10_2025 = 'owaspTop10-2025',
  OWASP_TOP10 = 'owaspTop10',
  OWASP_TOP10_FOR_LLM_2025 = 'owaspLlmTop10-2025',
  OWASP_MOBILE_TOP10_2024 = 'owaspMobileTop10-2024',
  PCI_DSS_3_2 = 'pciDss-3.2',
  PCI_DSS_4_0 = 'pciDss-4.0',
  SONARSOURCE = 'sonarsourceSecurity',
  STIG_ASD_V5R3 = 'stig-ASD_V5R3',
  STIG_ASD_V6 = 'stig-ASD_V6',
}

export type StandardsInformation = {
  [key in StandardsInformationKey]: Record<
    string,
    { description?: string; level?: string; title: string }
  >;
};

export enum LocalStandardsInformationKey {
  CWE_TOP25_2024 = 'cweTop25-2024',
  CWE_TOP25_2023 = 'cweTop25-2023',
  CWE_TOP25_2022 = 'cweTop25-2022',
  CWE_TOP25_2021 = 'cweTop25-2021',
  OWASP_MOBILE_TOP10_2024 = 'owaspMobileTop10-2024',
  OWASP_TOP10_2017 = 'owaspTop10-2017',
  OWASP_ASVS_4_0_LEVEL_1 = 'owaspAsvs-4.0-level1',
  OWASP_ASVS_4_0_LEVEL_2 = 'owaspAsvs-4.0-level2',
  OWASP_ASVS_4_0_LEVEL_3 = 'owaspAsvs-4.0-level3',
}

export type StandardsKey = StandardsInformationKey | LocalStandardsInformationKey;

export type SecurityStandardOption<T extends string = string> = {
  id: T;
  label: string;
  /** When set, use this localization key instead of label for display (e.g. securityreport.sonarsourceSecurity) */
  labelMessageId?: string;
};

export type SecurityStandardOptionGroup<T extends string = string, O extends string = string> = {
  id: T | string;
  label: string;
  /** When set, use this localization key instead of label for display */
  labelMessageId?: string;
  options: SecurityStandardOption<O>[];
  /** When set (e.g. OWASP ASVS), append to translated label (e.g. "OWASP ASVS 4.0") */
  version?: string;
};
