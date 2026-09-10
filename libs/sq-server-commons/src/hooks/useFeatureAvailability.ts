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

import { useMemo } from 'react';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { usePurchasableFeaturesQuery } from '../queries/entitlements';

interface Options {
  enabled?: boolean;
  /** Requires at least one of the features to be available, not merely purchasable. */
  requiresEntitlement?: boolean;
}

/**
 * Resolves whether any of `featureKeys` is usable on this instance. Callers that only need to
 * render-or-not can use `FeatureAvailabilityGuard`; this hook is for the ones that need the
 * answer as a value, for instance to decide whether their container renders at all.
 */
export function useFeatureAvailability(
  featureKeys: EntitlementCheckFeatureKey[],
  { enabled = true, requiresEntitlement = false }: Options = {},
) {
  const { data, isError, isPending, refetch } = usePurchasableFeaturesQuery({ enabled });

  const purchasableFeatureSet = useMemo(
    () => Object.fromEntries(data?.map((feature) => [feature.featureKey, feature]) ?? []),
    [data],
  );

  const someFeatureIsPurchasable = featureKeys.some(
    (featureKey) => purchasableFeatureSet[featureKey] !== undefined,
  );

  const someFeatureIsAvailable = featureKeys.some(
    (featureKey) => purchasableFeatureSet[featureKey]?.isAvailable === true,
  );

  const isAvailable = someFeatureIsPurchasable && (!requiresEntitlement || someFeatureIsAvailable);

  return { isAvailable, isError, isPending, refetch };
}
