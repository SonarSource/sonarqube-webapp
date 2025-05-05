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
import { ComponentQualifier } from '~shared/types/component';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getQualityGatesUrl } from '~sq-server-commons/helpers/urls';
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

  return (
    <GlobalNavigation.ItemsContainer id="it__global-navbar-menu">
      <GlobalNavigation.Item to="/projects">{translate('projects.page')}</GlobalNavigation.Item>

      {governanceInstalled && (
        <GlobalNavigation.Item to="/portfolios">
          {translate('portfolios.page')}
        </GlobalNavigation.Item>
      )}

      <GlobalNavigation.Item to={{ pathname: '/issues', search }}>
        {translate('issues.page')}
      </GlobalNavigation.Item>
      <GlobalNavigation.Item to="/coding_rules">
        {translate('coding_rules.page')}
      </GlobalNavigation.Item>
      <GlobalNavigation.Item to="/profiles">
        {translate('quality_profiles.page')}
      </GlobalNavigation.Item>
      <GlobalNavigation.Item to={getQualityGatesUrl()}>
        {translate('quality_gates.page')}
      </GlobalNavigation.Item>

      {appState.canAdmin && (
        <GlobalNavigation.Item
          data-guiding-id="mode-tour-1"
          data-spotlight-id="design-and-architecture-tour"
          to="/admin/settings"
        >
          {translate('layout.settings')}
        </GlobalNavigation.Item>
      )}

      <GlobalNavMore />
    </GlobalNavigation.ItemsContainer>
  );
}
