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

import { IconGear, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { Extension } from '~shared/types/common';
import { addons } from '~sq-server-addons/index';

interface Props {
  extensions: Extension[];
}

export function AdministrationSidebarConfiguration(props: Readonly<Props>) {
  const { extensions } = props;

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconGear}
      label={<FormattedMessage id="sidebar.project_settings" />}
    >
      <Layout.SidebarNavigation.Item
        Icon={IconGear}
        disableIconWhenSidebarOpen
        isMatchingFullPath
        to="/admin/settings"
      >
        <FormattedMessage id="settings.page" />
      </Layout.SidebarNavigation.Item>

      <Layout.SidebarNavigation.Item
        Icon={IconGear}
        disableIconWhenSidebarOpen
        to="/admin/settings/encryption"
      >
        <FormattedMessage id="property.category.security.encryption" />
      </Layout.SidebarNavigation.Item>

      <Layout.SidebarNavigation.Item
        Icon={IconGear}
        disableIconWhenSidebarOpen
        to="/admin/webhooks"
      >
        <FormattedMessage id="webhooks.page" />
      </Layout.SidebarNavigation.Item>

      {extensions.map(({ key, name }) => (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          key={key}
          to={`/admin/extension/${key}`}
        >
          {name}
        </Layout.SidebarNavigation.Item>
      ))}

      {addons.license && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to="/admin/license/app"
        >
          <FormattedMessage id="license.feature_name" />
        </Layout.SidebarNavigation.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}
