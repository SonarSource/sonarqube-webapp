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
import { useProjectQualityGateStatusWidgetQuery } from '~adapters/queries/project-rating-badge-widget-data';
import { renderWithRouter } from '~shared/helpers/test-utils';
import type { QGStatusExtended } from '~shared/types/common';
import { MetricKey } from '~shared/types/metrics';
import { ProjectQualityGateStatusBadge } from '../ProjectQualityGateStatusBadge';

jest.mock('~adapters/components/ui/QualityGateIndicator', () => ({
  QualityGateIndicator: ({ status }: { status: string }) => (
    <div aria-label={`quality-gate-${status}`} />
  ),
}));

jest.mock('~adapters/helpers/dashboard-measures', () => ({
  formatDashboardMeasure: (value: string) => value,
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getProjectDashboardSummaryUrl: (component: string) => `/summary?id=${component}`,
}));

jest.mock('~adapters/queries/project-rating-badge-widget-data', () => ({
  useProjectQualityGateStatusWidgetQuery: jest.fn(),
}));

jest.mock('../QualityGateBreakdown', () => ({
  QualityGateBreakdown: ({ conditions }: { conditions: unknown[] }) => (
    <div data-testid="quality-gate-breakdown">{conditions.length}</div>
  ),
}));

beforeEach(() => {
  jest.mocked(useProjectQualityGateStatusWidgetQuery).mockReturnValue({
    data: { conditions: [], ignoredConditions: false, status: 'OK' },
    isLoading: false,
  } as unknown as ReturnType<typeof useProjectQualityGateStatusWidgetQuery>);
});

describe('ProjectQualityGateStatusBadge', () => {
  it.each([
    ['OK', 'overview.quality_gate.all_conditions_passed'],
    ['NOT_COMPUTED', 'overview.quality_gate.run_analysis'],
    ['NONE', 'overview.quality_gate.run_analysis'],
  ] as const)('renders %s status', (status, message) => {
    renderStatus(status);

    expect(screen.getByLabelText(`quality-gate-${status}`)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders the failed-condition count from the adapter', () => {
    jest.mocked(useProjectQualityGateStatusWidgetQuery).mockReturnValue({
      data: {
        conditions: [
          { level: 'ERROR', metric: MetricKey.new_reliability_rating, op: 'GT' },
          { level: 'ERROR', metric: MetricKey.security_rating, op: 'GT' },
          { level: 'OK', metric: MetricKey.coverage, op: 'GT' },
        ],
        ignoredConditions: false,
        status: 'ERROR',
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useProjectQualityGateStatusWidgetQuery>);

    renderStatus('ERROR');

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(useProjectQualityGateStatusWidgetQuery).toHaveBeenCalledWith('project-key');
  });

  it('renders the optional breakdown after conditions resolve', () => {
    jest.mocked(useProjectQualityGateStatusWidgetQuery).mockReturnValue({
      data: {
        conditions: [{ level: 'ERROR', metric: MetricKey.new_reliability_rating, op: 'GT' }],
        ignoredConditions: false,
        status: 'ERROR',
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useProjectQualityGateStatusWidgetQuery>);

    renderStatus('ERROR', true);

    expect(screen.getByTestId('quality-gate-breakdown')).toHaveTextContent('1');
  });
});

function renderStatus(status: QGStatusExtended, showBreakdown = false) {
  return renderWithRouter(
    <ProjectQualityGateStatusBadge showBreakdown={showBreakdown} status={status} />,
    { initialEntries: ['/?id=project-key'] },
  );
}
