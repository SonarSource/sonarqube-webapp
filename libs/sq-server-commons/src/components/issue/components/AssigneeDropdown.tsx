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

import { debounce } from 'lodash';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import Avatar from '~adapters/components/ui/Avatar';
import {
  AssigneeSelect,
  AssigneeSelectOption,
  userToOption,
} from '~shared/components/issues/AssigneeSelect';
import { AssigneeUser } from '~shared/components/issues/IssueAssign';
import { CurrentUserContext } from '../../../context/current-user/CurrentUserContext';
import { useUsersQueries } from '../../../queries/users';
import { isLoggedIn } from '../../../types/users';

const MIN_SEARCH_LENGTH = 2;

function useOptions({
  assigneeLogin,
  assigneeAvatar,
  assignedUser,
}: Readonly<{
  assignedUser?: string;
  assigneeAvatar?: string;
  assigneeLogin?: string;
}>) {
  const { formatMessage } = useIntl();
  const { currentUser } = useContext(CurrentUserContext);

  const [searchQuery, setSearchQuery] = useState('');
  const { data } = useUsersQueries({ q: searchQuery }, !!searchQuery);

  const unassignedOption: AssigneeSelectOption = useMemo(
    () => ({ value: '', label: formatMessage({ id: 'unassigned' }) }),
    [formatMessage],
  );

  const defaultOptions = useMemo((): AssigneeSelectOption[] => {
    const opts = new Map<string, AssigneeSelectOption>();
    opts.set(unassignedOption.value, unassignedOption);

    if (isLoggedIn(currentUser)) {
      opts.set(currentUser.login, userToOption(currentUser));
    }

    if (assigneeLogin) {
      opts.set(assigneeLogin, {
        Icon: assigneeAvatar ? (
          <Avatar className="sw-my-1" hash={assigneeAvatar} name={assignedUser} size="xs" />
        ) : undefined,
        label: assignedUser ?? assigneeLogin,
        value: assigneeLogin,
      });
    }

    return Array.from(opts.values());
  }, [currentUser, assigneeLogin, assignedUser, assigneeAvatar, unassignedOption]);

  const allOptions = useMemo((): AssigneeSelectOption[] => {
    if (!data?.pages) {
      return defaultOptions;
    }

    const merged = new Map<string, AssigneeSelectOption>(defaultOptions.map((o) => [o.value, o]));
    data.pages.forEach((page) => {
      page.users.forEach((o) => merged.set(o.login, userToOption(o)));
    });
    return Array.from(merged.values());
  }, [defaultOptions, data?.pages]);

  const debouncedSetQuery = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
      }, 250),
    [setSearchQuery],
  );

  useEffect(() => {
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [debouncedSetQuery]);

  return { options: allOptions, searchQuery, setSearchQuery: debouncedSetQuery };
}

export interface AssigneeDropdownProps {
  assigneeAvatar?: string;
  assigneeLogin?: string;
  assignedUser?: string;
  menuIsOpen: boolean;
  onMenuClose: () => void;
  onSelect: (user: AssigneeUser) => void;
}

export function AssigneeDropdown({
  assigneeAvatar,
  assigneeLogin,
  assignedUser,
  menuIsOpen,
  onMenuClose,
  onSelect,
}: Readonly<AssigneeDropdownProps>) {
  const { formatMessage } = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const { options, searchQuery, setSearchQuery } = useOptions({
    assigneeLogin,
    assigneeAvatar,
    assignedUser,
  });

  const handleSearch = useCallback(
    (query: string) => {
      if (query.length < MIN_SEARCH_LENGTH || query === searchQuery) {
        return;
      }
      setSearchQuery(query);
    },
    [setSearchQuery, searchQuery],
  );

  useEffect(() => {
    if (menuIsOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [menuIsOpen]);

  const handleAssign = useCallback(
    (option: AssigneeSelectOption) => {
      onSelect({ login: option.value, name: option.label });
    },
    [onSelect],
  );

  const handleToggleDropdown = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onMenuClose();
      }
    },
    [onMenuClose],
  );

  const ariaLabel = assignedUser
    ? formatMessage({ id: 'issue.assign.assigned_to_x_click_to_change' }, { user: assignedUser })
    : formatMessage({ id: 'issue.assign.unassigned_click_to_assign' });

  const valueIcon = assigneeLogin ? (
    <Avatar className="sw-my-1" hash={assigneeAvatar} name={assignedUser} size="xs" />
  ) : undefined;

  return (
    <AssigneeSelect
      ariaLabel={ariaLabel}
      className="it__issue-assign"
      data={options}
      labelNotFound={formatMessage({ id: 'select.search.noMatches' })}
      onChange={handleAssign}
      onSearch={handleSearch}
      onToggleDropdown={handleToggleDropdown}
      placeholder={formatMessage({ id: 'unassigned' })}
      ref={inputRef}
      value={assigneeLogin}
      valueIcon={valueIcon}
      width="small"
    />
  );
}
