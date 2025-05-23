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

import { omit } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import {
  Avatar,
  GenericAvatar,
  LabelValueSelectOption,
  SearchSelectDropdown,
  UserGroupIcon,
} from '~design-system';
import {
  SearchUsersGroupsParameters,
  searchGroups,
  searchUsers,
} from '~sq-server-commons/api/quality-profiles';
import { UserSelected } from '~sq-server-commons/types/types';
import { Group } from './ProfilePermissions';

type Option = UserSelected | Group;

interface Props {
  onChange: (option: Option) => void;
  profile: { language: string; name: string };
  selected?: Option;
}

export default function ProfilePermissionsFormSelect(props: Readonly<Props>) {
  const { profile, selected } = props;
  const [defaultOptions, setDefaultOptions] = React.useState<LabelValueSelectOption<string>[]>([]);
  const intl = useIntl();

  const value = selected ? getOption(selected) : null;
  const controlLabel = selected ? (
    <>
      {isUser(selected) ? (
        <Avatar className="sw-mt-1" hash={selected.avatar} name={selected.name} size="xs" />
      ) : (
        <GenericAvatar Icon={UserGroupIcon} className="sw-mt-1" name={selected.name} size="xs" />
      )}{' '}
      {selected.name}
    </>
  ) : undefined;

  const loadOptions = React.useCallback(
    async (q = '') => {
      const parameters: SearchUsersGroupsParameters = {
        language: profile.language,
        q,
        qualityProfile: profile.name,
        selected: 'deselected',
      };
      const [{ users }, { groups }] = await Promise.all([
        searchUsers(parameters),
        searchGroups(parameters),
      ]);

      return { users, groups };
    },
    [profile.language, profile.name],
  );

  const loadInitial = React.useCallback(async () => {
    try {
      const { users, groups } = await loadOptions();
      setDefaultOptions([...users, ...groups].map(getOption));
    } catch {
      // noop
    }
  }, [loadOptions]);

  const handleSearch = (q: string, cb: (options: LabelValueSelectOption<string>[]) => void) => {
    loadOptions(q)
      .then(({ users, groups }) => [...users, ...groups].map(getOption))
      // eslint-disable-next-line promise/no-callback-in-promise
      .then(cb)
      // eslint-disable-next-line promise/no-callback-in-promise
      .catch(() => {
        cb([]);
      });
  };

  const handleChange = (option: LabelValueSelectOption<string>) => {
    props.onChange(omit(option, ['Icon', 'label', 'value']) as Option);
  };

  React.useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return (
    <SearchSelectDropdown
      controlAriaLabel={intl.formatMessage({ id: 'quality_profiles.search_description' })}
      controlLabel={controlLabel}
      defaultOptions={defaultOptions}
      id="change-profile-permission"
      inputId="change-profile-permission-input"
      loadOptions={handleSearch}
      onChange={handleChange}
      size="full"
      value={value}
    />
  );
}

const getOption = (option: Option): LabelValueSelectOption<string> => {
  return {
    ...option,
    value: getStringValue(option),
    label: option.name,
    Icon: isUser(option) ? (
      <Avatar hash={option.avatar} name={option.name} size="xs" />
    ) : (
      <GenericAvatar Icon={UserGroupIcon} name={option.name} size="xs" />
    ),
  };
};

function isUser(option: Option): option is UserSelected {
  return (option as UserSelected).login !== undefined;
}

function getStringValue(option: Option) {
  return isUser(option) ? `user:${option.login}` : `group:${option.name}`;
}
