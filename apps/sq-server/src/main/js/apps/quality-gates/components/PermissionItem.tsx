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

import {
  Button,
  ButtonIcon,
  ButtonVariety,
  IconDelete,
  IconPeople,
  ModalAlert,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ContentCell, GenericAvatar, Note } from '~design-system';
import Avatar from '~sq-server-shared/components/ui/Avatar';
import { translate } from '~sq-server-shared/helpers/l10n';
import { Group, isUser } from '~sq-server-shared/types/quality-gates';
import { UserBase } from '~sq-server-shared/types/users';

export interface PermissionItemProps {
  item: UserBase | Group;
  onConfirmDelete: (item: UserBase | Group) => void;
}

export default function PermissionItem(props: PermissionItemProps) {
  const { item } = props;
  const { formatMessage } = useIntl();

  return (
    <>
      <ContentCell width={0}>
        {isUser(item) ? (
          <Avatar hash={item.avatar} name={item.name} size="md" />
        ) : (
          <GenericAvatar Icon={IconPeople} name={item.name} size="md" />
        )}
      </ContentCell>

      <ContentCell>
        <div className="sw-flex sw-flex-col">
          <strong className="sw-typo-semibold">{item.name}</strong>
          {isUser(item) && <Note>{item.login}</Note>}
        </div>
      </ContentCell>

      <ContentCell>
        <ModalAlert
          description={
            <FormattedMessage
              defaultMessage={
                isUser(item)
                  ? translate('quality_gates.permissions.remove.user.confirmation')
                  : translate('quality_gates.permissions.remove.group.confirmation')
              }
              id="remove.confirmation"
              values={{
                user: <strong>{item.name}</strong>,
              }}
            />
          }
          primaryButton={
            <Button onClick={() => props.onConfirmDelete(item)} variety={ButtonVariety.Danger}>
              {translate('remove')}
            </Button>
          }
          secondaryButtonLabel={translate('close')}
          title={
            isUser(item)
              ? translate('quality_gates.permissions.remove.user')
              : translate('quality_gates.permissions.remove.group')
          }
        >
          <ButtonIcon
            Icon={IconDelete}
            ariaLabel={formatMessage({
              id: isUser(item)
                ? 'quality_gates.permissions.remove.user'
                : 'quality_gates.permissions.remove.group',
            })}
            data-testid="permission-delete-button"
            variety={ButtonVariety.DangerGhost}
          />
        </ModalAlert>
      </ContentCell>
    </>
  );
}
