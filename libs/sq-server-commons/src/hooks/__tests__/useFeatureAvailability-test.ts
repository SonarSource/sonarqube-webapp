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
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { getPurchasableFeatures } from '../../api/entitlements';
import { useFeatureAvailability } from '../useFeatureAvailability';

jest.mock('../../api/entitlements', () => ({
  ...jest.requireActual<typeof import('../../api/entitlements')>('../../api/entitlements'),
  getPurchasableFeatures: jest.fn(),
}));

const { AgenticAnalysis, ContextAugmentation, HunterAgent } = EntitlementCheckFeatureKey;

beforeEach(() => {
  jest.clearAllMocks();
});

it.each([
  ['available', true, true],
  ['purchasable but not available', false, false],
])('requires entitlement when the feature is %s', async (_, isAvailable, expected) => {
  mockPurchasableFeatures([{ featureKey: AgenticAnalysis, isAvailable }]);

  const { result } = await renderAvailability([AgenticAnalysis, ContextAugmentation], {
    requiresEntitlement: true,
  });

  expect(result.current.isAvailable).toBe(expected);
});

it('is satisfied by any one of the requested features', async () => {
  mockPurchasableFeatures([{ featureKey: ContextAugmentation, isAvailable: true }]);

  const { result } = await renderAvailability([AgenticAnalysis, ContextAugmentation], {
    requiresEntitlement: true,
  });

  expect(result.current.isAvailable).toBe(true);
});

it('accepts a merely purchasable feature when entitlement is not required', async () => {
  mockPurchasableFeatures([{ featureKey: AgenticAnalysis, isAvailable: false }]);

  const { result } = await renderAvailability([AgenticAnalysis]);

  expect(result.current.isAvailable).toBe(true);
});

it('is unavailable when the edition does not offer the feature at all', async () => {
  mockPurchasableFeatures([{ featureKey: HunterAgent, isAvailable: true }]);

  const { result } = await renderAvailability([AgenticAnalysis]);

  expect(result.current.isAvailable).toBe(false);
});

it('is unavailable and does not query while disabled', () => {
  mockPurchasableFeatures([{ featureKey: AgenticAnalysis, isAvailable: true }]);

  const { result } = renderHook(
    () => useFeatureAvailability([AgenticAnalysis], { enabled: false }),
    { wrapper: getContextWrapper() },
  );

  expect(result.current.isAvailable).toBe(false);
  expect(getPurchasableFeatures).not.toHaveBeenCalled();
});

function mockPurchasableFeatures(features: { featureKey: string; isAvailable: boolean }[]) {
  jest.mocked(getPurchasableFeatures).mockResolvedValue(features as never);
}

async function renderAvailability(
  ...args: Parameters<typeof useFeatureAvailability>
): Promise<ReturnType<typeof renderHook<ReturnType<typeof useFeatureAvailability>, unknown>>> {
  const rendered = renderHook(() => useFeatureAvailability(...args), {
    wrapper: getContextWrapper(),
  });

  await waitFor(() => {
    expect(rendered.result.current.isPending).toBe(false);
  });

  return rendered;
}
