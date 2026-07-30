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
import { NO_DATA } from '../dashboardConstants';

interface Props {
  /** Number of cells to render (must match the table's column count). */
  columns: number;
}

/**
 * Single "no data" table row: an em dash per column. Shared by the project tables so an empty
 * result set looks the same everywhere.
 */
export function ProjectsTableEmptyRow({ columns }: Readonly<Props>) {
  return (
    <Table.Row>
      <Table.Cell className="sw-justify-start">{NO_DATA}</Table.Cell>
      {Array.from({ length: columns - 1 }, (_, index) => (
        <Table.Cell key={`empty-cell-${index}`}>{NO_DATA}</Table.Cell>
      ))}
    </Table.Row>
  );
}
