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

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Layout } from '@sonarsource/echoes-react';
import { throttle } from 'lodash';
import React from 'react';
import { LAYOUT_VIEWPORT_MIN_WIDTH, THROTTLE_SCROLL_DELAY } from '../helpers/constants';
import { themeShadow } from '../helpers/theme';

const MainAppBarHeader = styled.header`
  min-width: ${LAYOUT_VIEWPORT_MIN_WIDTH}px;
`;

export function MainAppBar({
  children,
  Logo,
}: React.PropsWithChildren<{ Logo: React.ElementType }>) {
  const theme = useTheme();
  const [boxShadow, setBoxShadow] = React.useState('none');

  React.useEffect(() => {
    const handleScroll = throttle(() => {
      setBoxShadow(document.documentElement?.scrollTop > 0 ? themeShadow('md')({ theme }) : 'none');
    }, THROTTLE_SCROLL_DELAY);

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [theme]);

  return (
    <MainAppBarHeader style={{ boxShadow }}>
      <Layout.GlobalNavigation>
        <Layout.GlobalNavigation.Primary>
          <Layout.GlobalNavigation.Home>
            <Logo />
          </Layout.GlobalNavigation.Home>
        </Layout.GlobalNavigation.Primary>
      </Layout.GlobalNavigation>
      <Layout.GlobalNavigation.Secondary>{children}</Layout.GlobalNavigation.Secondary>
    </MainAppBarHeader>
  );
}
