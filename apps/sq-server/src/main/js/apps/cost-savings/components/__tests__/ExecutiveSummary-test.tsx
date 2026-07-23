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
import type { CostSummary } from '../../api/cost-savings-api';
import { ExecutiveSummary } from '../ExecutiveSummary';

jest.mock('../../api/cost-savings-api', () => ({
  getBenchmarks: jest.fn().mockResolvedValue({
    avgSavingsByIndustry: {},
    avgVulnerabilityCategories: 5,
    maturityCurve: {},
    totalCustomers: 100,
  }),
  getConfiguration: jest.fn().mockResolvedValue({ industry: 'TECHNOLOGY', region: 'US' }),
  getSecurityDetail: jest.fn().mockResolvedValue({
    categories: [],
    scaDependencyRisks: { count: 0, narrative: '', supplyChainBenchmark: 0 },
    totalBySeverity: {},
  }),
  getTrends: jest.fn().mockResolvedValue({ monthly: [] }),
}));

const baseSummary: CostSummary = {
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
  savingsMode: 'measured' as const,
  timeSavings: {
    maintainability: { dollars: 77000, hours: 1027, netNewDebt: false },
    reliability: { dollars: 112000, hours: 1493, netNewDebt: false },
    security: { dollars: 95000, hours: 1267, netNewDebt: false },
    total: { dollars: 284000, hours: 3787, netNewDebt: false },
  },
  vulnerabilityCategoryCount: 5,
};

function renderSummary(overrides: Partial<CostSummary> = {}) {
  const summary = { ...baseSummary, ...overrides };
  return renderComponent(
    <ExecutiveSummary
      onOpenConfig={jest.fn()}
      onOpenMethodology={jest.fn()}
      onPeriodChange={jest.fn()}
      period="year"
      summary={summary}
    />,
  );
}

it('should render estimated savings as hero number in donut', () => {
  renderSummary();

  expect(screen.getByText('$284.0K')).toBeInTheDocument();
  expect(screen.getByText('cost_savings.estimated_savings.measured')).toBeInTheDocument();
});

it('should show industry context benchmark when vulnerability categories exist', () => {
  renderSummary();

  expect(screen.getByText(/cost_savings\.industry_context\.benchmark/)).toBeInTheDocument();
});

it('should render dimension breakdown', () => {
  renderSummary();

  expect(screen.getByText('$95.0K')).toBeInTheDocument(); // security
  expect(screen.getByText('$112.0K')).toBeInTheDocument(); // reliability
  expect(screen.getByText('$77.0K')).toBeInTheDocument(); // maintainability
});

it('should render resolved issue count', () => {
  renderSummary();

  expect(screen.getByText(/14,200/)).toBeInTheDocument();
});

it('should show net new debt messaging when negative', () => {
  renderSummary({
    timeSavings: {
      ...baseSummary.timeSavings,
      total: { dollars: -50000, hours: -667, netNewDebt: true },
    },
  });

  expect(screen.getByText('$50.0K')).toBeInTheDocument();
  expect(screen.getByText('cost_savings.net_new_debt')).toBeInTheDocument();
});

it('should show unconfigured banner when not configured', () => {
  renderSummary({ configured: false });

  expect(screen.getByText('cost_savings.defaults_banner')).toBeInTheDocument();
});

it('should not show unconfigured banner when configured', () => {
  renderSummary({ configured: true });

  expect(screen.queryByText('cost_savings.defaults_banner')).not.toBeInTheDocument();
});

it('should show single-scan estimation banner when savingsMode is estimated', () => {
  renderSummary({ savingsMode: 'estimated' });

  expect(screen.getByText('cost_savings.confidence.estimated')).toBeInTheDocument();
  expect(screen.getByText('cost_savings.single_scan_banner')).toBeInTheDocument();
});

it('should not show estimation banner when savingsMode is measured', () => {
  renderSummary({ savingsMode: 'measured' });

  expect(screen.queryByText('cost_savings.single_scan_banner')).not.toBeInTheDocument();
});
