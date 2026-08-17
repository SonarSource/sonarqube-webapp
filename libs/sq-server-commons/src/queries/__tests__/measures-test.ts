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

import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { getMeasures } from '../../api/measures';
import { mockBranch, mockPullRequest } from '../../helpers/mocks/branch-like';
import { mockMeasure } from '../../helpers/testMocks';
import { useMeasureQuery, useMeasuresQuery } from '../measures';

jest.mock('../../api/measures', () => ({
  ...jest.requireActual<typeof import('../../api/measures')>('../../api/measures'),
  getMeasures: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useMeasureQuery', () => {
  it.each([
    ['a branch', mockBranch({ name: 'feature' }), { branch: 'feature' }],
    ['a pull request', mockPullRequest({ key: 'pr-1' }), { pullRequest: 'pr-1' }],
  ])('forwards the branch context for %s', async (_description, branchLike, branchParameters) => {
    jest.mocked(getMeasures).mockResolvedValue([mockMeasure()]);

    const { result } = renderHook(
      () =>
        useMeasureQuery({
          branchLike,
          componentKey: 'project-key',
          metricKey: 'bugs',
        }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getMeasures).toHaveBeenCalledWith({
      component: 'project-key',
      metricKeys: 'bugs',
      ...branchParameters,
    });
  });
});

describe('useMeasuresQuery', () => {
  it('forwards the branch context to the measures request', async () => {
    jest.mocked(getMeasures).mockResolvedValue([mockMeasure()]);

    const { result } = renderHook(
      () =>
        useMeasuresQuery({
          branchLike: mockBranch({ name: 'feature' }),
          componentKey: 'project-key',
          metricKeys: 'bugs,code_smells',
        }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getMeasures).toHaveBeenCalledWith({
      branch: 'feature',
      component: 'project-key',
      metricKeys: 'bugs,code_smells',
    });
  });
});
