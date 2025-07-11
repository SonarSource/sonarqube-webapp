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

import { useContext, useEffect, useState } from 'react';
import { isDefined } from '~shared/helpers/types';
import { showLicense } from '../../api/editions';
import { useAppState } from '../../context/app-state/withAppStateContext';
import { AvailableFeaturesContext } from '../../context/available-features/AvailableFeaturesContext';
import { useCurrentUser } from '../../context/current-user/CurrentUserContext';
import { EditionKey } from '../../types/editions';
import { isLoggedIn } from '../../types/users';

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

export function useBeamerContextData() {
  const { currentUser } = useCurrentUser();
  const { canAdmin, version, edition } = useAppState();
  const availableFeatures = useContext(AvailableFeaturesContext);

  // Replace with query and API v2 when we have it
  const [locs, setLocs] = useState<{ maxLoc: number; usedLoc: number } | undefined>(undefined);
  useEffect(() => {
    async function getLoc() {
      const { loc, maxLoc } = await showLicense();
      setLocs({ usedLoc: loc, maxLoc });
    }

    if (isLoggedIn(currentUser) && canAdmin) {
      getLoc().catch(() => {
        /* do nothing */
      });
    }
  }, [canAdmin, currentUser]);

  const filters = [
    `userPersona:${canAdmin ? 'systemAdmin' : 'standardUser'}`,
    `productVersion:${version}`,
    `features:${availableFeatures.length > 0 ? availableFeatures.join(',') : 'none'}`,
  ];

  if (isDefined(edition)) {
    filters.push(`product:${PRODUCT_MAP[edition]}`);
    filters.push(`edition:${EDITION_MAP[edition]}`);
  }

  if (isDefined(locs)) {
    filters.push(`maxLoc:${locs.maxLoc}`);
    filters.push(`usedLoc:${locs.usedLoc}`);
  }

  return filters.join(';');
}
