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
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { QualityGateBreakdown } from '../QualityGateBreakdown';

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getProjectDashboardSummaryUrl: (component: string, overall = false) =>
    `/project/summary/${overall ? 'overall' : 'new_code'}?id=${component}`,
}));

const componentKey = 'test-project';
type QualityGateStatusCondition = { level: string; metric: string; op: string };

describe('QualityGateBreakdown', () => {
  describe('rendering conditions', () => {
    it('returns null when both new code and overall code have 0 failed conditions', () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'OK',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'OK',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      // Should render nothing
      expect(
        screen.queryByText('quality_gate.breakdown.distribution_title'),
      ).not.toBeInTheDocument();
    });

    it('renders breakdown when both categories have failed conditions', async () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'ERROR',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.new_security_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      // Should show distribution title
      expect(
        await screen.findByText('quality_gate.breakdown.distribution_title'),
      ).toBeInTheDocument();

      // Should show new code badge with count 2
      expect(screen.getByText('quality_gate.breakdown.new_code.2')).toBeInTheDocument();

      // Should show overall code badge with count 1
      expect(screen.getByText('quality_gate.breakdown.overall_code.1')).toBeInTheDocument();
    });

    it('renders breakdown when only new code has failed conditions', async () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'ERROR',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'OK',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      expect(
        await screen.findByText('quality_gate.breakdown.distribution_title'),
      ).toBeInTheDocument();

      // New code should show with danger style (count > 0)
      expect(screen.getByText('quality_gate.breakdown.new_code.1')).toBeInTheDocument();

      // Overall code should show with success style (count = 0)
      expect(screen.getByText('quality_gate.breakdown.overall_code.0')).toBeInTheDocument();
    });

    it('renders breakdown when only overall code has failed conditions', async () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'OK',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.security_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      expect(
        await screen.findByText('quality_gate.breakdown.distribution_title'),
      ).toBeInTheDocument();

      // New code should show with success style (count = 0)
      expect(screen.getByText('quality_gate.breakdown.new_code.0')).toBeInTheDocument();

      // Overall code should show with danger style (count > 0)
      expect(screen.getByText('quality_gate.breakdown.overall_code.2')).toBeInTheDocument();
    });
  });

  describe('badge styling', () => {
    it('uses danger variety for badges with failed conditions', async () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'ERROR',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      await screen.findByText('quality_gate.breakdown.distribution_title');

      // Both badges should have danger styling
      const newCodeLink = screen.getByRole('link', {
        name: /quality_gate\.breakdown\.new_code/,
      });
      const overallLink = screen.getByRole('link', {
        name: /quality_gate\.breakdown\.overall_code/,
      });

      expect(newCodeLink).toContainHTML('data-variety="danger"');
      expect(overallLink).toContainHTML('data-variety="danger"');
    });

    it('uses success variety for badge with 0 failed conditions when other has issues', async () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'ERROR',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'OK',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      await screen.findByText('quality_gate.breakdown.distribution_title');

      // New code badge should have danger styling
      const newCodeLink = screen.getByRole('link', {
        name: /quality_gate\.breakdown\.new_code/,
      });
      expect(newCodeLink).toContainHTML('data-variety="danger"');

      // Overall code badge should have success styling
      const overallLink = screen.getByRole('link', {
        name: /quality_gate\.breakdown\.overall_code/,
      });
      expect(overallLink).toContainHTML('data-variety="success"');
    });
  });

  describe('links', () => {
    it('links new code badge to new code summary tab', async () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'ERROR',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      await screen.findByText('quality_gate.breakdown.distribution_title');

      const newCodeLink = screen.getByRole('link', {
        name: /quality_gate\.breakdown\.new_code/,
      });

      expect(newCodeLink).toHaveAttribute('href', expect.stringContaining('/summary/new_code'));
      expect(newCodeLink).toHaveAttribute('href', expect.stringContaining(`id=${componentKey}`));
    });

    it('links overall code badge to overall code summary tab', async () => {
      const conditions: QualityGateStatusCondition[] = [
        {
          level: 'ERROR',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      await screen.findByText('quality_gate.breakdown.distribution_title');

      const overallLink = screen.getByRole('link', {
        name: /quality_gate\.breakdown\.overall_code/,
      });

      expect(overallLink).toHaveAttribute('href', expect.stringContaining('/summary/overall'));
      expect(overallLink).toHaveAttribute('href', expect.stringContaining(`id=${componentKey}`));
    });
  });

  describe('condition counting', () => {
    it('only counts ERROR level conditions, not OK conditions', async () => {
      const conditions: QualityGateStatusCondition[] = [
        // New code: 1 ERROR, 2 OK
        {
          level: 'ERROR',
          metric: MetricKey.new_reliability_rating,
          op: 'GT',
        },
        {
          level: 'OK',
          metric: MetricKey.new_security_rating,
          op: 'GT',
        },
        {
          level: 'OK',
          metric: MetricKey.new_maintainability_rating,
          op: 'GT',
        },
        // Overall: 2 ERROR, 1 OK
        {
          level: 'ERROR',
          metric: MetricKey.reliability_rating,
          op: 'GT',
        },
        {
          level: 'ERROR',
          metric: MetricKey.security_rating,
          op: 'GT',
        },
        {
          level: 'OK',
          metric: MetricKey.sqale_rating,
          op: 'GT',
        },
      ];

      renderBreakdown(conditions);

      await screen.findByText('quality_gate.breakdown.distribution_title');

      // Should show 1 new code failed (not 3 total new code conditions)
      expect(screen.getByText('quality_gate.breakdown.new_code.1')).toBeInTheDocument();

      // Should show 2 overall failed (not 3 total overall conditions)
      expect(screen.getByText('quality_gate.breakdown.overall_code.2')).toBeInTheDocument();
    });
  });
});

function renderBreakdown(conditions: QualityGateStatusCondition[]) {
  return renderWithRouter(
    <QualityGateBreakdown componentKey={componentKey} conditions={conditions} />,
    { initialEntries: [`/?id=${componentKey}`] },
  );
}
