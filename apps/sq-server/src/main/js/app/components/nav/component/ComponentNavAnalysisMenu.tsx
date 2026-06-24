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
  IconArchitecture,
  IconDashboard,
  IconDependencyRisk,
  IconFileCode,
  IconIssues,
  IconOverview,
  IconSecurityFinding,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { To, useLocation } from 'react-router-dom';
import { useCurrentUser } from '~adapters/helpers/users';
import { DeprecatedBadge } from '~shared/components/badges/DeprecatedBadge';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { getRisksUrl } from '~shared/helpers/sca-urls';
import { isStringDefined } from '~shared/helpers/types';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getCodeUrl, getPortfolioUrl, getProjectQueryUrl } from '~sq-server-commons/helpers/urls';
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

function isPortfolioDashboardsListNavActive(
  pathname: string,
  portfolioDashboardsListRoute: string,
): boolean {
  if (pathname === portfolioDashboardsListRoute) {
    return true;
  }

  if (!pathname.startsWith(`${portfolioDashboardsListRoute}/`)) {
    return false;
  }

  return !isBuiltInPortfolioDashboardNavActive(pathname, portfolioDashboardsListRoute);
}

function isBuiltInPortfolioDashboardNavActive(
  pathname: string,
  portfolioDashboardsListRoute: string,
): boolean {
  return pathname.startsWith(`${portfolioDashboardsListRoute}/built-in/`);
}

export function ComponentNavAnalysisMenu(props: Readonly<Props>) {
  const location = useLocation();
  const { hasFeature } = useAvailableFeatures();
  const { isLoggedIn } = useCurrentUser();
  const appState = useAppState();
  const { branchLike, component } = props;
  const { qualifier } = component;

  const branchParameters = getBranchLikeQuery(branchLike);
  const isPortfolio = isPortfolioLike(qualifier);
  const portfolioDashboardsListRoute = addons.portfolios?.PortfolioDashboardsListRoute;
  const portfolioHealthDashboardDefaultKey = addons.portfolios?.PortfolioHealthDashboardDefaultKey;
  const portfolioHealthDashboardRoute = portfolioHealthDashboardDefaultKey
    ? addons.portfolios?.getPortfolioHealthDashboardRoute?.(portfolioHealthDashboardDefaultKey)
    : undefined;

  const { data: architectureOptIn, isLoading: isLoadingArchitectureOptIn } = useGetValueQuery({
    key: SettingsKey.DesignAndArchitecture,
  });

  const isApplicationChildInaccessible =
    isApplication(component.qualifier) && !component.canBrowseAllChildProjects;

  const isGovernanceEnabled = appState.qualifiers.includes(ComponentQualifier.Portfolio);
  const showPortfolioGovernanceNav =
    isPortfolio &&
    isGovernanceEnabled &&
    isStringDefined(portfolioDashboardsListRoute) &&
    isStringDefined(portfolioHealthDashboardRoute);

  const isArchitectureEnabled =
    isLoggedIn &&
    !isLoadingArchitectureOptIn &&
    architectureOptIn?.value === 'true' &&
    hasFeature(Feature.Architecture);

  const portfolioDashboardSearchParams = new URLSearchParams({ id: component.key }).toString();
  const portfolioGovernanceEnabled = isPortfolio && isGovernanceEnabled;

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
        <Layout.SidebarNavigation.Item
          Icon={IconOverview}
          isMatchingFullPath={portfolioGovernanceEnabled}
          to={dashboardUrl}
        >
          <FormattedMessage id="overview.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {showPortfolioGovernanceNav && (
        <Layout.SidebarNavigation.AccordionItem
          Icon={IconDashboard}
          label={<FormattedMessage id="portfolio_dashboards.page" />}
        >
          <Layout.SidebarNavigation.Item
            Icon={IconDashboard}
            disableIconWhenSidebarOpen
            isActive={isBuiltInPortfolioDashboardNavActive(
              location.pathname,
              portfolioDashboardsListRoute,
            )}
            to={{
              pathname: portfolioHealthDashboardRoute,
              search: portfolioDashboardSearchParams,
            }}
          >
            <FormattedMessage id="portfolio_dashboards.health.page" />
          </Layout.SidebarNavigation.Item>
          <Layout.SidebarNavigation.Item
            Icon={IconDashboard}
            disableIconWhenSidebarOpen
            isActive={isPortfolioDashboardsListNavActive(
              location.pathname,
              portfolioDashboardsListRoute,
            )}
            to={{
              pathname: portfolioDashboardsListRoute,
              search: portfolioDashboardSearchParams,
            }}
          >
            <FormattedMessage id="portfolio_dashboards.all.page" />
          </Layout.SidebarNavigation.Item>
        </Layout.SidebarNavigation.AccordionItem>
      )}

      {portfolioGovernanceEnabled && (
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
          suffix={<DeprecatedBadge />}
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
    </Layout.SidebarNavigation.Group>
  );
}
