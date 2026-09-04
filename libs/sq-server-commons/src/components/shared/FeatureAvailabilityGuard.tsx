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

import { Button, MessageCallout, MessageVariety, Spinner } from '@sonarsource/echoes-react';
import { PropsWithChildren, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Outlet } from 'react-router-dom';
import NotFound from '~shared/components/NotFound';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { usePurchasableFeaturesQuery } from '../../queries/entitlements';

export function FeatureAvailabilityGuard({
  featureKeys,
  children = <Outlet />,
  guardOnly = false,
  requiresEntitlement = false,
}: Readonly<
  PropsWithChildren<{
    featureKeys: EntitlementCheckFeatureKey[];
    guardOnly?: boolean;
    requiresEntitlement?: boolean; /* Requires at least one feature to be available if true */
  }>
>) {
  const { data, isError, isPending, refetch } = usePurchasableFeaturesQuery();
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

  const blockAccess = !someFeatureIsPurchasable || (requiresEntitlement && !someFeatureIsAvailable);

  if (guardOnly) {
    return isPending || isError || blockAccess ? null : children;
  }

  if (isPending) {
    return <Spinner isLoading />;
  }

  if (isError) {
    return (
      <MessageCallout
        action={
          <Button
            onClick={() => {
              void refetch();
            }}
          >
            <FormattedMessage id="retry" />
          </Button>
        }
        announcementMode="alert"
        variety={MessageVariety.Danger}
      >
        <FormattedMessage id="default_error_message" />
      </MessageCallout>
    );
  }

  if (blockAccess) {
    return <NotFound />;
  }

  return children;
}
