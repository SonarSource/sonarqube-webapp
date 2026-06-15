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

import { useIntl } from 'react-intl';
import Avatar from '~adapters/components/ui/Avatar';

interface IssueAssigneeProps {
  assignee?: string;
  assigneeAvatar?: string;
  assigneeName?: string;
  isActive?: boolean;
}

export function IssueAssignee({
  assignee,
  isActive,
  assigneeAvatar,
  assigneeName,
}: Readonly<IssueAssigneeProps>) {
  const { formatMessage } = useIntl();
  const name = (isActive && assigneeName) || assignee;

  if (name) {
    return (
      <span className="sw-flex sw-items-center sw-gap-1">
        <Avatar className="sw-mr-1" hash={assigneeAvatar} name={name} size="xs" />
        <span className="sw-truncate sw-max-w-abs-300 fs-mask">
          {isActive ? name : formatMessage({ id: 'user.x_deleted' }, { user: name })}
        </span>
      </span>
    );
  }

  return (
    <span className="sw-flex sw-items-center sw-gap-1">{formatMessage({ id: 'unassigned' })}</span>
  );
}
