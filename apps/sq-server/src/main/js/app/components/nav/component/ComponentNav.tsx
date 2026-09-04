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
  IconOverview,
  IconRocket,
  IconTableChartView,
  Layout,
} from '@sonarsource/echoes-react';
import { useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { useCurrentBranchQuery, useProjectBranchesQuery } from '~adapters/queries/branch';
import { DASHBOARDS_NEW_BADGE_EXPIRATION_DATE } from '~feature-dashboards/constants';
import { NewBadge } from '~shared/components/badges/NewBadge';
import { ComponentNavHeader } from '~shared/components/nav/component-nav/ComponentNavHeader';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { History, RecentHistory } from '~shared/helpers/recent-history';
import { isDefined } from '~shared/helpers/types';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import {
  PROJECT_DASHBOARDS_LIST_ROUTE,
  PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY,
} from '~sq-server-commons/helpers/project-dashboard-routes';
import {
  getPortfoliosUrl,
  getPortfolioUrl,
  getProjectQueryUrl,
  getProjectsUrl,
  getProjectTutorialLocation,
} from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { supportsCustomProjectDashboards } from '../../../../apps/projectDashboards/permissions';
import {
  getProjectBuiltInDashboardRoute,
  isProjectDashboardView,
} from '../../../../apps/projectDashboards/routes';
import { ComponentNavAnalysisMenu } from './ComponentNavAnalysisMenu';
import { ComponentNavExtensionsMenu } from './ComponentNavExtensionsMenu';
import { ComponentNavPoliciesMenu } from './ComponentNavPoliciesMenu';
import { ComponentNavPortfolioMenu } from './ComponentNavPortfolioMenu';
import { ComponentNavProjectMenu } from './ComponentNavProjectMenu';
import { ComponentNavReportingMenu } from './ComponentNavReportingMenu';
import ComponentNavSettingsMenu from './ComponentNavSettingsMenu';

interface Props {
  component: Component;
  isInProgress?: boolean;
  isPending?: boolean;
}

export function ComponentNav(props: Readonly<Props>) {
  const intl = useIntl();
  const location = useLocation();
  const { component, isInProgress, isPending } = props;
  const { edition } = useAppState();
  const { hasFeature } = useAvailableFeatures();
  const { data: branchLikes = [] } = useProjectBranchesQuery(component);
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { breadcrumbs, key, name } = component;
  const { qualifier } = breadcrumbs.at(-1) ?? {};
  const hasBranches = branchLikes.length > 1;
  const isPortfolio = isPortfolioLike(component.qualifier);
  const isAnalyzed = hasBranches || isInProgress || isPending || isDefined(component.analysisDate);
  // Portfolios aren't scanner-based and therefore have no analysis onboarding.
  const showOnboarding = !isPortfolio && !isAnalyzed;
  const showProjectNav = isAnalyzed && component.qualifier === ComponentQualifier.Project;
  const showDashboardsNav = showProjectNav && supportsCustomProjectDashboards(edition);
  const projectOverviewRoute = getProjectBuiltInDashboardRoute(
    PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY,
  );
  const isProjectOverview =
    location.pathname === projectOverviewRoute && !isProjectDashboardView(location.search);

  const isApplicationChildInaccessible =
    isApplication(component.qualifier) && !component.canBrowseAllChildProjects;

  const recentHistoryFilter = useCallback(
    (history: History) => !isPortfolio || isPortfolioLike(history.qualifier),
    [isPortfolio],
  );

  useEffect(() => {
    if (
      qualifier &&
      [
        ComponentQualifier.Project,
        ComponentQualifier.Portfolio,
        ComponentQualifier.Application,
      ].includes(qualifier)
    ) {
      RecentHistory.add({ key, name, qualifier });
    }
  }, [key, name, qualifier]);

  return (
    <Layout.SidebarNavigation
      ariaLabel={intl.formatMessage({ id: `qualifier.${component.qualifier}` })}
    >
      <ComponentNavHeader
        allProjectsUrl={isPortfolio ? getPortfoliosUrl() : getProjectsUrl()}
        component={component}
        getItemAvatar={isPortfolio ? getPortfolioAvatar : undefined}
        getItemUrl={getComponentUrl}
        recentHistoryFilter={recentHistoryFilter}
      />

      <Layout.SidebarNavigation.Body>
        {showOnboarding && (
          <Layout.SidebarNavigation.Item
            Icon={IconRocket}
            to={getProjectTutorialLocation(component.key)}
          >
            <FormattedMessage id="onboarding.project_analysis.menu_entry" />
          </Layout.SidebarNavigation.Item>
        )}
        {showProjectNav && (
          <Layout.SidebarNavigation.Item
            Icon={IconOverview}
            isActive={isProjectOverview}
            to={getProjectBuiltInDashboardRoute(
              PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY,
              component.key,
            )}
          >
            <FormattedMessage id="overview.page" />
          </Layout.SidebarNavigation.Item>
        )}
        {showDashboardsNav && (
          <Layout.SidebarNavigation.Item
            Icon={IconDashboard}
            isActive={
              location.pathname.startsWith(PROJECT_DASHBOARDS_LIST_ROUTE) && !isProjectOverview
            }
            suffix={<NewBadge expirationDate={DASHBOARDS_NEW_BADGE_EXPIRATION_DATE} />}
            to={{
              pathname: PROJECT_DASHBOARDS_LIST_ROUTE,
              search: new URLSearchParams({ id: component.key }).toString(),
            }}
          >
            <FormattedMessage id="project_dashboards.all.page" />
          </Layout.SidebarNavigation.Item>
        )}
        {isPortfolio && <ComponentNavPortfolioMenu component={component} isAnalyzed={isAnalyzed} />}
        {isAnalyzed && !isPortfolio && (
          <ComponentNavAnalysisMenu branchLike={branchLike} component={component} />
        )}

        {isAnalyzed &&
          hasFeature(Feature.Architecture) &&
          addons.architecture?.ArchitectureNavMenu && (
            <addons.architecture.ArchitectureNavMenu
              branchLike={branchLike}
              component={component}
            />
          )}

        {!isApplicationChildInaccessible && (
          <ComponentNavExtensionsMenu branchLike={branchLike} component={component} />
        )}

        {isAnalyzed && !isPortfolio && !isApplicationChildInaccessible && (
          <ComponentNavReportingMenu branchLike={branchLike} component={component} />
        )}

        {!isApplicationChildInaccessible && <ComponentNavPoliciesMenu component={component} />}
        {!isPortfolio && !isApplicationChildInaccessible && (
          <ComponentNavProjectMenu
            branchLike={branchLike}
            component={component}
            isAnalyzed={isAnalyzed}
          />
        )}
        <ComponentNavSettingsMenu branchLike={branchLike} component={component} />
      </Layout.SidebarNavigation.Body>
    </Layout.SidebarNavigation>
  );
}

function getComponentUrl(component: History) {
  if (isPortfolioLike(component.qualifier)) {
    return getPortfolioUrl(component.key);
  }
  if (isApplication(component.qualifier)) {
    return getProjectQueryUrl(component.key);
  }
  return getProjectOverviewUrl(component.key);
}

function getPortfolioAvatar() {
  return <IconTableChartView />;
}
