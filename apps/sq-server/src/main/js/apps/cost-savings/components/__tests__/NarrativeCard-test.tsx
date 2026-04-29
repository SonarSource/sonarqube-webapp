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
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import type { SecurityCategory } from '../../api/cost-savings-api';
import { NarrativeCard } from '../NarrativeCard';

const baseCategory: SecurityCategory = {
  benchmarkSource: 'IBM/Ponemon 2025',
  category: 'SQL Injection',
  categoryKey: 'sql-injection',
  cwe: ['CWE-89'],
  industryBenchmarkCost: 4790000,
  issueCount: 12,
  narrative: '12 SQL injection vulnerabilities identified across 3 projects.',
  owasp: 'A03:2021',
  severityBreakdown: { HIGH: 8, MEDIUM: 4 },
};

it('should render category name and issue count', () => {
  renderComponent(<NarrativeCard category={baseCategory} />);

  expect(screen.getByText('SQL Injection')).toBeInTheDocument();
  expect(screen.getByText(/12 cost_savings.issues_found/)).toBeInTheDocument();
});

it('should render narrative text', () => {
  renderComponent(<NarrativeCard category={baseCategory} />);

  expect(
    screen.getByText('12 SQL injection vulnerabilities identified across 3 projects.'),
  ).toBeInTheDocument();
});

it('should render benchmark cost with source attribution', () => {
  renderComponent(<NarrativeCard category={baseCategory} />);

  expect(screen.getByText('$4.79M')).toBeInTheDocument();
  expect(screen.getByText('IBM/Ponemon 2025')).toBeInTheDocument();
});

it('should render severity badges', () => {
  renderComponent(<NarrativeCard category={baseCategory} />);

  expect(screen.getByText('8 HIGH')).toBeInTheDocument();
  expect(screen.getByText('4 MEDIUM')).toBeInTheDocument();
});

it('should render CWE and OWASP references', () => {
  renderComponent(<NarrativeCard category={baseCategory} />);

  expect(screen.getByText('CWE-89')).toBeInTheDocument();
  expect(screen.getByText(/A03:2021/)).toBeInTheDocument();
});

it('should render compliance badges when frameworks are present', () => {
  const categoryWithCompliance: SecurityCategory = {
    ...baseCategory,
    complianceFrameworks: ['PCI-DSS 6.5.1', 'OWASP Top 10 A03'],
  };
  renderComponent(<NarrativeCard category={categoryWithCompliance} />);

  expect(screen.getByText('PCI-DSS')).toBeInTheDocument();
  expect(screen.getByText('OWASP Top 10')).toBeInTheDocument();
});

it('should render drill-down link to issues', () => {
  renderComponent(<NarrativeCard category={baseCategory} />);

  expect(screen.getByText('cost_savings.view_issues')).toBeInTheDocument();
});
