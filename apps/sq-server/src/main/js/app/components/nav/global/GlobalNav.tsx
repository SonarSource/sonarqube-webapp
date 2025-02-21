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

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { GlobalNavigation } from '@sonarsource/echoes-react';
import { throttle } from 'lodash';
import { useEffect, useState } from 'react';
import { LAYOUT_VIEWPORT_MIN_WIDTH, themeShadow, THROTTLE_SCROLL_DELAY } from '~design-system';
import EmbedDocsPopupHelper from '~sq-server-shared/components/embed-docs-modal/EmbedDocsPopupHelper';
import { useCurrentUser } from '~sq-server-shared/context/current-user/CurrentUserContext';
import withCurrentUserContext from '~sq-server-shared/context/current-user/withCurrentUserContext';
import GlobalSearch from '../../global-search/GlobalSearch';
import { GlobalNavMenu } from './GlobalNavMenu';
import { GlobalNavUser } from './GlobalNavUser';
import { LogoWithAriaText } from './MainSonarQubeBar';

export function GlobalNav() {
  const { currentUser } = useCurrentUser();
  const theme = useTheme();
  const [boxShadow, setBoxShadow] = useState('none');

  useEffect(() => {
    const handleScroll = throttle(() => {
      setBoxShadow(document.documentElement?.scrollTop > 0 ? themeShadow('md')({ theme }) : 'none');
    }, THROTTLE_SCROLL_DELAY);

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [theme]);

  return (
    <StyledGlobalNavigation boxShadow={boxShadow}>
      <GlobalNavigation.Primary>
        <GlobalNavigation.Home>
          <LogoWithAriaText />
        </GlobalNavigation.Home>
        <GlobalNavMenu currentUser={currentUser} />
      </GlobalNavigation.Primary>
      <GlobalNavigation.Secondary>
        <GlobalSearch />
        <EmbedDocsPopupHelper />
        <GlobalNavUser />
      </GlobalNavigation.Secondary>
    </StyledGlobalNavigation>
  );
}

const StyledGlobalNavigation = styled(GlobalNavigation)<{ boxShadow: string }>`
  box-shadow: ${({ boxShadow }) => boxShadow};
  min-width: ${LAYOUT_VIEWPORT_MIN_WIDTH}px;
`;

export default withCurrentUserContext(GlobalNav);
