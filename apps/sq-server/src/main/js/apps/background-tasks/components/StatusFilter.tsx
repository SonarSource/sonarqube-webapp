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

import { Select, SelectOption } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { TaskStatuses } from '~sq-server-commons/types/tasks';
import { STATUSES } from '../constants';

interface StatusFilterProps {
  id: string;
  onChange: (value?: string) => void;
  value?: string;
}

export default function StatusFilter(props: Readonly<StatusFilterProps>) {
  const { formatMessage } = useIntl();
  const { id, value, onChange } = props;

  const options: SelectOption[] = [
    { value: STATUSES.ALL, label: formatMessage({ id: 'background_task.status.ALL' }) },
    {
      value: STATUSES.ALL_EXCEPT_PENDING,
      label: formatMessage({ id: 'background_task.status.ALL_EXCEPT_PENDING' }),
    },
    { value: TaskStatuses.Pending, label: formatMessage({ id: 'background_task.status.PENDING' }) },
    {
      value: TaskStatuses.InProgress,
      label: formatMessage({ id: 'background_task.status.IN_PROGRESS' }),
    },
    { value: TaskStatuses.Success, label: formatMessage({ id: 'background_task.status.SUCCESS' }) },
    { value: TaskStatuses.Failed, label: formatMessage({ id: 'background_task.status.FAILED' }) },
    {
      value: TaskStatuses.Canceled,
      label: formatMessage({ id: 'background_task.status.CANCELED' }),
    },
  ];

  const handleChange = React.useCallback(
    (value: string) => {
      onChange(value);
    },
    [onChange],
  );

  return (
    <Select
      ariaLabelledBy="background-task-status-filter-label"
      data={options}
      isNotClearable
      name={id}
      onChange={handleChange}
      value={value}
      width="medium"
    />
  );
}
