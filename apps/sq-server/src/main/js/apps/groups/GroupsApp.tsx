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

import { Card } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { InputSearch } from '~design-system';
import ListFooter from '~shared/components/controls/ListFooter';
import { ManagedFilter } from '~sq-server-commons/components/controls/ManagedFilter';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useGroupsQueries } from '~sq-server-commons/queries/groups';
import { useIdentityProviderQuery } from '~sq-server-commons/queries/identity-provider/common';
import { Provider } from '~sq-server-commons/types/types';
import GitHubSynchronisationWarning from '../../app/components/GitHubSynchronisationWarning';
import GitLabSynchronisationWarning from '../../app/components/GitLabSynchronisationWarning';
import { GroupsHeaderActions } from './components/GroupsHeaderActions';
import { GroupsHeaderDescription } from './components/GroupsHeaderDescription';
import List from './components/List';

export default function GroupsApp() {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState<string>('');
  const [managed, setManaged] = useState<boolean | undefined>();
  const { data: manageProvider } = useIdentityProviderQuery();

  const { data, isLoading, fetchNextPage } = useGroupsQueries({
    q: search,
    managed,
  });

  const groups = data?.pages.flatMap((page) => page.groups) ?? [];

  return (
    <AdminPageTemplate
      actions={<GroupsHeaderActions manageProvider={manageProvider?.provider} />}
      description={<GroupsHeaderDescription manageProvider={manageProvider?.provider} />}
      title={formatMessage({ id: 'user_groups.page' })}
      width="fluid"
    >
      <div>
        {manageProvider?.provider === Provider.Github && <GitHubSynchronisationWarning short />}
        {manageProvider?.provider === Provider.Gitlab && <GitLabSynchronisationWarning short />}

        <Card>
          <Card.Body>
            <div className="sw-flex sw-mb-4">
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
          </Card.Body>
        </Card>
      </div>
    </AdminPageTemplate>
  );
}
