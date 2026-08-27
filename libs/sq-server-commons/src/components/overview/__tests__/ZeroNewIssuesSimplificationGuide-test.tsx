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
import { useDismissNotice, useIsNoticeDismissed } from '~adapters/helpers/notices';
import { useCurrentUser } from '~adapters/helpers/users';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { mockBranch } from '../../../helpers/mocks/branch-like';
import {
  mockQualityGate,
  mockQualityGateStatusConditionEnhanced,
} from '../../../helpers/mocks/quality-gates';
import { mockMeasureEnhanced, mockMetric } from '../../../helpers/testMocks';
import QualityGateSimplifiedCondition from '../QualityGateSimplifiedCondition';
import ZeroNewIssuesSimplificationGuide from '../ZeroNewIssuesSimplificationGuide';

jest.mock('~adapters/helpers/users', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('~adapters/helpers/notices', () => ({
  useIsNoticeDismissed: jest.fn(),
  useDismissNotice: jest.fn(),
}));

it('shows the teaching bubble popup when user is logged in and notice is not dismissed', async () => {
  setup();

  expect(
    await screen.findByText(
      'overview.quality_gates.conditions.condition_simplification_tour.title',
    ),
  ).toBeInTheDocument();
});

function setup({ isLoggedIn = true, isDismissed = false } = {}) {
  jest.mocked(useCurrentUser).mockReturnValue({
    currentUser: {} as never,
    isLoggedIn,
  });
  jest.mocked(useIsNoticeDismissed).mockReturnValue(isDismissed);
  jest
    .mocked(useDismissNotice)
    .mockReturnValue({ dismissNotice: jest.fn().mockResolvedValue(undefined) });

  const newViolationsCondition = mockQualityGateStatusConditionEnhanced({
    metric: MetricKey.new_violations,
    measure: mockMeasureEnhanced({
      metric: mockMetric({ key: MetricKey.new_violations, name: 'New Violations', type: 'INT' }),
    }),
  });

  return renderWithRouter(
    <ZeroNewIssuesSimplificationGuide isNewCode qualityGate={mockQualityGate()}>
      <QualityGateSimplifiedCondition
        branchLike={mockBranch()}
        component={{ key: 'some-component' }}
        condition={newViolationsCondition}
      />
    </ZeroNewIssuesSimplificationGuide>,
  );
}
