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

import { Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Badge, InputSearch, Modal, TextMuted } from '~design-system';
import ListFooter from '~shared/components/controls/ListFooter';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useGroupMembersQuery } from '~sq-server-commons/queries/group-memberships';
import { Group } from '~sq-server-commons/types/types';

interface Props {
  group: Group;
  isManaged: boolean;
  onClose: () => void;
}

export default function ViewMembersModal(props: Readonly<Props>) {
  const { isManaged, group } = props;

  const [query, setQuery] = React.useState<string>();
  const { data, isLoading, fetchNextPage } = useGroupMembersQuery({
    q: query,
    groupId: group.id,
  });

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  const modalHeader = translate('users.list');
  return (
    <Modal
      body={
        <>
          <InputSearch
            className="sw-w-full sw-top-0 sw-sticky"
            loading={isLoading}
            onChange={setQuery}
            placeholder={translate('search_verb')}
            value={query}
          />
          <div className="sw-mt-6">
            <Spinner isLoading={isLoading}>
              <ul>
                {users.map((user) => (
                  <li className="sw-flex sw-items-center" key={user.login}>
                    <span className="sw-ml-1 sw-w-full">
                      <span className="sw-flex sw-justify-between sw-items-center">
                        <span className="sw-mr-2">
                          {user.name}
                          <br />
                          <TextMuted text={user.login} />
                        </span>
                        {!user.managed && isManaged && <Badge>{translate('local')}</Badge>}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Spinner>
            {data !== undefined && (
              <ListFooter
                count={users.length}
                loadMore={fetchNextPage}
                total={data?.pages[0].page.total}
              />
            )}
          </div>
        </>
      }
      headerTitle={modalHeader}
      onClose={props.onClose}
    />
  );
}
