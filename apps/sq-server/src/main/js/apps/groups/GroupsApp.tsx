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

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { InputSearch, LargeCenteredLayout, PageContentFontWrapper } from '~design-system';
import ListFooter from '~sq-server-commons/components/controls/ListFooter';
import { ManagedFilter } from '~sq-server-commons/components/controls/ManagedFilter';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useGroupsQueries } from '~sq-server-commons/queries/groups';
import { useIdentityProviderQuery } from '~sq-server-commons/queries/identity-provider/common';
import { Provider } from '~sq-server-commons/types/types';
import GitHubSynchronisationWarning from '../../app/components/GitHubSynchronisationWarning';
import GitLabSynchronisationWarning from '../../app/components/GitLabSynchronisationWarning';
import Header from './components/Header';
import List from './components/List';

export default function GroupsApp() {
  const [search, setSearch] = useState<string>('');
  const [managed, setManaged] = useState<boolean | undefined>();
  const { data: manageProvider } = useIdentityProviderQuery();

  const { data, isLoading, fetchNextPage } = useGroupsQueries({
    q: search,
    managed,
  });

  const groups = data?.pages.flatMap((page) => page.groups) ?? [];

  return (
    <LargeCenteredLayout>
      <PageContentFontWrapper className="sw-my-8 sw-typo-default">
        <Helmet defer={false} title={translate('user_groups.page')} />
        <main>
          <Header manageProvider={manageProvider?.provider} />
          {manageProvider?.provider === Provider.Github && <GitHubSynchronisationWarning short />}
          {manageProvider?.provider === Provider.Gitlab && <GitLabSynchronisationWarning short />}

          <div className="sw-flex sw-my-4">
            <ManagedFilter
              loading={isLoading}
              manageProvider={manageProvider?.provider}
              managed={managed}
              setManaged={setManaged}
            />
            <InputSearch
              minLength={2}
              onChange={(q) => {
                setSearch(q);
              }}
              placeholder={translate('search.search_by_name')}
              size="large"
              value={search}
            />
          </div>

          <List groups={groups} manageProvider={manageProvider?.provider} />

          <ListFooter
            count={groups.length}
            loadMore={fetchNextPage}
            loading={isLoading}
            ready={!isLoading}
            total={data?.pages[0].page.total}
          />
        </main>
      </PageContentFontWrapper>
    </LargeCenteredLayout>
  );
}
