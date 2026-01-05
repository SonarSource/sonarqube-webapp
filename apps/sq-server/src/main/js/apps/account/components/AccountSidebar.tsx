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

import {
  IconBell,
  IconPeople,
  IconProject,
  IconSecurityFinding,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import Avatar from '~adapters/components/ui/Avatar';
import { useCurrentLoginUser } from '~sq-server-commons/context/current-user/CurrentUserContext';

export function AccountSidebar() {
  const user = useCurrentLoginUser();

  return (
    <Layout.SidebarNavigation>
      <Layout.SidebarNavigation.Header
        avatar={<Avatar hash={user.avatar} name={user.name} />}
        name={user.name}
        qualifier={<FormattedMessage id="user" />}
      />
      <Layout.SidebarNavigation.Body>
        <Layout.SidebarNavigation.Item Icon={IconPeople} isMatchingFullPath to="/account">
          <FormattedMessage id="my_account.profile" />
        </Layout.SidebarNavigation.Item>

        <Layout.SidebarNavigation.Item Icon={IconSecurityFinding} to="/account/security">
          <FormattedMessage id="my_account.security" />
        </Layout.SidebarNavigation.Item>

        <Layout.SidebarNavigation.Item Icon={IconBell} to="/account/notifications">
          <FormattedMessage id="my_account.notifications" />
        </Layout.SidebarNavigation.Item>

        <Layout.SidebarNavigation.Item Icon={IconProject} to="/account/projects">
          <FormattedMessage id="my_account.projects" />
        </Layout.SidebarNavigation.Item>
      </Layout.SidebarNavigation.Body>
    </Layout.SidebarNavigation>
  );
}
