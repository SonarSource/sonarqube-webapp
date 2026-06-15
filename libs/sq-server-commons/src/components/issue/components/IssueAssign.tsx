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
import { CurrentUserContext } from '../../../context/current-user/CurrentUserContext';
import { useUsersQueries } from '../../../queries/users';
import { Issue } from '../../../types/types';
import { isLoggedIn } from '../../../types/users';
import { IssueAssignee } from './IssueAssignee';

interface Props {
  canAssign: boolean;
  isOpen: boolean;
  issue: Issue;
  onAssign: (login: string) => void;
  togglePopup: (popup: string, show?: boolean) => void;
}

const minSearchLength = 2;

const useOptions = ({
  assigneeLogin,
  assigneeAvatar,
  assignedUser,
}: Readonly<{
  assignedUser?: string;
  assigneeAvatar?: string;
  assigneeLogin?: string;
}>) => {
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
};

export default function IssueAssign({
  canAssign,
  isOpen,
  onAssign,
  togglePopup,
  issue: { assignee, assigneeName, assigneeLogin, assigneeAvatar, assigneeActive },
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const inputRef = useRef<HTMLInputElement>(null);
  const assignedUser = assigneeName ?? assignee;

  const { options, searchQuery, setSearchQuery } = useOptions({
    assigneeLogin,
    assigneeAvatar,
    assignedUser,
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleDropdown = useCallback(
    (open: boolean) => {
      togglePopup('assign', open);
    },
    [togglePopup],
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (query.length < minSearchLength || query === searchQuery) {
        return;
      }
      setSearchQuery(query);
    },
    [setSearchQuery, searchQuery],
  );

  const handleAssign = (option: AssigneeSelectOption) => {
    onAssign(option.value);
    inputRef.current?.blur();
  };

  if (!canAssign) {
    return (
      <IssueAssignee
        assignee={assignee}
        assigneeAvatar={assigneeAvatar}
        assigneeName={assigneeName}
        isActive={assigneeActive}
      />
    );
  }

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
      value={assignedUser ? assigneeLogin : undefined}
      valueIcon={valueIcon}
      width="small"
    />
  );
}
