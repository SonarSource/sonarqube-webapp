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

import { useEffect, useState } from 'react';
import { useDebouncedValue } from '~shared/helpers/useDebouncedValue';

/**
 * Debounced search value + page state shared by the onboarding-dashboard tables. `resetKey` should
 * encode every filter dimension that must send the caller back to page 1 (typically the joined
 * filter tokens, or a single enum value); changing it — and changing the debounced query — resets
 * the page index.
 */
export function usePaginatedTableState(resetKey: string) {
  const [searchValue, query, onSearchChange] = useDebouncedValue();
  const [pageIndex, setPageIndex] = useState(1);

  useEffect(() => {
    setPageIndex(1);
  }, [resetKey, query]);

  return { onPageChange: setPageIndex, onSearchChange, pageIndex, query, searchValue };
}
