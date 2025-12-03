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

import { IconSecurityFinding, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';

export function AdministrationSidebarSecurity() {
  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconSecurityFinding}
      label={<FormattedMessage id="sidebar.security" />}
    >
      <Layout.SidebarNavigation.Item
        Icon={IconSecurityFinding}
        disableIconWhenSidebarOpen
        isMatchingFullPath
        to="/admin/users"
      >
        <FormattedMessage id="users.page" />
      </Layout.SidebarNavigation.Item>

      <Layout.SidebarNavigation.Item
        Icon={IconSecurityFinding}
        disableIconWhenSidebarOpen
        isMatchingFullPath
        to="/admin/groups"
      >
        <FormattedMessage id="user_groups.page" />
      </Layout.SidebarNavigation.Item>

      <Layout.SidebarNavigation.Item
        Icon={IconSecurityFinding}
        disableIconWhenSidebarOpen
        isMatchingFullPath
        to="/admin/permissions"
      >
        <FormattedMessage id="global_permissions.page" />
      </Layout.SidebarNavigation.Item>

      <Layout.SidebarNavigation.Item
        Icon={IconSecurityFinding}
        disableIconWhenSidebarOpen
        isMatchingFullPath
        to="/admin/permission_templates"
      >
        <FormattedMessage id="permission_templates" />
      </Layout.SidebarNavigation.Item>
    </Layout.SidebarNavigation.AccordionItem>
  );
}
