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

import { Table } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { ProjectsTableColumn } from './ProjectsTable';

const STICKY_HEADER_CLASSES = 'sw-sticky sw-top-0 sw-z-normal';

interface Props {
  columns: ProjectsTableColumn[];
}

/** Header row shared by {@link ProjectsTable} and {@link RepositoriesTable}. */
export function TableHeaderRows({ columns }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <Table.Row>
      {columns.map(({ className, isLabelHidden, justify, labelKey }) => {
        const label = formatMessage({ id: labelKey });
        const headerClass = [STICKY_HEADER_CLASSES, className].filter(Boolean).join(' ');

        return (
          <Table.ColumnHeaderCell
            className={headerClass}
            justify={justify}
            key={labelKey}
            label={isLabelHidden ? <span className="sw-sr-only">{label}</span> : label}
          />
        );
      })}
    </Table.Row>
  );
}
