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

import {
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  DropdownMenu,
  IconDelete,
  IconMoreVertical,
  Spinner,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { Image } from '~adapters/components/common/Image';
import { Badge, ContentCell, NumericalCell, TableRow } from '~design-system';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useGroupMembersCountQuery } from '~sq-server-commons/queries/group-memberships';
import { Group, Provider } from '~sq-server-commons/types/types';
import DeleteGroupForm from './DeleteGroupForm';
import GroupForm from './GroupForm';
import Members from './Members';

export interface ListItemProps {
  group: Group;
  manageProvider: Provider | undefined;
}

export default function ListItem(props: Readonly<ListItemProps>) {
  const { manageProvider, group } = props;
  const { name, managed, description } = group;

  const [groupToDelete, setGroupToDelete] = useState<Group | undefined>();
  const [groupToEdit, setGroupToEdit] = useState<Group | undefined>();

  const { data: membersCount, isLoading, refetch } = useGroupMembersCountQuery(group.id);

  const isManaged = () => {
    return manageProvider !== undefined;
  };

  const isGroupLocal = () => {
    return isManaged() && !managed;
  };

  const renderIdentityProviderIcon = (identityProvider: Provider | undefined) => {
    if (identityProvider === undefined || identityProvider === Provider.Scim) {
      return null;
    }

    return (
      <Image
        alt={identityProvider}
        className="sw-ml-2 sw-mr-2"
        height={16}
        src={`/images/alm/${identityProvider}.svg`}
      />
    );
  };

  return (
    <TableRow data-id={name}>
      <ContentCell>
        <div className="sw-typo-semibold">{name}</div>
        {group.default && <span className="sw-ml-1">({translate('default')})</span>}
        {managed && renderIdentityProviderIcon(manageProvider)}
        {isGroupLocal() && <Badge className="sw-ml-1">{translate('local')}</Badge>}
      </ContentCell>

      <NumericalCell>
        <Spinner isLoading={isLoading}>{membersCount}</Spinner>
        <Members group={group} isManaged={isManaged()} onEdit={refetch} />
      </NumericalCell>

      <ContentCell>{description}</ContentCell>

      <NumericalCell>
        {!group.default && (!isManaged() || isGroupLocal()) && (
          <>
            {isManaged() && isGroupLocal() && (
              <ButtonIcon
                Icon={IconDelete}
                ariaLabel={translateWithParameters('delete_x', name)}
                className="sw-ml-2"
                onClick={() => {
                  setGroupToDelete(group);
                }}
                size={ButtonSize.Medium}
                variety={ButtonVariety.DangerGhost}
              />
            )}
            {!isManaged() && (
              <DropdownMenu
                id={`group-actions-${group.name}`}
                items={
                  <>
                    <DropdownMenu.ItemButton
                      onClick={() => {
                        setGroupToEdit(group);
                      }}
                    >
                      {translate('update_details')}
                    </DropdownMenu.ItemButton>
                    <DropdownMenu.Separator />
                    <DropdownMenu.ItemButtonDestructive
                      className="it__quality-profiles__delete"
                      onClick={() => {
                        setGroupToDelete(group);
                      }}
                    >
                      {translate('delete')}
                    </DropdownMenu.ItemButtonDestructive>
                  </>
                }
              >
                <ButtonIcon
                  Icon={IconMoreVertical}
                  ariaLabel={translateWithParameters('groups.edit', group.name)}
                />
              </DropdownMenu>
            )}
          </>
        )}
        {groupToDelete && (
          <DeleteGroupForm
            group={groupToDelete}
            onClose={() => {
              setGroupToDelete(undefined);
            }}
          />
        )}
        {groupToEdit && (
          <GroupForm
            create={false}
            group={groupToEdit}
            onClose={() => {
              setGroupToEdit(undefined);
            }}
          />
        )}
      </NumericalCell>
    </TableRow>
  );
}
