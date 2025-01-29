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

import { noop } from 'lodash';
import * as React from 'react';
import { Options, SingleValue } from 'react-select';
import {
  LabelValueSelectOption,
  SearchSelectDropdown,
  addGlobalSuccessMessage,
} from '~design-system';
import { assignSecurityHotspot } from '~sq-server-shared/api/security-hotspots';
import { getUsers } from '~sq-server-shared/api/users';
import Avatar from '~sq-server-shared/components/ui/Avatar';
import { CurrentUserContext } from '~sq-server-shared/context/current-user/CurrentUserContext';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import {
  Hotspot,
  HotspotResolution,
  HotspotStatus,
} from '~sq-server-shared/types/security-hotspots';
import { RestUser, isLoggedIn, isUserActive } from '~sq-server-shared/types/users';

interface Props {
  hotspot: Hotspot;
  onAssigneeChange: () => Promise<void>;
}

const minSearchLength = 2;

const UNASSIGNED = { value: '', label: translate('unassigned') };

const renderAvatar = (name?: string, avatar?: string) => (
  <Avatar hash={avatar} name={name} size="xs" />
);

export default function Assignee(props: Props) {
  const {
    hotspot: { assigneeUser, status, resolution, key },
  } = props;

  const { currentUser } = React.useContext(CurrentUserContext);

  const allowCurrentUserSelection =
    isLoggedIn(currentUser) && currentUser?.login !== assigneeUser?.login;

  const defaultOptions = allowCurrentUserSelection
    ? [
        UNASSIGNED,
        {
          value: currentUser.login,
          label: currentUser.name,
          Icon: renderAvatar(currentUser.name, currentUser.avatar),
        },
      ]
    : [UNASSIGNED];

  const canEdit =
    status === HotspotStatus.TO_REVIEW || resolution === HotspotResolution.ACKNOWLEDGED;

  const controlLabel = assigneeUser ? (
    <>
      <Avatar hash={assigneeUser.avatar} name={assigneeUser?.name} size="xs" className="sw-mt-1" />{' '}
      {assigneeUser.name}
    </>
  ) : (
    UNASSIGNED.label
  );

  const handleSearchAssignees = (
    query: string,
    cb: (options: Options<LabelValueSelectOption<string>>) => void,
  ) => {
    getUsers<RestUser>({ q: query })
      .then((result) => {
        const options: Array<LabelValueSelectOption<string>> = result.users
          .filter(isUserActive)
          .map((u) => ({
            label: u.name ?? u.login,
            value: u.login,
            Icon: renderAvatar(u.name, u.avatar),
          }));

        cb(options);
      })
      .catch(() => {
        cb([]);
      });
  };

  const handleAssign = (userOption: SingleValue<LabelValueSelectOption<string>>) => {
    if (userOption) {
      assignSecurityHotspot(key, {
        assignee: userOption.value,
      })
        .then(() => {
          props.onAssigneeChange();

          addGlobalSuccessMessage(
            userOption.value
              ? translateWithParameters('hotspots.assign.success', userOption.label)
              : translate('hotspots.assign.unassign.success'),
          );
        })
        .catch(noop);
    }
  };

  return (
    <SearchSelectDropdown
      size="medium"
      isDisabled={!canEdit || !isLoggedIn(currentUser)}
      controlAriaLabel={translate('hotspots.assignee.change_user')}
      defaultOptions={defaultOptions}
      onChange={handleAssign}
      loadOptions={handleSearchAssignees}
      minLength={minSearchLength}
      isDiscreet
      controlLabel={controlLabel}
      placeholder={translate('search.search_for_users')}
      aria-label={translate('search.search_for_users')}
    />
  );
}
