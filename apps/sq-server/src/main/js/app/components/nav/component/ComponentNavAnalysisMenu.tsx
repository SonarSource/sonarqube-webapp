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

import { IconIssues, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useCurrentUser } from '~adapters/helpers/users';
import { DeprecatedBadge } from '~shared/components/badges/DeprecatedBadge';
import { NewBadge } from '~shared/components/badges/NewBadge';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { isApplication, isProject } from '~shared/helpers/component';
import { getRisksUrl } from '~shared/helpers/sca-urls';
import { isDefined } from '~shared/helpers/types';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getProjectQueryUrl } from '~sq-server-commons/helpers/urls';
import { getComponentSecurityHotspotsUrl } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Component;
}

export function ComponentNavAnalysisMenu(props: Readonly<Props>) {
  const location = useLocation();
  const { organizationReportingEnableDashboards } = useFlags();
  const { hasFeature } = useAvailableFeatures();
  const { branchLike, component } = props;
  const { isLoggedIn } = useCurrentUser();

  const branchParameters = getBranchLikeQuery(branchLike);

  const isApplicationChildInaccessible =
    isApplication(component.qualifier) && !component.canBrowseAllChildProjects;

  const dashboardUrl = getProjectQueryUrl(component.key, branchParameters);
  const summaryMessageId =
    component.qualifier === ComponentQualifier.Project &&
    !organizationReportingEnableDashboards &&
    !isPullRequest(branchLike)
      ? 'overview.page'
      : 'summary.page';

  const issuesUrl = getComponentIssuesUrl(component.key, {
    ...branchParameters,
    ...DEFAULT_ISSUES_QUERY,
  });

  const showHunterAgent =
    isProject(component.qualifier) && isLoggedIn && isDefined(addons.remediationAgent);

  if (isApplicationChildInaccessible) {
    return (
      <Layout.SidebarNavigation.AccordionItem
        Icon={IconIssues}
        label={<FormattedMessage id="navigation.project.group.analysis" />}
      >
        <Layout.SidebarNavigation.AccordionItem.Item to={dashboardUrl}>
          <FormattedMessage id={summaryMessageId} />
        </Layout.SidebarNavigation.AccordionItem.Item>
      </Layout.SidebarNavigation.AccordionItem>
    );
  }

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconIssues}
      label={<FormattedMessage id="navigation.project.group.analysis" />}
    >
      <Layout.SidebarNavigation.AccordionItem.Item to={dashboardUrl}>
        <FormattedMessage id={summaryMessageId} />
      </Layout.SidebarNavigation.AccordionItem.Item>

      <Layout.SidebarNavigation.AccordionItem.Item to={issuesUrl}>
        <FormattedMessage id="issues.page" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      {showHunterAgent && addons.remediationAgent && (
        <Layout.SidebarNavigation.AccordionItem.Item
          isActive={location.pathname.startsWith(addons.remediationAgent.PROJECT_HUNTER_AGENT_PATH)}
          suffix={
            <NewBadge
              expirationDate={addons.remediationAgent.HUNTER_AGENT_NEW_BADGE_EXPIRATION_DATE}
            />
          }
          to={addons.remediationAgent.getProjectHunterAgentResultsUrl(component.key, branchLike)}
        >
          <FormattedMessage id="hunter_agent.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      <Layout.SidebarNavigation.AccordionItem.Item
        suffix={<DeprecatedBadge />}
        to={getComponentSecurityHotspotsUrl(component.key, branchLike)}
      >
        <FormattedMessage id="layout.security_hotspots" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      {hasFeature(Feature.Sca) && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={getRisksUrl({ newParams: { id: component.key, ...branchParameters } })}
        >
          <FormattedMessage id="dependencies.risks" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}
