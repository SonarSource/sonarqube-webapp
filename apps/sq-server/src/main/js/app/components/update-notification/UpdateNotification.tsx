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

import { isEmpty } from 'lodash';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { useSystemUpgrades } from '~sq-server-commons/queries/system';
import { EditionKey } from '~sq-server-commons/types/editions';
import { Permissions } from '~sq-server-commons/types/permissions';
import { isLoggedIn } from '~sq-server-commons/types/users';
import { parseVersion } from '~sq-server-commons/utils/update-notification-helpers';
import { SQCBUpdateBanners } from './SQCBUpdateBanners';
import { SQSUpdateBanner } from './SQSUpdateBanner';

interface Props {
  isGlobalBanner?: boolean;
}

export function UpdateNotification({ isGlobalBanner }: Readonly<Props>) {
  const appState = useAppState();
  const { currentUser } = useCurrentUser();

  const canUserSeeNotification =
    isLoggedIn(currentUser) && hasGlobalPermission(currentUser, Permissions.Admin);

  const parsedVersion = parseVersion(appState.version);

  const { data, isLoading } = useSystemUpgrades({
    enabled: canUserSeeNotification && parsedVersion !== undefined,
  });

  if (!canUserSeeNotification || parsedVersion === undefined || isLoading) {
    return null;
  }

  const isCommunityBuildRunning = appState.edition === EditionKey.community;

  if (isCommunityBuildRunning && !isEmpty(data?.upgrades)) {
    // We're running SQCB, show SQCB update banner & SQS update banner if applicable
    return <SQCBUpdateBanners data={data} isGlobalBanner={isGlobalBanner} />;
  }

  // We're running SQS (or old SQ), only show SQS update banner if applicable
  return <SQSUpdateBanner data={data} isGlobalBanner={isGlobalBanner} />;
}
