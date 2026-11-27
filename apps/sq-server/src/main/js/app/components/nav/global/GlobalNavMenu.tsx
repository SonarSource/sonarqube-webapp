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

import { DropdownMenu, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useMatch } from 'react-router';
import { NewBadge } from '~shared/components/badges/NewBadge';
import { getSecurityAlertsUrl } from '~shared/helpers/security-alerts-urls';
import { isDefined } from '~shared/helpers/types';
import { ComponentQualifier } from '~shared/types/component';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getQualityGatesUrl } from '~sq-server-commons/helpers/urls';
import { addons } from '~sq-server-addons/index';
import { Feature } from '~sq-server-commons/types/features';
import { CurrentUser } from '~sq-server-commons/types/users';
import { isMySet } from '~sq-server-commons/utils/issues-utils';
import GlobalNavMore from './GlobalNavMore';

interface Props {
  currentUser: CurrentUser;
}

export function GlobalNavMenu({ currentUser }: Readonly<Props>) {
  const appState = useAppState();
  const scaEnabled = useAvailableFeatures().hasFeature(Feature.Sca);

  const search = (
    currentUser.isLoggedIn && isMySet()
      ? new URLSearchParams({ myIssues: 'true', ...DEFAULT_ISSUES_QUERY })
      : new URLSearchParams(DEFAULT_ISSUES_QUERY)
  ).toString();

  const governanceInstalled = appState.qualifiers.includes(ComponentQualifier.Portfolio);
  const securityAlertsAddon = addons.securityAlerts;
  const showSecurityAlerts = scaEnabled && isDefined(securityAlertsAddon);
  const { vortexDashboard } = addons;
  const ArchitectureGlobalNavItem = addons.architecture?.ArchitectureGlobalNavItem;

  const isAdminActive = Boolean(useMatch('/admin/*'));

  return (
    <Layout.GlobalNavigation.ItemsContainer
      className="sw:whitespace-nowrap"
      id="it__global-navbar-menu"
    >
      <Layout.GlobalNavigation.Item to="/projects">
        <FormattedMessage id="projects.page" />
      </Layout.GlobalNavigation.Item>

      {governanceInstalled && (
        <Layout.GlobalNavigation.Item to="/portfolios">
          <FormattedMessage id="portfolios.page" />
        </Layout.GlobalNavigation.Item>
      )}

      <Layout.GlobalNavigation.Item to={{ pathname: '/issues', search }}>
        <FormattedMessage id="issues.page" />
      </Layout.GlobalNavigation.Item>

      <Layout.GlobalNavigation.DropdownItem
        items={
          <>
            <DropdownMenu.ItemLink to="/coding_rules">
              <FormattedMessage id="coding_rules.page" />
            </DropdownMenu.ItemLink>
            <DropdownMenu.ItemLink to="/profiles">
              <FormattedMessage id="quality_profiles.page" />
            </DropdownMenu.ItemLink>
            {scaEnabled && addons.sca?.LICENSE_ROUTE_NAME && (
              <DropdownMenu.ItemLink to={`/${addons.sca.LICENSE_ROUTE_NAME}`}>
                <FormattedMessage id="sca.licenses.page" />
              </DropdownMenu.ItemLink>
            )}
            <DropdownMenu.ItemLink to={getQualityGatesUrl()}>
              <FormattedMessage id="quality_gates.page" />
            </DropdownMenu.ItemLink>
          </>
        }
      >
        <FormattedMessage id="layout.policies" />
      </Layout.GlobalNavigation.DropdownItem>

      {showSecurityAlerts && (
        <Layout.GlobalNavigation.Item to={getSecurityAlertsUrl()}>
          <span className="sw:inline-flex sw:items-center sw:gap-2">
            <FormattedMessage id="security_alerts.page" />
            <NewBadge
              expirationDate={securityAlertsAddon.SECURITY_ALERTS_NEW_BADGE_EXPIRATION_DATE}
            />
          </span>
        </Layout.GlobalNavigation.Item>
      )}

      {vortexDashboard && (
        <Layout.GlobalNavigation.Item to={vortexDashboard.VORTEX_DASHBOARD_PATH}>
          <span className="sw:inline-flex sw:items-center sw:gap-2">
            <FormattedMessage id="vortex_dashboard.nav_item" />
            <NewBadge expirationDate={vortexDashboard.VORTEX_NEW_BADGE_EXPIRATION_DATE} />
          </span>
        </Layout.GlobalNavigation.Item>
      )}

      {ArchitectureGlobalNavItem && <ArchitectureGlobalNavItem />}

      {appState.canAdmin && (
        <Layout.GlobalNavigation.Item
          data-guiding-id="mode-tour-1"
          data-spotlight-id="design-and-architecture-tour"
          isActive={isAdminActive}
          to="/admin/settings"
        >
          <FormattedMessage id="layout.settings" />
        </Layout.GlobalNavigation.Item>
      )}

      <GlobalNavMore />
    </Layout.GlobalNavigation.ItemsContainer>
  );
}
