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

import { IconProject, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { Feature } from '~sq-server-commons/types/features';

export function AdministrationSidebarProjects() {
  const { hasFeature } = useAvailableFeatures();
  const { data: remediationAgent } = addons.entitlements.usePurchasableFeature(
    EntitlementCheckFeatureKey.RemediationAgent,
    { enabled: Boolean(addons.remediationAgent) },
  );
  const hasAgenticTasks = remediationAgent?.isAvailable === true || hasFeature(Feature.HunterAgent);

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconProject}
      label={<FormattedMessage id="sidebar.projects" />}
    >
      <Layout.SidebarNavigation.AccordionItem.Item
        isMatchingFullPath
        to="/admin/projects_management"
      >
        <FormattedMessage id="management" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      {hasAgenticTasks && addons.remediationAgent && (
        <Layout.SidebarNavigation.AccordionItem.Item isMatchingFullPath to="/admin/agentic_tasks">
          <FormattedMessage id="sidebar.agentic_tasks" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      <Layout.SidebarNavigation.AccordionItem.Item isMatchingFullPath to="/admin/background_tasks">
        <FormattedMessage id="background_tasks.page" />
      </Layout.SidebarNavigation.AccordionItem.Item>
    </Layout.SidebarNavigation.AccordionItem>
  );
}
