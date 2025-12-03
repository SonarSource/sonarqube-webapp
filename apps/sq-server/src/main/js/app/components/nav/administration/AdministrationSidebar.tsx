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
  IconInfo,
  IconLicense,
  IconQuestionMark,
  IconSparkle,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Extension } from '~shared/types/common';
import { addons } from '~sq-server-addons/index';
import { AdminPageExtension } from '~sq-server-commons/types/extension';
import { AdministrationSidebarConfiguration } from './AdministrationSidebarConfiguration';
import { AdministrationSidebarSecurity } from './AdministrationSidebarSecurity';
import { AdministrationSidebarProjects } from './AdministrationSidebarSidebarProjects';

interface Props {
  extensions: Extension[];
}

export function AdministrationSidebar(props: Readonly<Props>) {
  const { extensions } = props;

  const { formatMessage } = useIntl();

  const hasGovernanceExtension = extensions.find(
    (e) => e.key === AdminPageExtension.GovernanceConsole,
  );

  return (
    <Layout.SidebarNavigation ariaLabel={formatMessage({ id: 'settings' })}>
      <Layout.SidebarNavigation.Header name={<FormattedMessage id="layout.settings" />} />

      <Layout.SidebarNavigation.Body>
        <AdministrationSidebarConfiguration extensions={extensions} />

        <AdministrationSidebarSecurity />

        <AdministrationSidebarProjects />

        <Layout.SidebarNavigation.Item Icon={IconInfo} to="/admin/system">
          <FormattedMessage id="sidebar.system" />
        </Layout.SidebarNavigation.Item>

        <Layout.SidebarNavigation.Item Icon={IconSparkle} to="/admin/marketplace">
          <FormattedMessage id="marketplace.page" />
        </Layout.SidebarNavigation.Item>

        {hasGovernanceExtension && (
          <Layout.SidebarNavigation.Item Icon={IconLicense} to="/admin/audit">
            <FormattedMessage id="audit_logs.page" />
          </Layout.SidebarNavigation.Item>
        )}

        {addons.license && (
          <Layout.SidebarNavigation.Item Icon={IconQuestionMark} to="/admin/license/support">
            <FormattedMessage id="support" />
          </Layout.SidebarNavigation.Item>
        )}
      </Layout.SidebarNavigation.Body>
    </Layout.SidebarNavigation>
  );
}
