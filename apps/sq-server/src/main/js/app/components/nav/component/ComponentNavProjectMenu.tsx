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

import { IconFileCode, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useCurrentUser } from '~adapters/helpers/users';
import { NewBadge } from '~shared/components/badges/NewBadge';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isApplication, isPortfolioLike, isProject } from '~shared/helpers/component';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getCodeUrl } from '~sq-server-commons/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Component;
  isAnalyzed: boolean;
}

export function ComponentNavProjectMenu(props: Readonly<Props>) {
  const { branchLike, component, isAnalyzed } = props;
  const { hasFeature } = useAvailableFeatures();
  const { isLoggedIn } = useCurrentUser();
  const { qualifier } = component;

  const branchParameters = getBranchLikeQuery(branchLike);
  const query = { id: component.key, ...branchParameters };
  const search = new URLSearchParams(query).toString();
  const isPortfolio = isPortfolioLike(qualifier);
  const isApp = isApplication(qualifier);
  const isProj = isProject(qualifier);
  const showBranches = Boolean(
    isProj &&
    component.configuration?.showSettings &&
    hasFeature(Feature.BranchSupport) &&
    addons.branches,
  );
  const showCode = !isPortfolio && isAnalyzed;
  const scaAddon = addons.sca;
  const showDependencies = showCode && hasFeature(Feature.Sca) && isDefined(scaAddon);
  const remediationAgentAddon = addons.remediationAgent;
  const showRemediationAgent =
    isProj &&
    isLoggedIn &&
    hasFeature(Feature.RemediationAgent) &&
    isDefined(remediationAgentAddon);

  const showInformation = isProj || isApp;

  if (
    !showBranches &&
    !showCode &&
    !showDependencies &&
    !showRemediationAgent &&
    !showInformation
  ) {
    return undefined;
  }

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconFileCode}
      label={<FormattedMessage id="navigation.project.group.project" />}
    >
      {showBranches && (
        <Layout.SidebarNavigation.AccordionItem.Item to={{ pathname: '/project/branches', search }}>
          <FormattedMessage id="project_branch_pull_request.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
      {showCode && (
        <Layout.SidebarNavigation.AccordionItem.Item to={getCodeUrl(component.key, branchLike)}>
          <FormattedMessage id={isApp ? 'view_projects.page' : 'code.page'} />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
      {showDependencies && scaAddon && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={scaAddon.getReleasesUrl({ newParams: query })}
        >
          <FormattedMessage id="dependencies.bill_of_materials" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
      {showRemediationAgent && remediationAgentAddon && (
        <Layout.SidebarNavigation.AccordionItem.Item
          suffix={
            <NewBadge
              expirationDate={
                remediationAgentAddon.PROJECT_AGENT_ACTIVITY_NEW_BADGE_EXPIRATION_DATE
              }
            />
          }
          to={{
            pathname: '/project/remediation_agent',
            search: new URLSearchParams({ id: component.key }).toString(),
          }}
        >
          <FormattedMessage id="project_agent_activity.title" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
      {showInformation && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{
            pathname: '/project/information',
            search: new URLSearchParams({ id: component.key }).toString(),
          }}
        >
          <FormattedMessage id={isProj ? 'project.info.title' : 'application.info.title'} />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}
