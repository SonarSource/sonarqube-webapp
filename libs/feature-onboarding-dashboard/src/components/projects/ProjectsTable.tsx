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
import { Fragment, ReactNode, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useOnboardingOrganizationKey } from '~adapters/queries/onboarding';
import { useDebouncedValue } from '~shared/helpers/useDebouncedValue';
import { useOnboardingProjectsQuery } from '~shared/queries/onboarding';
import { OnboardingProject, OnboardingProjectsFilter } from '~shared/types/onboarding';
import { ProjectsTableEmptyRow } from './ProjectsTableEmptyRow';
import { ProjectsTableRowsSkeleton } from './ProjectsTableRowsSkeleton';

/** The first column holds the project name, so it gets more room than the others. */
const FIRST_COLUMN_TEMPLATE = 'minmax(240px, 2.5fr)';
const COLUMN_TEMPLATE = 'minmax(120px, 1fr)';
const STICKY_HEADER_CLASSES = 'sw-sticky sw-top-0 sw-z-normal';

export interface ProjectsTableColumn {
  className?: string;
  /**
   * Keep the header label out of the visual design but available to assistive technology, for
   * columns the design shows without a heading.
   */
  isLabelHidden?: boolean;
  justify?: TableCellJustify;
  labelKey: string;
  /**
   * Optional replacement for the default `Table.ColumnHeaderCell` — use it for special header
   * cells such as `Table.ColumnHeaderCellCheckbox`. Receives the sticky-header class (or
   * `undefined`) so the custom cell can apply it consistently with the other headers.
   */
  renderHeaderCell?: (stickyHeaderClassName: string | undefined) => ReactNode;
  /** Grid track of this column. Defaults to a flexible one, wider for the first column. */
  width?: string;
}

export interface ProjectsTableRowProps {
  project: OnboardingProject;
}

interface Props {
  /** Accessible label of the underlying `Table`. */
  ariaLabel: string;
  columns: ProjectsTableColumn[];
  /** Extra class for the outer wrapper — e.g. modal-mode uses it to cap the height. */
  containerClassName?: string;
  /**
   * Whether the query should actually run. Defaults to `true`. Modal callers gate the query on
   * `isOpen` so the request only fires when the user opens the modal.
   */
  enabled?: boolean;
  /**
   * Server-side filter tokens, AND-ed by the backend. Changing them resets to the first page.
   */
  filters: OnboardingProjectsFilter[];
  /**
   * Optional loading-container message. Providing it wraps the whole component in a
   * `LoadingContainer` (used by the card variant); omit it to render without the wrapper.
   */
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
 *
 * Meant to be composed inside a shell, either a `Card` (see {@link ProjectsTableCard}) a
 * `Modal` or any other shell, so it owns none of the outer chrome.
 */
export function ProjectsTable({
  ariaLabel,
  columns,
  containerClassName,
  enabled = true,
  filters,
  loadingMessageKey,
  pageSize,
  renderRow,
  searchPlaceholderKey,
  searchWidth,
  toolbarControls,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const [searchValue, query, handleSearch] = useDebouncedValue();
  const [pageIndex, setPageIndex] = useState(1);
  const tableRef = useRef<HTMLTableElement>(null);
  const organizationKey = useOnboardingOrganizationKey();

  // Callers rebuild the array on every render, so key the reset off the tokens themselves.
  const filtersKey = filters.join(',');

  // Reset to the first page whenever the filters or the search query change.
  useEffect(() => {
    setPageIndex(1);
  }, [filtersKey, query]);

  const { data, isLoading } = useOnboardingProjectsQuery(
    {
      organizationKey,
      filters,
      pageIndex,
      pageSize,
      q: query === '' ? undefined : query,
    },
    { enabled },
  );

  // Scroll the (scrollable) table body back to the top whenever a new page lands.
  useEffect(() => {
    tableRef.current?.scrollTo?.({ top: 0 });
  }, [data]);

  const projects = data?.projects ?? [];
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
                onChange={handleSearch}
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
            <Table.Row>
              {columns.map(({ className, isLabelHidden, justify, labelKey, renderHeaderCell }) => {
                if (renderHeaderCell !== undefined) {
                  return (
                    <Fragment key={labelKey}>{renderHeaderCell(STICKY_HEADER_CLASSES)}</Fragment>
                  );
                }

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
          </Table.Header>

          <Table.Body>
            {isLoading && <ProjectsTableRowsSkeleton columns={columns.length} />}

            {!isLoading && projects.length === 0 && (
              <ProjectsTableEmptyRow columns={columns.length} />
            )}

            {!isLoading && projects.map(renderRow)}
          </Table.Body>
        </Table>

        {totalPages > 1 && (
          <div className="sw-shrink-0 sw-flex sw-justify-center">
            <Pagination onChange={setPageIndex} page={pageIndex} totalPages={totalPages} />
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}
