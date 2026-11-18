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

import { renderHook } from '@testing-library/react';
import { useFlag } from '~adapters/helpers/feature-flags';
import {
  mockFlags,
  removeFlags,
  resetFeatureFlagMocks,
} from '~adapters/helpers/feature-flags-test-utils';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { DEFAULT_PERFORMANCE_LIMITS, PerformanceLimits } from '../architecture';
import { SharedFlagSet } from '../feature-flags';

type UseFlag = <Name extends keyof SharedFlagSet>(name: Name) => SharedFlagSet[Name];

// Check both directions: adapters must support all shared flags and must not expose
// product-specific flags through their public signatures.
const useFlagWithSharedContract: UseFlag = useFlag;
const useSharedFlag: typeof useFlag = useFlagWithSharedContract;

beforeEach(resetFeatureFlagMocks);
afterEach(resetFeatureFlagMocks);

// This suite runs with both products' adapter aliases to check the shared public contract
it('preserves the types and values of boolean and structured flags', () => {
  const { result } = renderHook(
    () => ({
      extensionPack: useSharedFlag('designArchitectureSquadExtensionPack') satisfies boolean,
      performanceLimits: useSharedFlag(
        'designArchitectureSquadPerformanceLimits',
      ) satisfies PerformanceLimits,
    }),
    { wrapper: getContextWrapper() },
  );

  expect(typeof result.current.extensionPack).toBe('boolean');
  expect(result.current.performanceLimits).toEqual(DEFAULT_PERFORMANCE_LIMITS);
});

it.each([
  {
    name: 'removing flags',
    reset: () => {
      removeFlags(
        'designArchitectureSquadExtensionPack',
        'designArchitectureSquadPerformanceLimits',
      );
    },
  },
  { name: 'resetting mocks', reset: resetFeatureFlagMocks },
  {
    name: 'replacing overrides',
    reset: () => {
      mockFlags({});
    },
  },
])('applies flag overrides and restores product defaults after $name', ({ reset }) => {
  const { result, rerender } = renderHook(
    () => ({
      extensionPack: useFlag('designArchitectureSquadExtensionPack'),
      performanceLimits: useFlag('designArchitectureSquadPerformanceLimits'),
    }),
    { wrapper: getContextWrapper() },
  );

  const defaults = result.current;
  const performanceLimits = { maxEdgesCount: 40, maxNodesCount: 20 };

  mockFlags({
    designArchitectureSquadExtensionPack: !defaults.extensionPack,
    designArchitectureSquadPerformanceLimits: performanceLimits,
  });

  rerender();

  expect(result.current).toEqual({
    extensionPack: !defaults.extensionPack,
    performanceLimits,
  });

  reset();
  rerender();

  expect(result.current).toEqual(defaults);
});
