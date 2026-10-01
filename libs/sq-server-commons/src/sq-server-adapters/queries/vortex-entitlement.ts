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

import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { VortexEntitlement } from '~shared/types/vortex-entitlement';
import { usePurchasableFeatureQuery } from '../../queries/entitlements';

/**
 * Gates the whole Vortex dashboard page. Behaviour must stay identical to what
 * `VortexDashboardApp` already does directly with `usePurchasableFeature` — this only moves that
 * call behind the adapter boundary so `feature-vortex-dashboard` (scope:shared) can reach it.
 * `usePurchasableFeatureQuery` lives in `sq-server-commons` itself, so no addons-context
 * indirection is needed (unlike `~adapters/queries/entitlements`, which does cross that boundary).
 *
 * This deliberately checks "is the feature enabled" (`PurchasableFeature`), not "is the instance
 * entitled" (`useEntitlementCheckQuery`): SQS still has an admin toggle for Vortex, so enabled and
 * entitled aren't the same thing here yet. SQC currently has no such toggle, but one is coming back
 * soon. Once both platforms share the same on/off behaviour, this should be reassessed in favour
 * of whether the feature is enabled.
 */
export function useVortexEntitlementQuery(): VortexEntitlement {
  const { data, isError, isPending, refetch } = usePurchasableFeatureQuery(
    EntitlementCheckFeatureKey.ContextAugmentation,
  );

  return {
    isEnabled: data?.isEnabled === true,
    isError,
    isLoading: isPending,
    isPurchased: data?.isAvailable === true,
    refetch: () => {
      void refetch();
    },
  };
}
