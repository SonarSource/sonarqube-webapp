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
import CostSavingsApp from '../CostSavingsApp';

const defaultSummary = {
  companyProfile: { hourlyRate: 75, industry: 'TECHNOLOGY', region: 'US' },
  configured: true,
  counterfactual: { dollarsPerMonth: 12000, issuesPerMonth: 200 },
  issuesPerKLoc: 3.5,
  openVulnerabilityCount: 12,
  periodEnd: '2025-04-10',
  periodStart: '2024-04-10',
  projectCount: 6,
  resolvedIssueCount: 14200,
  industryBreachBenchmark: 4790000,
  savingsMode: 'measured',
  timeSavings: {
    maintainability: { dollars: 77000, hours: 1027, netNewDebt: false },
    reliability: { dollars: 112000, hours: 1493, netNewDebt: false },
    security: { dollars: 95000, hours: 1267, netNewDebt: false },
    total: { dollars: 284000, hours: 3787, netNewDebt: false },
  },
  vulnerabilityCategoryCount: 5,
};

jest.mock('../../api/cost-savings-api', () => ({
  getBenchmarks: jest.fn().mockResolvedValue({
    avgSavingsByIndustry: {},
    avgVulnerabilityCategories: 5,
    maturityCurve: {},
    totalCustomers: 100,
  }),
  getConfiguration: jest.fn().mockResolvedValue({ industry: 'TECHNOLOGY', region: 'US' }),
  getCostSummary: jest.fn().mockResolvedValue({
    companyProfile: { hourlyRate: 75, industry: 'TECHNOLOGY', region: 'US' },
    configured: true,
    counterfactual: { dollarsPerMonth: 12000, issuesPerMonth: 200 },
    issuesPerKLoc: 3.5,
    openVulnerabilityCount: 12,
    periodEnd: '2025-04-10',
    periodStart: '2024-04-10',
    projectCount: 6,
    resolvedIssueCount: 14200,
    industryBreachBenchmark: 4790000,
    savingsMode: 'measured',
    timeSavings: {
      maintainability: { dollars: 77000, hours: 1027, netNewDebt: false },
      reliability: { dollars: 112000, hours: 1493, netNewDebt: false },
      security: { dollars: 95000, hours: 1267, netNewDebt: false },
      total: { dollars: 284000, hours: 3787, netNewDebt: false },
    },
    vulnerabilityCategoryCount: 5,
  }),
  getProjectList: jest.fn().mockResolvedValue({ projects: [] }),
  getSecurityDetail: jest.fn().mockResolvedValue({
    categories: [
      {
        benchmarkSource: 'IBM/Ponemon 2025',
        category: 'SQL Injection',
        categoryKey: 'sql-injection',
        cwe: ['CWE-89'],
        industryBenchmarkCost: 4790000,
        issueCount: 12,
        narrative: '12 SQL injection vulnerabilities identified.',
        owasp: 'A03:2021',
        severityBreakdown: { HIGH: 8, MEDIUM: 4 },
      },
    ],
    scaDependencyRisks: {
      count: 5,
      narrative: '5 known dependency vulnerabilities.',
      supplyChainBenchmark: 4910000,
    },
    totalBySeverity: { HIGH: 8, MEDIUM: 4 },
  }),
  getTrends: jest.fn().mockResolvedValue({ monthly: [] }),
  setConfiguration: jest.fn().mockResolvedValue(undefined),
}));

it('should render the executive summary with savings', async () => {
  renderComponent(<CostSavingsApp />);

  expect(await screen.findByText('cost_savings.page')).toBeInTheDocument();
  expect(await screen.findByText('$284.0K')).toBeInTheDocument();
  expect(await screen.findByText('cost_savings.headline')).toBeInTheDocument();
});

it('should render time saved section', async () => {
  renderComponent(<CostSavingsApp />);

  expect(await screen.findByText('cost_savings.time_saved.title')).toBeInTheDocument();
});

it('should render security risk section', async () => {
  renderComponent(<CostSavingsApp />);

  expect(await screen.findByText('cost_savings.security_risk.title')).toBeInTheDocument();
});

it('should show empty state when no data', async () => {
  const { getCostSummary } = jest.requireMock('../../api/cost-savings-api');
  getCostSummary.mockResolvedValueOnce({
    ...defaultSummary,
    openVulnerabilityCount: 0,
    resolvedIssueCount: 0,
    timeSavings: {
      maintainability: { dollars: 0, hours: 0, netNewDebt: false },
      reliability: { dollars: 0, hours: 0, netNewDebt: false },
      security: { dollars: 0, hours: 0, netNewDebt: false },
      total: { dollars: 0, hours: 0, netNewDebt: false },
    },
  });

  renderComponent(<CostSavingsApp />);

  expect(await screen.findByText('cost_savings.empty.no_data.title')).toBeInTheDocument();
});

it('should show defaults banner when not configured', async () => {
  const { getCostSummary } = jest.requireMock('../../api/cost-savings-api');
  getCostSummary.mockResolvedValueOnce({
    ...defaultSummary,
    configured: false,
  });

  renderComponent(<CostSavingsApp />);

  expect(await screen.findByText('cost_savings.defaults_banner')).toBeInTheDocument();
});
