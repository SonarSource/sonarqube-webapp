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

import { DropdownMenu, GlobalNavigation } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { Extension } from '~shared/types/common';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { AppState } from '~sq-server-commons/types/appstate';

const renderGlobalPageLink = ({ key, name }: Extension) => {
  return (
    <DropdownMenu.ItemLink key={key} to={`/extension/${key}`}>
      {name}
    </DropdownMenu.ItemLink>
  );
};

function GlobalNavMore({ appState: { globalPages = [] } }: Readonly<{ appState: AppState }>) {
  const withoutPortfolios = globalPages.filter((page) => page.key !== 'governance/portfolios');

  if (withoutPortfolios.length === 0) {
    return null;
  }

  return (
    <GlobalNavigation.DropdownItem
      id="moreMenuDropdown"
      items={<>{withoutPortfolios.map(renderGlobalPageLink)}</>}
    >
      <FormattedMessage id="more" />
    </GlobalNavigation.DropdownItem>
  );
}

export default withAppStateContext(GlobalNavMore);
