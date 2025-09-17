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

import { Button, DropdownMenuAlign, Layout } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Avatar } from '~design-system';
import { AppStateContext } from '~sq-server-commons/context/app-state/AppStateContext';
import { CurrentUserContext } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';
import { isLoggedIn } from '~sq-server-commons/types/users';
import { GlobalNavUserMenu } from './GlobalNavUserMenu';

export function GlobalNavUser() {
  const userContext = React.useContext(CurrentUserContext);
  const currentUser = userContext?.currentUser;

  const { settings } = React.useContext(AppStateContext);

  const handleLogin = React.useCallback(() => {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${getBaseUrl()}/sessions/new?return_to=${returnTo}${
      window.location.hash
    }`;
  }, []);

  if (!currentUser || !isLoggedIn(currentUser)) {
    return (
      <Button onClick={handleLogin} size="medium">
        {translate('layout.login')}
      </Button>
    );
  }

  const enableGravatar = settings[GlobalSettingKeys.EnableGravatar] === 'true';
  const gravatarServerUrl = settings[GlobalSettingKeys.GravatarServerUrl] ?? '';

  return (
    <Layout.GlobalNavigation.Account
      align={DropdownMenuAlign.End}
      avatar={
        <Avatar
          enableGravatar={enableGravatar}
          gravatarServerUrl={gravatarServerUrl}
          hash={currentUser.avatar}
          name={currentUser.name}
        />
      }
      header={{ helpText: currentUser.email ?? '', label: currentUser.name }}
      items={<GlobalNavUserMenu />}
    />
  );
}
