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

import { LoadingSkeleton, Table } from '@sonarsource/echoes-react';

interface Props {
  /** Number of cells to render per row (must match the table's column count). */
  columns: number;
  hasSelectionColumn?: boolean;
  /** Number of placeholder rows to render. */
  rows?: number;
}

/**
 * Placeholder table body rows shown while project data loads.
 * `isLoading` is read from the enclosing LoadingContainer context. Reused by the stale-projects
 * and repositories tables, as well as the dashboard-wide loading skeleton.
 */
export function ProjectsTableRowsSkeleton({
  columns,
  hasSelectionColumn = false,
  rows = 5,
}: Readonly<Props>) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Table.Row key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Table.Cell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
              {hasSelectionColumn && columnIndex === 0 ? (
                <LoadingSkeleton className="sw:size-4" variety="rectangle" />
              ) : (
                <LoadingSkeleton className="sw:w-3/4" variety="text" />
              )}
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
}
