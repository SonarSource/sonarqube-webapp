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

import styled from '@emotion/styled';
import {
  BadgeCounter,
  cssVar,
  Divider,
  Heading,
  RadioButtonGroup,
  Text,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { ComplianceReportFilter } from '../../helpers/compliance-report-filter';

// Re-exported so existing consumers can keep importing the filter enum/type from the filter
// component. The canonical home is the plain helper, which non-React modules (e.g. the
// security-standards registry) can import without dragging in React.
export { ComplianceReportFilter } from '../../helpers/compliance-report-filter';
export type { ComplianceReportNavigationCategory } from '../../helpers/compliance-report-filter';

const FilterHeading = styled(Heading)`
  line-height: ${cssVar('line-height-20')};
`;

const filterMessageIds: Record<ComplianceReportFilter, string> = {
  [ComplianceReportFilter.All]: 'compliancereport.navigation.filter.all',
  [ComplianceReportFilter.Security]: 'compliancereport.navigation.filter.security',
  [ComplianceReportFilter.Regulatory]: 'compliancereport.navigation.filter.regulatory',
  [ComplianceReportFilter.Accessibility]: 'compliancereport.navigation.filter.accessibility',
};

interface Props {
  onChange: (value: ComplianceReportFilter) => void;
  resultCount: number;
  value: ComplianceReportFilter;
}

function isComplianceReportFilter(value: string): value is ComplianceReportFilter {
  return Object.values(ComplianceReportFilter).includes(value as ComplianceReportFilter);
}

export function ComplianceReportSidebarFilter({ onChange, resultCount, value }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <>
      <FilterHeading
        as="h2"
        className="sw-mb-4"
        id="security-report-nav-filter-label"
        size="medium"
      >
        {formatMessage({
          id: 'compliancereport.navigation.filter.title',
        })}
      </FilterHeading>
      <RadioButtonGroup
        ariaLabelledBy="security-report-nav-filter-label"
        id="security-report-nav-filter"
        onChange={(nextValue) => {
          if (isComplianceReportFilter(nextValue)) {
            onChange(nextValue);
          }
        }}
        options={[
          {
            label: formatMessage({
              id: 'compliancereport.navigation.filter.all',
            }),
            value: ComplianceReportFilter.All,
          },
          {
            label: formatMessage({
              id: 'compliancereport.navigation.filter.security',
            }),
            value: ComplianceReportFilter.Security,
          },
          {
            label: formatMessage({
              id: 'compliancereport.navigation.filter.regulatory',
            }),
            value: ComplianceReportFilter.Regulatory,
          },
          {
            label: formatMessage({
              id: 'compliancereport.navigation.filter.accessibility',
            }),
            value: ComplianceReportFilter.Accessibility,
          },
        ]}
        value={value}
      />

      <Divider className="sw-my-5" />

      <div className="sw-flex sw-items-center sw-gap-1 sw-pb-5">
        <Text size="small">
          <Text as="span" isSubtle size="small">
            {formatMessage({
              id: 'compliancereport.navigation.filter.select_from',
            })}
          </Text>{' '}
          <Text as="b" size="small">
            {formatMessage({ id: filterMessageIds[value] })}
          </Text>
        </Text>

        <BadgeCounter value={resultCount} />
      </div>
    </>
  );
}
