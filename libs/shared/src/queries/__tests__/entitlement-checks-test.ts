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

import { UseQueryResult } from '@tanstack/react-query';
import { EntitlementCheck, EntitlementCheckFeatureKey } from '../../types/billing';
import { combineEntitlementChecks, notEntitled } from '../entitlement-checks';

it('builds a not-entitled check', () => {
  expect(notEntitled(EntitlementCheckFeatureKey.HunterAgent)).toEqual({
    featureKey: EntitlementCheckFeatureKey.HunterAgent,
    entitled: false,
    consumption: null,
    value: null,
    excludedValues: [],
  });
});

it('merges successful entitlement checks and aggregates flags', () => {
  const loc = notEntitled(EntitlementCheckFeatureKey.LinesOfCode);
  const agent = notEntitled(EntitlementCheckFeatureKey.RemediationAgent);

  expect(
    combineEntitlementChecks([
      {
        data: loc,
        isError: false,
        isFetching: false,
        isLoading: false,
        isPending: false,
      },
      {
        data: undefined,
        isError: true,
        isFetching: true,
        isLoading: false,
        isPending: false,
      },
      {
        data: agent,
        isError: false,
        isFetching: false,
        isLoading: false,
        isPending: true,
      },
    ] as UseQueryResult<EntitlementCheck>[]),
  ).toEqual({
    data: [loc, agent],
    isError: true,
    isFetching: true,
    isLoading: false,
    isPending: true,
  });
});
