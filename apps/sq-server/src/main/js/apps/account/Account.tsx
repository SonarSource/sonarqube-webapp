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

import styled from '@emotion/styled';
import { Layout } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { Outlet } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { useCurrentLoginUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { TopBarNewLayoutCompatible } from '~sq-server-commons/design-system/components/TopBar';
import { AccountSidebar } from './components/AccountSidebar';
import Nav from './components/Nav';
import UserCard from './components/UserCard';

export default function Account() {
  const currentUser = useCurrentLoginUser();

  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  const { formatMessage } = useIntl();

  const title = formatMessage({ id: 'my_account.page' });

  return (
    <>
      {frontEndEngineeringEnableSidebarNavigation && <AccountSidebar />}
      <Layout.ContentGrid id="account-page">
        <Helmet
          defaultTitle={title}
          defer={false}
          titleTemplate={formatMessage(
            { id: 'page_title.template.with_category' },
            { page: formatMessage({ id: 'my_account.page' }) },
          )}
        />

        {!frontEndEngineeringEnableSidebarNavigation && (
          <ContentHeader>
            <TopBarNewLayoutCompatible>
              <div className="sw-flex sw-items-center sw-gap-2 sw-pb-4">
                <UserCard user={currentUser} />
              </div>

              <Nav />
            </TopBarNewLayoutCompatible>
          </ContentHeader>
        )}

        <A11ySkipTarget anchor="account_main" />

        <Layout.PageGrid width="default">
          <Outlet />
        </Layout.PageGrid>
      </Layout.ContentGrid>
    </>
  );
}

const ContentHeader = styled.div`
  grid-area: content-header;
`;
