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

import { Layout } from '@sonarsource/echoes-react';
import { BEAMER_NOTIFICATIONS_SETTING } from '~shared/helpers/beamer';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { BeamerWidgetCustom } from '~sq-server-commons/components/beamer/BeamerWidgetCustom';
import EmbedDocsPopupHelper from '~sq-server-commons/components/embed-docs-modal/EmbedDocsPopupHelper';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import GlobalSearch from '../../global-search/GlobalSearch';
import { GlobalNavMenu } from './GlobalNavMenu';
import { GlobalNavUser } from './GlobalNavUser';
import { LogoWithAriaText } from './MainSonarQubeBar';

export function GlobalNav() {
  const { currentUser } = useCurrentUser();

  const [beamerNotifications] = useLocalStorage(BEAMER_NOTIFICATIONS_SETTING, true);

  return (
    <Layout.GlobalNavigation>
      <Layout.GlobalNavigation.Primary>
        <Layout.GlobalNavigation.Home>
          <LogoWithAriaText />
        </Layout.GlobalNavigation.Home>
        <GlobalNavMenu currentUser={currentUser} />
      </Layout.GlobalNavigation.Primary>
      <Layout.GlobalNavigation.Secondary>
        <GlobalSearch />
        <BeamerWidgetCustom hideCounter={!beamerNotifications} />
        <EmbedDocsPopupHelper />
        <GlobalNavUser />
      </Layout.GlobalNavigation.Secondary>
    </Layout.GlobalNavigation>
  );
}
