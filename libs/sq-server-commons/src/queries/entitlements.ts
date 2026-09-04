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

import { queryOptions } from '@tanstack/react-query';
import { useCurrentUser } from '~adapters/helpers/users';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { getCurrentLicense, getPurchasableFeatures } from '../api/entitlements';
import { hasGlobalPermission } from '../helpers/users';
import { PurchasableFeatureKey } from '../types/editions';
import { Permissions } from '../types/permissions';

export const LICENSE_QUERY_KEY = ['current-sqs-license'] as const;

export const useCurrentLicenseQuery = createQueryHook(() =>
  queryOptions({
    queryKey: LICENSE_QUERY_KEY,
    queryFn: getCurrentLicense,
    staleTime: StaleTime.NEVER,
  }),
);

export const usePurchasableFeaturesQuery = createQueryHook(() =>
  queryOptions({
    queryKey: ['purchasable-features'],
    queryFn: getPurchasableFeatures,
    staleTime: StaleTime.NEVER,
  }),
);

/**
 * Look up a single purchasable feature by key. A successful query with no matching entry means
 * that the edition does not support the feature.
 */
export function usePurchasableFeatureQuery(
  featureKey: PurchasableFeatureKey,
  options?: { enabled?: boolean },
) {
  return usePurchasableFeaturesQuery({
    ...options,
    select: (features) => features.find((feature) => feature.featureKey === featureKey),
  });
}

/**
 * Overage state for a specific feature. Reads from `GET /api/v2/entitlements/license`, which is
 * admin-only — the query is gated on the current user being a global admin, so non-admin callers
 * get `data: undefined` without a 403. Callers can safely treat `undefined` and `NOT_ELIGIBLE`
 * the same way (no overage action available).
 */
export function useFeatureOverageState(featureKey: EntitlementCheckFeatureKey) {
  const { currentUser } = useCurrentUser();
  const isAdmin = hasGlobalPermission(currentUser, Permissions.Admin);

  return useCurrentLicenseQuery({
    enabled: isAdmin,
    select: (license) =>
      license?.features.find((f) => f.featureKey === featureKey)?.overageState ?? undefined,
  });
}
