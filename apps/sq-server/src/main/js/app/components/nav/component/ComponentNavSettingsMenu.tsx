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

import { IconGear, IconWebhook, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isApplication, isPortfolioLike, isProject } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { hasMessage } from '~sq-server-commons/helpers/l10n';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface Props extends WithAvailableFeaturesProps {
  branchLike?: BranchLike;
  component: Component;
}

function ComponentNavSettingsMenu(props: Readonly<Props>) {
  const { branchLike, component, hasFeature } = props;
  const { configuration = {}, qualifier } = component;

  if (!configuration.showSettings) {
    return null;
  }

  const branchParameters = getBranchLikeQuery(branchLike);
  const query = { id: component.key, ...branchParameters };
  const search = new URLSearchParams(query).toString();

  const isPortfolio = isPortfolioLike(qualifier);
  const isApp = isApplication(qualifier);
  const isProj = isProject(qualifier);

  const showSettings = !isApp && !isPortfolio;
  const showBaseline = !isApp && !isPortfolio;
  const showAiGeneratedCode = isProj && hasFeature(Feature.AiCodeAssurance) && addons.aica;
  const showDeletion = [
    ComponentQualifier.Project,
    ComponentQualifier.Portfolio,
    ComponentQualifier.Application,
  ].includes(qualifier);

  const adminExtensions = (component.configuration?.extensions ?? []).filter(
    (e) => !isApp || e.key !== 'governance/console',
  );

  if (
    !showSettings &&
    !showBaseline &&
    !configuration.showLinks &&
    !configuration.showPermissions &&
    !configuration.showBackgroundTasks &&
    !configuration.showUpdateKey &&
    !isProj &&
    !showDeletion &&
    !showAiGeneratedCode &&
    adminExtensions.length === 0
  ) {
    return null;
  }

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconGear}
      label={
        <FormattedMessage
          id={
            hasMessage('layout.settings', component.qualifier)
              ? `layout.settings.${component.qualifier}`
              : 'layout.settings'
          }
        />
      }
    >
      {showSettings && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/settings', search }}
        >
          <FormattedMessage id="project_settings.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {showBaseline && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/baseline', search }}
        >
          <FormattedMessage id="project_baseline.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {adminExtensions.map((extension) => (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          key={extension.key}
          to={{
            pathname: `/project/admin/extension/${extension.key}`,
            search: new URLSearchParams({ ...query, qualifier }).toString(),
          }}
        >
          {/* eslint-disable-next-line react/forbid-component-props */}
          <FormattedMessage defaultMessage={extension.name} id={extension.name} />
        </Layout.SidebarNavigation.Item>
      ))}

      {showAiGeneratedCode && addons.aica && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: `/project/${addons.aica.AICA_SETTINGS_PATH}`, search }}
        >
          <FormattedMessage id="ai_generated_code.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {isProj && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/import_export', search }}
        >
          <FormattedMessage id="project_dump.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {configuration.showLinks && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/links', search }}
        >
          <FormattedMessage id="project_links.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {configuration.showPermissions && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project_roles', search }}
        >
          <FormattedMessage id="permissions.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {configuration.showBackgroundTasks && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/background_tasks', search }}
        >
          <FormattedMessage id="background_tasks.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {configuration.showUpdateKey && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/key', search }}
        >
          <FormattedMessage id="update_key.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {isProj && (
        <Layout.SidebarNavigation.Item
          Icon={IconWebhook}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/webhooks', search }}
        >
          <FormattedMessage id="webhooks.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {showDeletion && (
        <Layout.SidebarNavigation.Item
          Icon={IconGear}
          disableIconWhenSidebarOpen
          to={{ pathname: '/project/deletion', search }}
        >
          <FormattedMessage id="deletion.page" />
        </Layout.SidebarNavigation.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}

export default withAvailableFeatures(ComponentNavSettingsMenu);
