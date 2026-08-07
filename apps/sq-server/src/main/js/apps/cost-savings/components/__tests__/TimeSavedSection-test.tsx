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
import { TimeSavedSection } from '../TimeSavedSection';

jest.mock('../../api/cost-savings-api', () => ({
  getBenchmarks: jest.fn().mockResolvedValue({
    avgSavingsByIndustry: {},
    avgVulnerabilityCategories: 5,
    maturityCurve: {},
    totalCustomers: 100,
  }),
  getTrends: jest.fn().mockResolvedValue({
    monthly: [
      {
        dollars: 23000,
        hours: 307,
        issuesResolved: 340,
        month: '2025-03',
        vulnerabilitiesFound: 18,
      },
      {
        dollars: 21000,
        hours: 280,
        issuesResolved: 290,
        month: '2025-02',
        vulnerabilitiesFound: 15,
      },
    ],
  }),
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

it('should render the section title with confidence badge', () => {
  renderComponent(<TimeSavedSection period="year" summary={baseSummary} />);

  expect(screen.getByText('cost_savings.time_saved.title')).toBeInTheDocument();
  expect(screen.getByText('cost_savings.confidence.high')).toBeInTheDocument();
});

it('should render dimension breakdown rows', () => {
  renderComponent(<TimeSavedSection period="year" summary={baseSummary} />);

  expect(screen.getByText('cost_savings.security')).toBeInTheDocument();
  expect(screen.getByText('cost_savings.reliability')).toBeInTheDocument();
  expect(screen.getByText('cost_savings.maintainability')).toBeInTheDocument();
});

it('should show multiplier values', () => {
  renderComponent(<TimeSavedSection period="year" summary={baseSummary} />);

  expect(screen.getByText('30x')).toBeInTheDocument();
  expect(screen.getAllByText('5x')).toHaveLength(2);
});
