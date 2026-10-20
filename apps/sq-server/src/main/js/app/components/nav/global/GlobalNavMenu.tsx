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

import { Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useMatch } from 'react-router-dom';
import { ComponentQualifier } from '~shared/types/component';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
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

  const isAdminActive = Boolean(useMatch('/admin/*'));
  const rulesMatch = useMatch('/coding_rules/*');
  const profilesMatch = useMatch('/profiles/*');
  const gatesMatch = useMatch('/quality_gates/*');
  const licensesMatch = useMatch('/license_profiles/*');
  const isPoliciesActive = Boolean(rulesMatch || profilesMatch || gatesMatch || licensesMatch);

  return (
    <Layout.GlobalNavigation.ItemsContainer id="it__global-navbar-menu">
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
      <Layout.GlobalNavigation.Item isActive={isPoliciesActive} to="/coding_rules">
        <FormattedMessage id="layout.policies" />
      </Layout.GlobalNavigation.Item>

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
