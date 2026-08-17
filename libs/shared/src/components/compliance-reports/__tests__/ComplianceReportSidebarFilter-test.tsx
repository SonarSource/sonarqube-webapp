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

import { screen } from '@testing-library/react';
import { ComplianceReportFilter } from '../../../components/compliance-reports/ComplianceReportSidebarFilter';
import { renderWithContext } from '../../../helpers/test-utils';
import { ComplianceReportSidebarFilter } from '../ComplianceReportSidebarFilter';

describe('ComplianceReportSidebarFilter', () => {
  it('renders the filter options, selected filter, and result count', () => {
    renderFilter({ resultCount: 3, value: ComplianceReportFilter.Regulatory });

    expect(
      screen.getByRole('heading', { name: 'compliancereport.navigation.filter.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'compliancereport.navigation.filter.regulatory' }),
    ).toBeChecked();
    expect(screen.getByText('compliancereport.navigation.filter.select_from')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('notifies the parent when a different filter is selected', async () => {
    const onChange = jest.fn();
    const { user } = renderFilter({ onChange });

    await user.click(
      screen.getByRole('radio', { name: 'compliancereport.navigation.filter.security' }),
    );

    expect(onChange).toHaveBeenCalledWith(ComplianceReportFilter.Security);
  });
});

function renderFilter({
  onChange = jest.fn(),
  resultCount = 0,
  value = ComplianceReportFilter.All,
}: {
  onChange?: (value: ComplianceReportFilter) => void;
  resultCount?: number;
  value?: ComplianceReportFilter;
} = {}) {
  return renderWithContext(
    <ComplianceReportSidebarFilter onChange={onChange} resultCount={resultCount} value={value} />,
  );
}
