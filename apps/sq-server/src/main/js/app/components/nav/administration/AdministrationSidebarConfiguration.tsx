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
import { NewBadge } from '~shared/components/badges/NewBadge';
import { Extension } from '~shared/types/common';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { Feature } from '~sq-server-commons/types/features';

interface Props {
  extensions: Extension[];
  governanceInstalled: boolean;
}

export function AdministrationSidebarConfiguration(props: Readonly<Props>) {
  const { extensions, governanceInstalled } = props;
  const { hasFeature } = useAvailableFeatures();

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconGear}
      label={<FormattedMessage id="sidebar.project_settings" />}
    >
      <Layout.SidebarNavigation.AccordionItem.Item isMatchingFullPath to="/admin/settings">
        <FormattedMessage id="settings.page" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      {(hasFeature(Feature.RemediationAgent) || hasFeature(Feature.HunterAgent)) &&
        addons.remediationAgent && (
          <Layout.SidebarNavigation.AccordionItem.Item
            suffix={
              <NewBadge
                expirationDate={addons.remediationAgent.AI_CAPABILITIES_NEW_BADGE_EXPIRATION_DATE}
              />
            }
            to="/admin/agent"
          >
            <FormattedMessage id="sidebar.ai_capabilities" />
          </Layout.SidebarNavigation.AccordionItem.Item>
        )}

      <Layout.SidebarNavigation.AccordionItem.Item to="/admin/settings/encryption">
        <FormattedMessage id="property.category.security.encryption" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      <Layout.SidebarNavigation.AccordionItem.Item to="/admin/webhooks">
        <FormattedMessage id="webhooks.page" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      {governanceInstalled && (
        <Layout.SidebarNavigation.AccordionItem.Item to="/admin/portfolios">
          <FormattedMessage id="portfolios.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {extensions.map(({ key, name }) => (
        <Layout.SidebarNavigation.AccordionItem.Item key={key} to={`/admin/extension/${key}`}>
          {name}
        </Layout.SidebarNavigation.AccordionItem.Item>
      ))}

      {addons.license && (
        <Layout.SidebarNavigation.AccordionItem.Item to="/admin/license/app">
          <FormattedMessage id="license.feature_name" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}
