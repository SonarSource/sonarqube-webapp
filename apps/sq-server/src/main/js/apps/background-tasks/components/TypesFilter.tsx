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
import { useIntl } from 'react-intl';
import { ALL_TYPES } from '../constants';

interface Props {
  id: string;
  onChange: (v: string) => void;
  types: string[];
  value: string;
}

export function TypesFilter(props: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { value, types, id, onChange } = props;
  const options = types.map((t) => {
    return {
      value: t,
      label: formatMessage({ id: `background_task.type.${t}` }),
    };
  });

  const allOptions: SelectOption[] = [
    { value: ALL_TYPES, label: formatMessage({ id: 'background_task.type.ALL' }) },
    ...options,
  ];

  return (
    <Select
      ariaLabelledBy="background-task-type-filter-label"
      data={allOptions}
      isNotClearable
      name={id}
      onChange={onChange}
      value={value}
      width="medium"
    />
  );
}
