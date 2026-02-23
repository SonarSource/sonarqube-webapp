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

import { noop } from 'lodash';
import React from 'react';
import { StandardsInformation, StandardsInformationKey } from '../types/security';

export function getStandards(): Promise<StandardsInformation> {
  return import('./standards.json').then((x) => x.default);
}

export const useStandardsInformations = () => {
  const [loading, setLoading] = React.useState(true);
  const [standardsInformation, setStandardsInformation] = React.useState<StandardsInformation>(
    Object.fromEntries(
      Object.values(StandardsInformationKey).map((key) => [key, {}]),
    ) as StandardsInformation,
  );
  React.useEffect(() => {
    getStandards()
      .then((standardsInformation: StandardsInformation) => {
        setStandardsInformation(standardsInformation);
      })
      .catch(noop)
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return { loading, standardsInformation };
};

// Extension for cloud-specific standards, should be removed when SQS is updated with new standards
export type ExtendedStandardsInformation = StandardsInformation & {
  'owaspMobileTop10-2024': Record<string, { description?: string; level?: string; title: string }>;
};

// Cloud-specific hook that returns extended standards information (should be removed when SQS is updated with new standards)
export function useExtendedStandardsInformation() {
  const result = useStandardsInformations();
  return {
    ...result,
    standardsInformation: result.standardsInformation as ExtendedStandardsInformation,
  };
}

export function renderCWECategory(
  standards: Pick<StandardsInformation, StandardsInformationKey.CWE>,
  category: string,
): string {
  const normalizedCategory = category.replace(/^CWE-/i, '');
  const record = standards.cwe[normalizedCategory];

  if (!record) {
    return `CWE-${normalizedCategory}`;
  } else if (normalizedCategory === 'unknown') {
    return record.title;
  }
  return `CWE-${normalizedCategory} - ${record.title}`;
}

export function renderOwaspTop10Category(
  standards: Pick<StandardsInformation, StandardsInformationKey.OWASP_TOP10>,
  category: string,
  withPrefix = false,
): string {
  return renderOwaspCategory(StandardsInformationKey.OWASP_TOP10, standards, category, withPrefix);
}

export function renderOwaspTop102021Category(
  standards: Pick<StandardsInformation, StandardsInformationKey.OWASP_TOP10_2021>,
  category: string,
  withPrefix = false,
): string {
  return renderOwaspCategory(
    StandardsInformationKey.OWASP_TOP10_2021,
    standards,
    category,
    withPrefix,
  );
}

export function renderOwaspTop102025Category(
  standards: Pick<StandardsInformation, StandardsInformationKey.OWASP_TOP10_2025>,
  category: string,
  withPrefix = false,
): string {
  // Check if the standard exists in the standards data
  if (!standards[StandardsInformationKey.OWASP_TOP10_2025]) {
    return addPrefix(category.toUpperCase(), 'OWASP', withPrefix);
  }
  return renderOwaspCategory(
    StandardsInformationKey.OWASP_TOP10_2025,
    standards,
    category,
    withPrefix,
  );
}

export function renderOwaspMobileTop102024Category(
  standards: Pick<ExtendedStandardsInformation, 'owaspMobileTop10-2024'>,
  category: string,
  withPrefix = false,
): string {
  return renderOwaspMobileCategory(
    'owaspMobileTop10-2024' as const,
    category,
    standards,
    withPrefix,
  );
}

export function renderOwaspTop10ForLlm2025Category(
  standards: Pick<StandardsInformation, StandardsInformationKey.OWASP_TOP10_FOR_LLM_2025>,
  category: string,
  withPrefix = false,
): string {
  return renderOwaspCategory(
    StandardsInformationKey.OWASP_TOP10_FOR_LLM_2025,
    standards,
    category,
    withPrefix,
    'LLM',
  );
}

function normalizeCategoryWithLeadingZeros(
  category: string,
  prefix: string,
): { display: string; normalized: string } {
  const lowerPrefix = prefix.toLowerCase();
  const upperPrefix = prefix.toUpperCase();
  const regexPattern = new RegExp(`^${lowerPrefix}0+`, 'i');

  // Normalize for lookup: lowercase and remove leading zeros
  const normalized = category.toLowerCase().replace(regexPattern, lowerPrefix);

  // Format for display: uppercase and remove leading zeros
  const display = category.toUpperCase().replace(regexPattern, upperPrefix);

  return { normalized, display };
}

function renderOwaspCategory<
  T extends
    | StandardsInformationKey.OWASP_TOP10_2021
    | StandardsInformationKey.OWASP_TOP10_2025
    | StandardsInformationKey.OWASP_TOP10
    | StandardsInformationKey.OWASP_TOP10_FOR_LLM_2025,
>(
  type: T,
  standards: Partial<Pick<StandardsInformation, T>>,
  category: string,
  withPrefix: boolean,
  prefix = 'a',
) {
  const { normalized, display } = normalizeCategoryWithLeadingZeros(category, prefix);
  const record = standards[type]?.[normalized];

  if (!record) {
    return addPrefix(display, 'OWASP', withPrefix);
  }
  return addPrefix(`${display} - ${record.title}`, 'OWASP', withPrefix);
}

function renderOwaspMobileCategory<T extends string>(
  type: T,
  category: string,
  standards: Partial<
    Pick<
      StandardsInformation &
        Record<T, Record<string, { description?: string; level?: string; title: string }>>,
      T
    >
  >,
  withPrefix: boolean,
) {
  const { normalized, display } = normalizeCategoryWithLeadingZeros(category, 'm');
  const record = standards[type]?.[normalized];

  if (!record) {
    return addPrefix(display, 'OWASP Mobile', withPrefix);
  }
  return addPrefix(`${display} - ${record.title}`, 'OWASP Mobile', withPrefix);
}

export function renderSonarSourceSecurityCategory(
  standards: Pick<StandardsInformation, StandardsInformationKey.SONARSOURCE>,
  category: string,
  withPrefix = false,
): string {
  const record = standards.sonarsourceSecurity[category];
  if (!record) {
    return addPrefix(category.toUpperCase(), 'SONAR', withPrefix);
  } else if (category === 'others') {
    return record.title;
  }
  return addPrefix(record.title, 'SONAR', withPrefix);
}

function createSimpleRenderer<K extends keyof StandardsInformation>(standardKey: K) {
  return (standards: StandardsInformation, category: string): string => {
    const record = standards[standardKey]?.[category];
    return record ? `${category} - ${record.title}` : category;
  };
}

function createRendererWithLevel<K extends keyof StandardsInformation>(standardKey: K) {
  return (standards: StandardsInformation, category: string): string => {
    const record = standards[standardKey]?.[category];
    if (!record) {
      return category;
    }
    const levelInfo = record.level ? ` (Level ${record.level})` : '';
    return `${category} - ${record.title}${levelInfo}`;
  };
}

// Simple renderers - all use the same pattern
export const renderPciDss32Category = createSimpleRenderer(StandardsInformationKey.PCI_DSS_3_2);
export const renderPciDss40Category = createSimpleRenderer(StandardsInformationKey.PCI_DSS_4_0);
export const renderOwaspMasvsV2Category = createSimpleRenderer(
  StandardsInformationKey.OWASP_MASVS_V2,
);
export const renderCASACategory = createSimpleRenderer(StandardsInformationKey.CASA);
export const renderStigCategory = createSimpleRenderer(StandardsInformationKey.STIG_ASD_V5R3);
export const renderStigV6Category = createSimpleRenderer(StandardsInformationKey.STIG_ASD_V6);

// Renderers with level information
export const renderOwaspAsvs40Category = createRendererWithLevel(
  StandardsInformationKey.OWASP_ASVS_4_0,
);
export const renderOwaspAsvs50Category = createRendererWithLevel(
  StandardsInformationKey.OWASP_ASVS_5_0,
);

function addPrefix(title: string, prefix: string, withPrefix: boolean) {
  return withPrefix ? `${prefix} ${title}` : title;
}
