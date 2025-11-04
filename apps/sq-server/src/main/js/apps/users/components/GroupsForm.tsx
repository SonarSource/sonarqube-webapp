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

import { Text } from '@sonarsource/echoes-react';
import { find } from 'lodash';
import * as React from 'react';
import { FlagMessage, Modal } from '~design-system';
import SelectList, {
  SelectListFilter,
  SelectListSearchParams,
} from '~sq-server-commons/components/controls/SelectList';
import { translate } from '~sq-server-commons/helpers/l10n';
import { definitions } from '~sq-server-commons/helpers/mocks/definitions-list';
import {
  useAddGroupMembershipMutation,
  useRemoveGroupMembershipMutation,
  useUserGroupsQuery,
} from '~sq-server-commons/queries/group-memberships';
import { Group } from '~sq-server-commons/types/types';
import { RestUserDetailed } from '~sq-server-commons/types/users';
import useSamlConfiguration from '../../settings/components/authentication/hook/useSamlConfiguration';
import { SAML } from '../../settings/components/authentication/SamlAuthenticationTab';

const samlDefinitions = definitions.filter((def) => def.subCategory === SAML);

interface Props {
  onClose: () => void;
  user: RestUserDetailed;
}

export default function GroupsForm(props: Props) {
  const { user } = props;
  const [query, setQuery] = React.useState<string>('');
  const [filter, setFilter] = React.useState<SelectListFilter>(SelectListFilter.Selected);
  const [changedGroups, setChangedGroups] = React.useState<Map<string, boolean>>(new Map());
  const { data, isLoading, fetchNextPage, refetch } = useUserGroupsQuery({
    q: query,
    filter,
    userId: user.id,
  });

  const groups: (Group & { selected?: boolean })[] =
    data?.pages.flatMap((page) => page.groups) ?? [];

  const { mutateAsync: addUserToGroup } = useAddGroupMembershipMutation();
  const { mutateAsync: removeUserFromGroup } = useRemoveGroupMembershipMutation();

  const { samlEnabled } = useSamlConfiguration(samlDefinitions);

  const onSearch = async (searchParams: SelectListSearchParams) => {
    setQuery(searchParams.query);
    setFilter(searchParams.filter);
    if (searchParams.page === 1) {
      await refetch();
      setChangedGroups(new Map());
    } else {
      await fetchNextPage();
    }
  };

  const handleSelect = (groupId: string) =>
    addUserToGroup({
      userId: user.id,
      groupId,
    }).then(() => {
      const newChangedGroups = new Map(changedGroups);
      newChangedGroups.set(groupId, true);
      setChangedGroups(newChangedGroups);
    });

  const handleUnselect = (groupId: string) =>
    removeUserFromGroup({
      groupId,
      userId: user.id,
    }).then(() => {
      const newChangedGroups = new Map(changedGroups);
      newChangedGroups.set(groupId, false);
      setChangedGroups(newChangedGroups);
    });

  const renderElement = (groupId: string): React.ReactNode => {
    const group = find(groups, { id: groupId });
    return (
      <div>
        {group === undefined ? (
          <Text isHighlighted>{groupId}</Text>
        ) : (
          <>
            <Text isHighlighted>{group.name}</Text>
            <br />
            <Text isSubtle>{group.description}</Text>
          </>
        )}
      </div>
    );
  };

  const header = translate('users.update_groups');

  return (
    <Modal
      body={
        <div className="sw-pt-1">
          {samlEnabled && (
            <FlagMessage className="sw-mb-2" variant="warning">
              {translate('users.update_groups.saml_enabled')}
            </FlagMessage>
          )}
          <SelectList
            elements={groups?.map((group) => group.id.toString()) ?? []}
            elementsTotalCount={data?.pages[0]?.page?.total}
            loading={isLoading}
            needToReload={changedGroups.size > 0 && filter !== SelectListFilter.All}
            onSearch={onSearch}
            onSelect={handleSelect}
            onUnselect={handleUnselect}
            renderElement={renderElement}
            selectedElements={
              groups
                ?.filter((g) => (changedGroups.has(g.id) ? changedGroups.get(g.id) : g.selected))
                .map((g) => g.id) ?? []
            }
            withPaging
          />
        </div>
      }
      headerTitle={header}
      onClose={props.onClose}
      primaryButton={null}
      secondaryButtonLabel={translate('done')}
    />
  );
}
