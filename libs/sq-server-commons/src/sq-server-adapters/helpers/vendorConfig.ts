/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { useContext } from 'react';
import { isDefined } from '~shared/helpers/types';
import { useAppState } from '../../context/app-state/withAppStateContext';
import { AvailableFeaturesContext } from '../../context/available-features/AvailableFeaturesContext';
import { useCurrentLicenseQuery } from '../../queries/entitlements';
import { EditionKey } from '../../types/editions';
import { isLoggedIn } from '../../types/users';
import { useCurrentUser } from './users';

const BEAMER_PRODUCT_ID = 'XzXivFzs65268';

export function getBeamerProductId() {
  return BEAMER_PRODUCT_ID;
}

const EDITION_MAP = {
  [EditionKey.community]: 'sqcb',
  [EditionKey.developer]: 'de',
  [EditionKey.enterprise]: 'ee',
  [EditionKey.datacenter]: 'dce',
};

const PRODUCT_MAP = {
  [EditionKey.community]: 'sqcb',
  [EditionKey.developer]: 'sqs',
  [EditionKey.enterprise]: 'sqs',
  [EditionKey.datacenter]: 'sqs',
};

export function useBeamerContextData(): string | undefined {
  const { currentUser } = useCurrentUser();
  const { canAdmin, version, edition } = useAppState();
  const availableFeatures = useContext(AvailableFeaturesContext);

  const { data: license } = useCurrentLicenseQuery({
    enabled: isLoggedIn(currentUser) && Boolean(canAdmin),
  });

  const filters = [
    `userPersona:${canAdmin ? 'systemAdmin' : 'standardUser'}`,
    `productVersion:${version}`,
    `features:${availableFeatures.length > 0 ? availableFeatures.join(',') : 'none'}`,
  ];

  if (isDefined(edition)) {
    filters.push(`product:${PRODUCT_MAP[edition]}`);
    filters.push(`edition:${EDITION_MAP[edition]}`);
  }

  if (isDefined(license?.loc)) {
    filters.push(`maxLoc:${license.maxLoc}`);
    filters.push(`usedLoc:${license.loc}`);
  }

  return filters.join(';');
}
