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
  Badge,
  BadgeVariety,
  ButtonIcon,
  DropdownMenu,
  IconMoreVertical,
  Spinner,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { Image } from '~adapters/components/common/Image';
import { ContentCell, NumericalCell, TableRow } from '~design-system';
import { GroupNotificationSubscription } from '~sq-server-commons/api/group-notifications';
import { useGroupMembersCountQuery } from '~sq-server-commons/queries/group-memberships';
import { Group, Provider } from '~sq-server-commons/types/types';
import DeleteGroupForm from './DeleteGroupForm';
import GroupForm from './GroupForm';
import { GroupNotificationSubscriptionsModal } from './GroupNotificationSubscriptionsModal';
import Members from './Members';

import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentTheme } from '~shared/helpers/css';
import { almIconUrl } from '~sq-server-commons/helpers/almIcons';

export interface ListItemProps {
  group: Group;
  manageProvider: Provider | undefined;
  subscriptions: GroupNotificationSubscription[];
}

export default function ListItem(props: Readonly<ListItemProps>) {
  const { manageProvider, group, subscriptions } = props;
  const { name, managed, description } = group;

  const { formatMessage } = useIntl();
  const [groupToDelete, setGroupToDelete] = useState<Group | undefined>();
  const [groupToEdit, setGroupToEdit] = useState<Group | undefined>();
  const [groupToSubscribe, setGroupToSubscribe] = useState<Group | undefined>();

  const { data: membersCount, isLoading, refetch } = useGroupMembersCountQuery(group.id);

  const currentTheme = useCurrentTheme();

  const groupSubscriptionTypes = [
    ...new Set(
      subscriptions.filter((s) => s.groupUuid === group.id).map((s) => s.notificationType),
    ),
  ];

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
        src={almIconUrl(currentTheme, identityProvider)}
      />
    );
  };

  return (
    <TableRow data-id={name}>
      <ContentCell>
        <div className="sw-typo-semibold">{name}</div>
        {group.default && (
          <span className="sw-ml-1">
            (<FormattedMessage id="default" />)
          </span>
        )}
        {managed && renderIdentityProviderIcon(manageProvider)}
        {isGroupLocal() && (
          <Badge className="sw-ml-1" variety={BadgeVariety.Neutral}>
            <FormattedMessage id="local" />
          </Badge>
        )}
      </ContentCell>
      <NumericalCell>
        <Spinner isLoading={isLoading}>{membersCount}</Spinner>
        <Members group={group} isManaged={isManaged()} onEdit={refetch} />
      </NumericalCell>
      <ContentCell>{description}</ContentCell>
      <ContentCell>
        <div className="sw-flex sw-gap-2">
          {groupSubscriptionTypes.map((notificationType) => (
            <Badge key={notificationType} variety={BadgeVariety.Neutral}>
              <FormattedMessage id={`notification.dispatcher.${notificationType}`} />
            </Badge>
          ))}
        </div>
      </ContentCell>
      <NumericalCell>
        <DropdownMenu
          id={`group-actions-${group.name}`}
          items={
            <>
              {!group.default && !isManaged() && (
                <DropdownMenu.ItemButton
                  onClick={() => {
                    setGroupToEdit(group);
                  }}
                >
                  <FormattedMessage id="update_details" />
                </DropdownMenu.ItemButton>
              )}
              <DropdownMenu.ItemButton
                onClick={() => {
                  setGroupToSubscribe(group);
                }}
              >
                <FormattedMessage id="group_notifications.manage_subscriptions" />
              </DropdownMenu.ItemButton>
              {!group.default && (!isManaged() || isGroupLocal()) && (
                <>
                  <DropdownMenu.Separator />
                  <DropdownMenu.ItemButtonDestructive
                    onClick={() => {
                      setGroupToDelete(group);
                    }}
                  >
                    <FormattedMessage id="delete" />
                  </DropdownMenu.ItemButtonDestructive>
                </>
              )}
            </>
          }
        >
          <ButtonIcon
            Icon={IconMoreVertical}
            ariaLabel={formatMessage({ id: 'groups.actions' }, { 0: group.name })}
          />
        </DropdownMenu>
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
        {groupToSubscribe && (
          <GroupNotificationSubscriptionsModal
            group={groupToSubscribe}
            onClose={() => {
              setGroupToSubscribe(undefined);
            }}
          />
        )}
      </NumericalCell>
    </TableRow>
  );
}
