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
  const record = standards.cwe[category];
  if (!record) {
    return `CWE-${category}`;
  } else if (category === 'unknown') {
    return record.title;
  }
  return `CWE-${category} - ${record.title}`;
}

export function renderOwaspTop10Category(
  standards: Pick<StandardsInformation, StandardsInformationKey.OWASP_TOP10>,
  category: string,
  withPrefix = false,
): string {
  return renderOwaspCategory(StandardsInformationKey.OWASP_TOP10, standards, category, withPrefix);
}

export function renderOwaspTop10Version2021Category(
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

// This is an alias for SQS (once we add new standards to SQS we can standardize the naming)
export const renderOwaspTop102021Category = renderOwaspTop10Version2021Category;

export function renderOwaspMobileTop10Version2024Category(
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

function renderOwaspCategory<
  T extends StandardsInformationKey.OWASP_TOP10_2021 | StandardsInformationKey.OWASP_TOP10,
>(
  type: T,
  standards: Partial<Pick<StandardsInformation, T>>,
  category: string,
  withPrefix: boolean,
) {
  const record = standards[type]?.[category];
  if (!record) {
    return addPrefix(category.toUpperCase(), 'OWASP', withPrefix);
  }
  return addPrefix(`${category.toUpperCase()} - ${record.title}`, 'OWASP', withPrefix);
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
  const record = standards[type]?.[category];
  if (!record) {
    return addPrefix(category.toUpperCase(), 'OWASP Mobile', withPrefix);
  }
  return addPrefix(`${category.toUpperCase()} - ${record.title}`, 'OWASP Mobile', withPrefix);
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

export function renderPciDss32Category(standards: StandardsInformation, category: string): string {
  const record = standards['pciDss-3.2'][category];
  if (!record) {
    return category;
  }
  return `${category} - ${record.title}`;
}

export function renderPciDss40Category(standards: StandardsInformation, category: string): string {
  const record = standards['pciDss-4.0'][category];
  if (!record) {
    return category;
  }
  return `${category} - ${record.title}`;
}

export function renderOwaspAsvs40Category(
  standards: StandardsInformation,
  category: string,
): string {
  const record = standards['owaspAsvs-4.0'][category];
  if (!record) {
    return category;
  }
  const levelInfo = record.level ? ` (Level ${record.level})` : '';
  return `${category} - ${record.title}${levelInfo}`;
}

function addPrefix(title: string, prefix: string, withPrefix: boolean) {
  return withPrefix ? `${prefix} ${title}` : title;
}

export function renderCASACategory(standards: StandardsInformation, category: string): string {
  const record = standards.casa[category];
  if (!record) {
    return category;
  }
  return `${category} - ${record.title}`;
}

export function renderStigCategory(standards: StandardsInformation, category: string) {
  const record = standards['stig-ASD_V5R3'][category];
  return record ? `${category} - ${record.title}` : category;
}
