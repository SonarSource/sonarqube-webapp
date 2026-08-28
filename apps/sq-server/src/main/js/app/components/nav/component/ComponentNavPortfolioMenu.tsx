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
  IconDashboard,
  IconDependency,
  IconIssues,
  IconOverview,
  IconReports,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { useIsEnterpriseTier } from '~adapters/helpers/plan';
import { DASHBOARDS_NEW_BADGE_EXPIRATION_DATE } from '~feature-dashboards/constants';
import { NewBadge } from '~shared/components/badges/NewBadge';
import { getRisksUrl } from '~shared/helpers/sca-urls';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getActivityUrl, getCodeUrl, getPortfolioUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Component;
  isAnalyzed: boolean;
}

export function ComponentNavPortfolioMenu({ component, isAnalyzed }: Readonly<Props>) {
  const location = useLocation();
  const appState = useAppState();
  const { hasFeature } = useAvailableFeatures();
  const isEnterprise = useIsEnterpriseTier();
  const portfolioDashboardsListRoute = addons.portfolios?.PortfolioDashboardsListRoute;
  const portfolioHealthDashboardDefaultKey = addons.portfolios?.PortfolioHealthDashboardDefaultKey;
  const portfolioHealthDashboardRoute = portfolioHealthDashboardDefaultKey
    ? addons.portfolios?.getPortfolioHealthDashboardRoute?.(
        portfolioHealthDashboardDefaultKey,
        component.key,
      )
    : undefined;
  const isGovernanceEnabled = appState.qualifiers.includes(ComponentQualifier.Portfolio);
  const showPortfolioDashboards =
    isGovernanceEnabled &&
    isStringDefined(portfolioDashboardsListRoute) &&
    isStringDefined(portfolioHealthDashboardRoute);
  const query = { id: component.key };
  const search = new URLSearchParams(query).toString();
  const scaAddon = addons.sca;
  const showRisks = hasFeature(Feature.Sca);
  const showDependencies = showRisks && isDefined(scaAddon);
  const showSecurityReports = isEnterprise && isDefined(addons.securityReports);

  return (
    <>
      {isGovernanceEnabled && (
        <Layout.SidebarNavigation.Item
          Icon={IconOverview}
          isMatchingFullPath
          to={getPortfolioUrl(component.key)}
        >
          <FormattedMessage id="overview.page" />
        </Layout.SidebarNavigation.Item>
      )}

      {showPortfolioDashboards && (
        <Layout.SidebarNavigation.AccordionItem
          Icon={IconDashboard}
          label={<FormattedMessage id="portfolio_dashboards.nav" />}
          suffix={<NewBadge expirationDate={DASHBOARDS_NEW_BADGE_EXPIRATION_DATE} />}
        >
          <Layout.SidebarNavigation.AccordionItem.Item
            isActive={isBuiltInPortfolioDashboardNavActive(
              location.pathname,
              portfolioDashboardsListRoute,
            )}
            to={portfolioHealthDashboardRoute}
          >
            <FormattedMessage id="portfolio_dashboards.health.page" />
          </Layout.SidebarNavigation.AccordionItem.Item>

          <Layout.SidebarNavigation.AccordionItem.Item
            isActive={isPortfolioDashboardsListNavActive(
              location.pathname,
              portfolioDashboardsListRoute,
            )}
            to={{
              pathname: portfolioDashboardsListRoute,
              search,
            }}
          >
            <FormattedMessage id="portfolio_dashboards.all.page" />
          </Layout.SidebarNavigation.AccordionItem.Item>
        </Layout.SidebarNavigation.AccordionItem>
      )}

      <Layout.SidebarNavigation.AccordionItem
        Icon={IconIssues}
        label={<FormattedMessage id="navigation.project.group.analysis" />}
      >
        {isGovernanceEnabled && (
          <Layout.SidebarNavigation.AccordionItem.Item
            isMatchingFullPath
            to={getCodeUrl(component.key)}
          >
            <FormattedMessage id="portfolio_breakdown.page" />
          </Layout.SidebarNavigation.AccordionItem.Item>
        )}

        <Layout.SidebarNavigation.AccordionItem.Item
          to={getComponentIssuesUrl(component.key, DEFAULT_ISSUES_QUERY)}
        >
          <FormattedMessage id="issues.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>

        {isAnalyzed && showRisks && (
          <Layout.SidebarNavigation.AccordionItem.Item to={getRisksUrl({ newParams: query })}>
            <FormattedMessage id="dependencies.risks" />
          </Layout.SidebarNavigation.AccordionItem.Item>
        )}
      </Layout.SidebarNavigation.AccordionItem>

      {isAnalyzed && (
        <Layout.SidebarNavigation.AccordionItem
          Icon={IconReports}
          label={<FormattedMessage id="navigation.project.group.reporting" />}
        >
          {showSecurityReports && (
            <Layout.SidebarNavigation.AccordionItem.Item
              isMatchingFullPath
              to={{ pathname: '/project/security-reports', search }}
            >
              <FormattedMessage id="layout.security_reports" />
            </Layout.SidebarNavigation.AccordionItem.Item>
          )}

          <Layout.SidebarNavigation.AccordionItem.Item
            isMatchingFullPath
            to={{ pathname: '/component_measures', search }}
          >
            <FormattedMessage id="layout.measures" />
          </Layout.SidebarNavigation.AccordionItem.Item>

          <Layout.SidebarNavigation.AccordionItem.Item to={getActivityUrl(component.key)}>
            <FormattedMessage id="project_activity.page" />
          </Layout.SidebarNavigation.AccordionItem.Item>
        </Layout.SidebarNavigation.AccordionItem>
      )}

      {isAnalyzed && showDependencies && (
        <Layout.SidebarNavigation.AccordionItem
          Icon={IconDependency}
          label={<FormattedMessage id="navigation.project.group.project" />}
        >
          <Layout.SidebarNavigation.AccordionItem.Item
            to={scaAddon.getReleasesUrl({ newParams: query })}
          >
            <FormattedMessage id="dependencies.bill_of_materials" />
          </Layout.SidebarNavigation.AccordionItem.Item>
        </Layout.SidebarNavigation.AccordionItem>
      )}
    </>
  );
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
