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

import { ReactNode } from 'react';
import { ProjectsTableEmptyRow } from './ProjectsTableEmptyRow';
import { ProjectsTableRowsSkeleton } from './ProjectsTableRowsSkeleton';

interface Props<T> {
  columnCount: number;
  isLoading: boolean;
  items: T[];
  renderRow: (item: T) => ReactNode;
  rowCount: number;
}

/**
 * Table body content shared by {@link ProjectsTable} and {@link RepositoriesTable}: a loading
 * skeleton, an empty-state row, or the rendered items — whichever applies.
 */
export function TableBodyRows<T>({
  columnCount,
  isLoading,
  items,
  renderRow,
  rowCount,
}: Readonly<Props<T>>) {
  if (isLoading) {
    return <ProjectsTableRowsSkeleton columns={columnCount} rows={rowCount} />;
  }

  if (items.length === 0) {
    return <ProjectsTableEmptyRow columns={columnCount} />;
  }

  return <>{items.map(renderRow)}</>;
}
