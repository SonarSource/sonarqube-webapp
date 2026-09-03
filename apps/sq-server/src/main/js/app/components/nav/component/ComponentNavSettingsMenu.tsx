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
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isApplication, isPortfolioLike, isProject } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { hasMessage } from '~sq-server-commons/helpers/l10n';
import { getComponentReportSettingsPathname } from '~sq-server-commons/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { pathForExtension } from '../../extensions/helpers';

interface Props extends WithAvailableFeaturesProps {
  branchLike?: BranchLike;
  component: Component;
}

function ComponentNavSettingsMenu(props: Readonly<Props>) {
  const { branchLike, component, hasFeature } = props;
  const { configuration = {}, qualifier } = component;
  const appState = useAppState();

  if (!configuration.showSettings) {
    return undefined;
  }

  const branchParameters = getBranchLikeQuery(branchLike);
  const query = { id: component.key, ...branchParameters };
  const search = new URLSearchParams(query).toString();

  const isPortfolio = isPortfolioLike(qualifier);
  const isApp = isApplication(qualifier);
  const isProj = isProject(qualifier);

  const showSettings = !isApp && !isPortfolio;
  const showBaseline = !isApp && !isPortfolio;
  const showAiGeneratedCode = isProj && hasFeature(Feature.AiCodeAssurance) && Boolean(addons.aica);

  const showAiCapabilities =
    isProj &&
    (hasFeature(Feature.RemediationAgent) || hasFeature(Feature.HunterAgent)) &&
    Boolean(addons.remediationAgent);

  const isGovernanceEnabled = appState.qualifiers.includes(ComponentQualifier.Portfolio);

  const showApplicationDefinition =
    isApp && appState.qualifiers.includes(ComponentQualifier.Application);

  const showPortfolioDefinition = isPortfolio && isGovernanceEnabled;
  const showPortfolioReportSettings = isPortfolio && isGovernanceEnabled;
  const showApplicationReportSettings = isApp && isGovernanceEnabled;
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
    !showAiCapabilities &&
    adminExtensions.length === 0
  ) {
    return undefined;
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
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project/settings', search }}>
          <FormattedMessage id="project_settings.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showBaseline && (
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project/baseline', search }}>
          <FormattedMessage id="project_baseline.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {adminExtensions.map(({ key, name }) => (
        <Layout.SidebarNavigation.AccordionItem.Item
          key={key}
          to={{
            pathname: pathForExtension(key, true),
            search: new URLSearchParams({ ...query, qualifier }).toString(),
          }}
        >
          <FormattedMessage id={name} />
        </Layout.SidebarNavigation.AccordionItem.Item>
      ))}

      {showApplicationDefinition && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{ pathname: '/project/admin/application-definition', search }}
        >
          <FormattedMessage id="application_console.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showPortfolioDefinition && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{ pathname: '/project/admin/definition', search }}
        >
          <FormattedMessage id="application_console.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showApplicationReportSettings && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{ pathname: getComponentReportSettingsPathname(qualifier), search }}
        >
          <FormattedMessage id="application_settings.report" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showPortfolioReportSettings && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{ pathname: getComponentReportSettingsPathname(qualifier), search }}
        >
          <FormattedMessage id="report.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showAiGeneratedCode && addons.aica && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{ pathname: `/project/${addons.aica.AICA_SETTINGS_PATH}`, search }}
        >
          <FormattedMessage id="ai_generated_code.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showAiCapabilities && addons.remediationAgent && (
        <Layout.SidebarNavigation.AccordionItem.Item
          suffix={
            <NewBadge
              expirationDate={
                addons.remediationAgent.PROJECT_AGENT_ACTIVITY_NEW_BADGE_EXPIRATION_DATE
              }
            />
          }
          to={addons.remediationAgent.getProjectAICapabilitiesUrl(
            component.key,
            hasFeature(Feature.RemediationAgent)
              ? addons.remediationAgent.ProjectAICapabilitiesCategory.RemediationAgent
              : addons.remediationAgent.ProjectAICapabilitiesCategory.HunterAgent,
          )}
        >
          <FormattedMessage id="ai_capabilities.title" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {isProj && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{ pathname: '/project/import_export', search }}
        >
          <FormattedMessage id="project_dump.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {configuration.showLinks && (
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project/links', search }}>
          <FormattedMessage id="project_links.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {configuration.showPermissions && (
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project_roles', search }}>
          <FormattedMessage id="permissions.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {configuration.showBackgroundTasks && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{ pathname: '/project/background_tasks', search }}
        >
          <FormattedMessage id="background_tasks.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {configuration.showUpdateKey && (
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project/key', search }}>
          <FormattedMessage id="update_key.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {isProj && (
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project/webhooks', search }}>
          <FormattedMessage id="webhooks.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showDeletion && (
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project/deletion', search }}>
          <FormattedMessage id="deletion.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}

export default withAvailableFeatures(ComponentNavSettingsMenu);
