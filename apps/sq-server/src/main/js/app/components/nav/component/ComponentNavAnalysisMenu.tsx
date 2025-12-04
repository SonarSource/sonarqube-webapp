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
  IconActivity,
  IconArchitecture,
  IconDependency,
  IconDependencyRisk,
  IconFileCode,
  IconIssues,
  IconMeasures,
  IconOverview,
  IconReports,
  IconSecurityFinding,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { To } from 'react-router-dom';
import { useCurrentUser } from '~adapters/helpers/users';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { getRisksUrl } from '~shared/helpers/sca-urls';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { addons } from '~sq-server-addons/index';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import {
  getActivityUrl,
  getCodeUrl,
  getPortfolioUrl,
  getProjectQueryUrl,
} from '~sq-server-commons/helpers/urls';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { getComponentSecurityHotspotsUrl } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Component;
}

export function ComponentNavAnalysisMenu(props: Readonly<Props>) {
  const { hasFeature } = useAvailableFeatures();
  const { isLoggedIn } = useCurrentUser();
  const { branchLike, component } = props;
  const { extensions = [], qualifier } = component;

  const branchParameters = getBranchLikeQuery(branchLike);
  const isPortfolio = isPortfolioLike(qualifier);
  const isApp = isApplication(qualifier);

  const { data: architectureOptIn, isLoading: isLoadingArchitectureOptIn } = useGetValueQuery({
    key: SettingsKey.DesignAndArchitecture,
  });

  const isApplicationChildInaccessible =
    isApplication(component.qualifier) && !component.canBrowseAllChildProjects;

  const isGovernanceEnabled = extensions.some((extension) =>
    extension.key.startsWith('governance/'),
  );
  const isSecurityReportsEnabled =
    !isPullRequest(branchLike) &&
    extensions.some((extension) => extension.key.startsWith('securityreport/'));

  const isArchitectureEnabled =
    isLoggedIn &&
    !isLoadingArchitectureOptIn &&
    architectureOptIn?.value === 'true' &&
    hasFeature(Feature.Architecture);

  let dashboardUrl: To | null = getProjectQueryUrl(component.key, branchParameters);
  if (isPortfolio) {
    dashboardUrl = isGovernanceEnabled ? getPortfolioUrl(component.key) : null;
  }

  if (isApplicationChildInaccessible) {
    return (
      <Layout.SidebarNavigation.Group
        label={<FormattedMessage id="navigation.project.group.analysis" />}
      >
        {dashboardUrl && (
          <Layout.SidebarNavigation.Item Icon={IconOverview} to={dashboardUrl}>
            <FormattedMessage id="overview.page" />
          </Layout.SidebarNavigation.Item>
        )}
      </Layout.SidebarNavigation.Group>
    );
  }

  return (
    <Layout.SidebarNavigation.Group
      label={<FormattedMessage id="navigation.project.group.analysis" />}
    >
      {dashboardUrl && (
        <Layout.SidebarNavigation.Item Icon={IconOverview} to={dashboardUrl}>
          <FormattedMessage id="overview.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {isPortfolio && isGovernanceEnabled && (
        <Layout.SidebarNavigation.Item
          Icon={IconFileCode}
          to={getCodeUrl(component.key, branchLike)}
        >
          <FormattedMessage id="portfolio_breakdown.page" />
        </Layout.SidebarNavigation.Item>
      )}
      <Layout.SidebarNavigation.Item
        Icon={IconIssues}
        to={getComponentIssuesUrl(component.key, {
          ...branchParameters,
          ...DEFAULT_ISSUES_QUERY,
        })}
      >
        <FormattedMessage id="issues.page" />
      </Layout.SidebarNavigation.Item>
      {!isPortfolio && (
        <Layout.SidebarNavigation.Item
          Icon={IconSecurityFinding}
          to={getComponentSecurityHotspotsUrl(component.key, branchLike)}
        >
          <FormattedMessage id="layout.security_hotspots" />
        </Layout.SidebarNavigation.Item>
      )}
      {hasFeature(Feature.Sca) && (
        <Layout.SidebarNavigation.Item
          Icon={IconDependencyRisk}
          to={getRisksUrl({ newParams: { id: component.key, ...branchParameters } })}
        >
          <FormattedMessage id="dependencies.risks" />
        </Layout.SidebarNavigation.Item>
      )}
      {isSecurityReportsEnabled && (
        <Layout.SidebarNavigation.Item
          Icon={IconReports}
          to={{
            pathname: '/project/extension/securityreport/securityreport',
            search: new URLSearchParams({ id: component.key, ...branchParameters }).toString(),
          }}
        >
          <FormattedMessage id="layout.security_reports" />
        </Layout.SidebarNavigation.Item>
      )}
      {isArchitectureEnabled && (
        <Layout.SidebarNavigation.Item
          Icon={IconArchitecture}
          to={{
            pathname: '/architecture',
            search: new URLSearchParams({ id: component.key, ...branchParameters }).toString(),
          }}
        >
          <FormattedMessage id="layout.architecture" />
        </Layout.SidebarNavigation.Item>
      )}
      <Layout.SidebarNavigation.Item
        Icon={IconMeasures}
        to={{
          pathname: '/component_measures',
          search: new URLSearchParams({ id: component.key, ...branchParameters }).toString(),
        }}
      >
        <FormattedMessage id="layout.measures" />
      </Layout.SidebarNavigation.Item>
      {!isPortfolio && (
        <Layout.SidebarNavigation.Item
          Icon={IconFileCode}
          to={getCodeUrl(component.key, branchLike)}
        >
          <FormattedMessage id={isApp ? 'view_projects.page' : 'code.page'} />
        </Layout.SidebarNavigation.Item>
      )}
      {hasFeature(Feature.Sca) && addons.sca && (
        <Layout.SidebarNavigation.Item
          Icon={IconDependency}
          to={addons.sca.getReleasesUrl({
            newParams: { id: component.key, ...branchParameters },
          })}
        >
          <FormattedMessage id="dependencies.bill_of_materials" />
        </Layout.SidebarNavigation.Item>
      )}

      <Layout.SidebarNavigation.Item
        Icon={IconActivity}
        to={getActivityUrl(component.key, branchLike)}
      >
        <FormattedMessage id="project_activity.page" />
      </Layout.SidebarNavigation.Item>
    </Layout.SidebarNavigation.Group>
  );
}
