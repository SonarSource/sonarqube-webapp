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

import {
  LoadingContainer,
  Pagination,
  SearchInput,
  SearchInputWidth,
  Table,
  TableCellJustify,
  TableVariety,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useOnboardingOrganizationKey } from '~adapters/queries/onboarding';
import { useOnboardingProjectsQuery } from '~shared/queries/onboarding';
import { OnboardingProject, OnboardingProjectsFilter } from '~shared/types/onboarding';
import { TableBodyRows } from './TableBodyRows';
import { TableHeaderRows } from './TableHeaderRows';
import { usePaginatedTableState } from './usePaginatedTableState';

/** The first column holds the project name, so it gets more room than the others. */
const FIRST_COLUMN_TEMPLATE = 'minmax(240px, 2.5fr)';
const COLUMN_TEMPLATE = 'minmax(120px, 1fr)';

export interface ProjectsTableColumn {
  className?: string;
  /**
   * Keep the header label out of the visual design but available to assistive technology, for
   * columns the design shows without a heading.
   */
  isLabelHidden?: boolean;
  justify?: TableCellJustify;
  labelKey: string;
  /** Grid track of this column. Defaults to a flexible one, wider for the first column. */
  width?: string;
}

export interface ProjectsTableRowProps {
  project: OnboardingProject;
}

interface Props {
  ariaLabel: string;
  columns: ProjectsTableColumn[];
  /** Extra class for the outer wrapper — e.g. modal-mode uses it to cap the height. */
  containerClassName?: string;
  /**
   * Server-side filter tokens, AND-ed by the backend. Changing them resets to the first page.
   */
  filters: OnboardingProjectsFilter[];
  loadingMessageKey?: string;
  pageSize: number;
  /**
   * Called once per project — must return a `Table.Row` element with a stable `key`. A function
   * (rather than a component) lets callers close over parent state such as row selection.
   */
  renderRow: (project: OnboardingProject) => ReactNode;
  /** Placeholder for the search input. Omit to render the toolbar without a search box. */
  searchPlaceholderKey?: string;
  searchWidth?: SearchInputWidth;
  /** Extra toolbar controls rendered next to the search input, e.g. the filter dropdowns. */
  toolbarControls?: ReactNode;
}

/**
 * Paged, searchable table of onboarding projects: a toolbar (optional search + filters + result
 * count), the table itself (with skeleton and empty states), and pagination. Searching, filtering
 * and paging are all server-side, driven by `useOnboardingProjectsQuery`.
 */
export function ProjectsTable({
  ariaLabel,
  columns,
  containerClassName,
  filters,
  loadingMessageKey,
  pageSize,
  renderRow,
  searchPlaceholderKey,
  searchWidth,
  toolbarControls,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const tableRef = useRef<HTMLTableElement>(null);

  const organizationKey = useOnboardingOrganizationKey();

  // Callers rebuild the array on every render, so key the reset off the tokens themselves.
  const filtersKey = filters.join(',');
  const { onPageChange, onSearchChange, pageIndex, query, searchValue } =
    usePaginatedTableState(filtersKey);

  const { data, isLoading } = useOnboardingProjectsQuery({
    organizationKey,
    filters,
    pageIndex,
    pageSize,
    q: query === '' ? undefined : query,
  });

  // Scroll the (scrollable) table body back to the top whenever a new page lands.
  useEffect(() => {
    tableRef.current?.scrollTo?.({ top: 0 });
  }, [data]);

  const projects = useMemo(() => data?.projects ?? [], [data?.projects]);
  const total = data?.page.total ?? 0;
  const totalPages = data === undefined ? 0 : Math.ceil(data.page.total / data.page.pageSize);

  const gridTemplate = columns
    .map(({ width }, index) => width ?? (index === 0 ? FIRST_COLUMN_TEMPLATE : COLUMN_TEMPLATE))
    .join(' ');

  return (
    <LoadingContainer
      isLoading={isLoading}
      loadingMessage={formatMessage({ id: loadingMessageKey ?? 'loading' })}
    >
      <div className={`sw-flex sw-flex-col sw-gap-4 ${containerClassName ?? ''}`.trim()}>
        <div className="sw-flex sw-w-full sw-items-center sw-justify-between">
          <div className="sw-flex sw-items-center sw-gap-4">
            {searchPlaceholderKey !== undefined && (
              <SearchInput
                onChange={onSearchChange}
                placeholderLabel={formatMessage({ id: searchPlaceholderKey })}
                value={searchValue}
                width={searchWidth ?? SearchInputWidth.Large}
              />
            )}
            {toolbarControls}
          </div>

          <Text as="span" className="sw-ml-auto" isSubtle size={TextSize.Small}>
            {formatMessage(
              { id: 'onboarding_dashboard.table.results_size' },
              { size: projects.length, total },
            )}
          </Text>
        </div>

        <Table
          ariaLabel={ariaLabel}
          className="sw-overflow-y-auto sw-content-start"
          gridTemplate={gridTemplate}
          ref={tableRef}
          variety={TableVariety.Surface}
        >
          <Table.Header>
            <TableHeaderRows columns={columns} />
          </Table.Header>

          <Table.Body>
            <TableBodyRows
              columnCount={columns.length}
              isLoading={isLoading}
              items={projects}
              renderRow={renderRow}
              rowCount={pageSize}
            />
          </Table.Body>
        </Table>

        {totalPages > 1 && (
          <div className="sw-shrink-0 sw-flex sw-justify-center">
            <Pagination onChange={onPageChange} page={pageIndex} totalPages={totalPages} />
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}
