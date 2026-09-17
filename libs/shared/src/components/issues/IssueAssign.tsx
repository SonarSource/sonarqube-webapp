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

import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Avatar from '~adapters/components/ui/Avatar';
import { isInput, isShortcut } from '../../helpers/keyboard';

interface IssueForAssign {
  assignee?: string;
  assigneeActive?: boolean;
  assigneeAvatar?: string;
  assigneeName?: string;
  key: string;
}

export interface AssigneeUser {
  login: string;
  name?: string;
  avatar?: string;
}

export interface DropdownRenderProps {
  menuIsOpen: boolean;
  onMenuClose: () => void;
  onSelect: (user: AssigneeUser) => void;
  value: string | undefined;
  valueRenderer: () => JSX.Element;
}

export interface IssueAssignProps {
  canAssign: boolean;
  isSelected: boolean;
  issue: IssueForAssign;
  isShortcutEnabled?: boolean;
  onAssign: (user: AssigneeUser) => void;
  renderDropdown: (props: DropdownRenderProps) => JSX.Element;
}

export function IssueAssign(props: Readonly<IssueAssignProps>) {
  const [open, setOpen] = useState(false);
  const {
    onAssign,
    issue,
    canAssign,
    isSelected,
    isShortcutEnabled = true,
    renderDropdown,
  } = props;
  const { formatMessage } = useIntl();

  const selectContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (user: AssigneeUser) => {
      onAssign(user);
      setOpen(false);
    },
    [onAssign],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isInput(event) || !isShortcutEnabled) {
        return;
      }

      if (event.key === 'a' && !isShortcut(event)) {
        event.preventDefault();
        selectContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setOpen(true);
      }
    },
    [isShortcutEnabled],
  );

  const handleMenuClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (isSelected && canAssign) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canAssign, handleKeyDown, isSelected]);

  useEffect(() => {
    if (!isSelected) {
      setOpen(false);
    }
  }, [isSelected]);

  const assigneeName = (issue.assigneeActive && issue.assigneeName) || issue.assignee;

  const renderAssignee = useCallback(() => {
    if (assigneeName) {
      return (
        <span className="sw-flex sw-items-center sw-gap-1">
          <Avatar className="sw-mr-1" hash={issue.assigneeAvatar} name={assigneeName} size="xs" />
          <span className="sw-truncate sw-max-w-abs-300 fs-mask">
            {issue.assigneeActive
              ? assigneeName
              : formatMessage({ id: 'user.x_deleted' }, { 0: assigneeName })}
          </span>
        </span>
      );
    }

    return (
      <span className="sw-flex sw-items-center sw-gap-1">
        <FormattedMessage id="unassigned" />
      </span>
    );
  }, [assigneeName, issue.assigneeAvatar, issue.assigneeActive, formatMessage]);

  if (canAssign) {
    return (
      <div ref={selectContainerRef}>
        {renderDropdown({
          menuIsOpen: open,
          onMenuClose: handleMenuClose,
          onSelect: handleSelect,
          value: assigneeName,
          valueRenderer: renderAssignee,
        })}
      </div>
    );
  }
  return renderAssignee();
}
