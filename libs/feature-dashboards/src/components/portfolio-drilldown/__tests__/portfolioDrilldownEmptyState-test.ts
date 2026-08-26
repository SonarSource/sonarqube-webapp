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

import {
  PortfolioDrilldownEmptyState,
  resolvePortfolioDrilldownEmptyState,
} from '../portfolioDrilldownEmptyState';

describe('resolvePortfolioDrilldownEmptyState', () => {
  it.each([
    ['permissions', { hasNoAccessibleProjects: true }, PortfolioDrilldownEmptyState.Permissions],
    [
      'uncomputed rating',
      { hasNoComputedRating: true },
      PortfolioDrilldownEmptyState.NoComputedRating,
    ],
    ['missing data', { hasNoData: true }, PortfolioDrilldownEmptyState.NoData],
    ['zero issue count', { hasZeroIssueCount: true }, PortfolioDrilldownEmptyState.ZeroIssueCount],
  ] as const)('resolves %s', (_label, input, expected) => {
    expect(resolvePortfolioDrilldownEmptyState(input)).toBe(expected);
  });

  it('returns no empty state when the breakdown has rows', () => {
    expect(resolvePortfolioDrilldownEmptyState({})).toBeUndefined();
  });

  it('uses deterministic precedence when several reasons apply', () => {
    expect(
      resolvePortfolioDrilldownEmptyState({
        hasNoAccessibleProjects: true,
        hasNoComputedRating: true,
        hasNoData: true,
        hasZeroIssueCount: true,
      }),
    ).toBe(PortfolioDrilldownEmptyState.Permissions);

    expect(
      resolvePortfolioDrilldownEmptyState({
        hasNoComputedRating: true,
        hasNoData: true,
        hasZeroIssueCount: true,
      }),
    ).toBe(PortfolioDrilldownEmptyState.NoComputedRating);

    expect(
      resolvePortfolioDrilldownEmptyState({
        hasNoData: true,
        hasZeroIssueCount: true,
      }),
    ).toBe(PortfolioDrilldownEmptyState.NoData);
  });
});
