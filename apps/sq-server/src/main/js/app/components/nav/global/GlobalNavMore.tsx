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
import { NewBadge } from '~shared/components/badges/NewBadge';
import { SECURITY_ALERTS_ROUTE_NAME } from '~shared/helpers/security-alerts-urls';
import { isDefined } from '~shared/helpers/types';
import { Extension } from '~shared/types/common';
import { addons } from '~sq-server-addons/index';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { AppState } from '~sq-server-commons/types/appstate';
import { Feature } from '~sq-server-commons/types/features';

const renderGlobalPageLink = ({ key, name }: Extension) => {
  return (
    <DropdownMenu.ItemLink key={key} to={`/extension/${key}`}>
      {name}
    </DropdownMenu.ItemLink>
  );
};

function GlobalNavMore({ appState: { globalPages = [] } }: Readonly<{ appState: AppState }>) {
  const withoutPortfolios = globalPages.filter((page) => page.key !== 'governance/portfolios');
  const showSecurityAlerts =
    useAvailableFeatures().hasFeature(Feature.Sca) && isDefined(addons.securityAlerts);

  const { vortexDashboard } = addons;

  // The dashboard itself handles not-purchased / not-enabled states. Hide the item only when
  // the Vortex addon is not packaged on this instance.
  const vortexBadge = vortexDashboard && (
    <NewBadge expirationDate={vortexDashboard.VORTEX_NEW_BADGE_EXPIRATION_DATE} />
  );

  const vortexItem = vortexDashboard && (
    <DropdownMenu.ItemLink suffix={vortexBadge} to={vortexDashboard.VORTEX_DASHBOARD_PATH}>
      <FormattedMessage id="vortex_dashboard.nav_item" />
    </DropdownMenu.ItemLink>
  );

  if (withoutPortfolios.length === 0 && !showSecurityAlerts && !vortexItem) {
    return null;
  }

  return (
    <Layout.GlobalNavigation.DropdownItem
      id="moreMenuDropdown"
      items={
        <>
          {showSecurityAlerts && (
            <DropdownMenu.ItemLink to={`/${SECURITY_ALERTS_ROUTE_NAME}`}>
              <FormattedMessage id="security_alerts.page" />
            </DropdownMenu.ItemLink>
          )}
          {vortexItem}
          {withoutPortfolios.map(renderGlobalPageLink)}
        </>
      }
    >
      {/* DropdownItem's children render inside a plain, non-flex span, so the badge needs its
          own gap here — DropdownItem hardcodes the chevron as its suffix, leaving no other slot. */}
      <span className="sw-inline-flex sw-items-center sw-gap-2">
        <FormattedMessage id="more" />
        {vortexBadge}
      </span>
    </Layout.GlobalNavigation.DropdownItem>
  );
}

export default withAppStateContext(GlobalNavMore);
