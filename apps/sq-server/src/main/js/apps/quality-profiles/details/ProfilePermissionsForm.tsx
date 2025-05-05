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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormField, Modal } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  useAddGroupMutation,
  useAddUserMutation,
} from '~sq-server-commons/queries/quality-profiles';
import { UserSelected } from '~sq-server-commons/types/types';
import { Group } from './ProfilePermissions';
import ProfilePermissionsFormSelect from './ProfilePermissionsFormSelect';

interface Props {
  onClose: () => void;
  onGroupAdd: (group: Group) => void;
  onUserAdd: (user: UserSelected) => void;
  profile: { language: string; name: string };
}

export default function ProfilePermissionForm(props: Readonly<Props>) {
  const { profile } = props;
  const [selected, setSelected] = React.useState<UserSelected | Group>();

  const { mutate: addUser, isPending: addingUser } = useAddUserMutation(() => {
    props.onUserAdd(selected as UserSelected);
  });
  const { mutate: addGroup, isPending: addingGroup } = useAddGroupMutation(() => {
    props.onGroupAdd(selected as Group);
  });

  const loading = addingUser || addingGroup;

  const header = translate('quality_profiles.grant_permissions_to_user_or_group');
  const submitDisabled = !selected || loading;

  const handleFormSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selected) {
      if (isSelectedUser(selected)) {
        addUser({
          language: profile.language,
          login: selected.login,
          qualityProfile: profile.name,
        });
      } else {
        addGroup({
          language: profile.language,
          group: selected.name,
          qualityProfile: profile.name,
        });
      }
    }
  };

  return (
    <Modal
      body={
        <form id="grant_permissions_form" onSubmit={handleFormSubmit}>
          <FormField label={translate('quality_profiles.search_description')}>
            <ProfilePermissionsFormSelect
              onChange={(option) => {
                setSelected(option);
              }}
              profile={profile}
              selected={selected}
            />
          </FormField>
        </form>
      }
      headerTitle={header}
      isOverflowVisible
      loading={loading}
      onClose={props.onClose}
      primaryButton={
        <Button
          form="grant_permissions_form"
          isDisabled={submitDisabled}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('add_verb')}
        </Button>
      }
      secondaryButtonLabel={translate('cancel')}
    />
  );
}

function isSelectedUser(selected: UserSelected | Group): selected is UserSelected {
  return (selected as UserSelected).login !== undefined;
}
