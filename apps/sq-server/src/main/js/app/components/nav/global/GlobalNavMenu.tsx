/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { GlobalNavigation } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getQualityGatesUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { CurrentUser } from '~sq-server-commons/types/users';
import { isMySet } from '~sq-server-commons/utils/issues-utils';
import GlobalNavMore from './GlobalNavMore';

interface Props {
  currentUser: CurrentUser;
}

export function GlobalNavMenu({ currentUser }: Readonly<Props>) {
  const appState = useAppState();

  const search = (
    currentUser.isLoggedIn && isMySet()
      ? new URLSearchParams({ myIssues: 'true', ...DEFAULT_ISSUES_QUERY })
      : new URLSearchParams(DEFAULT_ISSUES_QUERY)
  ).toString();

  const governanceInstalled = appState.qualifiers.includes(ComponentQualifier.Portfolio);

  /** License Profiles are only available to SCA enabled instances */
  const scaEnabled = useAvailableFeatures().hasFeature(Feature.Sca);
  const licenseProfileRoute = `/${addons.sca?.LICENSE_ROUTE_NAME}`;

  return (
    <GlobalNavigation.ItemsContainer id="it__global-navbar-menu">
      <GlobalNavigation.Item to="/projects">
        <FormattedMessage id="projects.page" />
      </GlobalNavigation.Item>

      {governanceInstalled && (
        <GlobalNavigation.Item to="/portfolios">
          <FormattedMessage id="portfolios.page" />
        </GlobalNavigation.Item>
      )}

      <GlobalNavigation.Item to={{ pathname: '/issues', search }}>
        <FormattedMessage id="issues.page" />
      </GlobalNavigation.Item>
      <GlobalNavigation.Item to="/coding_rules">
        <FormattedMessage id="coding_rules.page" />
      </GlobalNavigation.Item>
      <GlobalNavigation.Item to="/profiles">
        <FormattedMessage id="quality_profiles.page" />
      </GlobalNavigation.Item>
      {scaEnabled && licenseProfileRoute && (
        <GlobalNavigation.Item to={licenseProfileRoute}>
          <FormattedMessage id="sca.licenses.page" />
        </GlobalNavigation.Item>
      )}
      <GlobalNavigation.Item to={getQualityGatesUrl()}>
        <FormattedMessage id="quality_gates.page" />
      </GlobalNavigation.Item>

      {appState.canAdmin && (
        <GlobalNavigation.Item
          data-guiding-id="mode-tour-1"
          data-spotlight-id="design-and-architecture-tour"
          to="/admin/settings"
        >
          <FormattedMessage id="layout.settings" />
        </GlobalNavigation.Item>
      )}

      <GlobalNavMore />
    </GlobalNavigation.ItemsContainer>
  );
}
