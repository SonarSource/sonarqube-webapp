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
  TableVariety,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useOnboardingRepositoriesQuery } from '~adapters/queries/onboarding';
import { OnboardingRepositoriesVisibility, OnboardingRepository } from '~shared/types/onboarding';
import { REPOSITORY_VISIBILITY_FILTER_OPTIONS } from '../../types/types';
import { ProjectsFilterSelect } from './ProjectsFilterSelect';
import { ProjectsTableColumn } from './ProjectsTable';
import { TableBodyRows } from './TableBodyRows';
import { TableHeaderRows } from './TableHeaderRows';
import { usePaginatedTableState } from './usePaginatedTableState';

/** The first column holds the repository name, so it gets more room than the others. */
const FIRST_COLUMN_TEMPLATE = 'minmax(240px, 2.5fr)';
const COLUMN_TEMPLATE = 'minmax(120px, 1fr)';

/** Same shape as {@link ProjectsTableColumn} — reused so both tables share one header renderer. */
export type RepositoriesTableColumn = ProjectsTableColumn;

interface Props {
  ariaLabel: string;
  columns: RepositoriesTableColumn[];
  containerClassName?: string;
  pageSize: number;
  renderRow: (repository: OnboardingRepository) => ReactNode;
}

/**
 * Paged, searchable table of DevOps-platform repositories discovered for the current organization.
 */
export function RepositoriesTable({
  ariaLabel,
  columns,
  containerClassName,
  pageSize,
  renderRow,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const tableRef = useRef<HTMLTableElement>(null);

  const [visibility, setVisibility] = useState<OnboardingRepositoriesVisibility>(
    OnboardingRepositoriesVisibility.All,
  );

  const { onPageChange, onSearchChange, pageIndex, query, searchValue } =
    usePaginatedTableState(visibility);

  const { data, isPending } = useOnboardingRepositoriesQuery({
    pageIndex,
    pageSize,
    q: query === '' ? undefined : query,
    visibility,
  });

  // Scroll the (scrollable) table body back to the top whenever a new page lands.
  useEffect(() => {
    tableRef.current?.scrollTo?.({ top: 0 });
  }, [data]);

  const repositories = useMemo(() => data?.repositories ?? [], [data?.repositories]);
  const total = data?.page.total ?? 0;
  const totalPages = data === undefined ? 0 : Math.ceil(data.page.total / data.page.pageSize);

  const gridTemplate = columns
    .map(({ width }, index) => width ?? (index === 0 ? FIRST_COLUMN_TEMPLATE : COLUMN_TEMPLATE))
    .join(' ');

  return (
    <LoadingContainer
      isLoading={isPending}
      loadingMessage={formatMessage({ id: 'onboarding_dashboard.repositories.loading' })}
    >
      <div className={`sw-flex sw-flex-col sw-gap-4 ${containerClassName ?? ''}`.trim()}>
        <div className="sw-flex sw-w-full sw-items-center sw-justify-between">
          <div className="sw-flex sw-items-center sw-gap-4">
            <SearchInput
              onChange={onSearchChange}
              placeholderLabel={formatMessage({
                id: 'onboarding_dashboard.repositories.search',
              })}
              value={searchValue}
              width={SearchInputWidth.Large}
            />

            <ProjectsFilterSelect
              id="import-repositories-visibility-filter"
              labelKey="onboarding_dashboard.repositories.filter.visibility.label"
              onChange={setVisibility}
              options={REPOSITORY_VISIBILITY_FILTER_OPTIONS}
              value={visibility}
            />
          </div>

          <Text as="span" className="sw-ml-auto" isSubtle size={TextSize.Small}>
            {formatMessage(
              { id: 'onboarding_dashboard.table.results_size' },
              { size: repositories.length, total },
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
              isLoading={isPending}
              items={repositories}
              renderRow={renderRow}
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
