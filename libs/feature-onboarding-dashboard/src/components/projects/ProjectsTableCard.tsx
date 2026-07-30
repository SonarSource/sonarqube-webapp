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
  Card,
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
import { ComponentType, ReactNode, useEffect, useState } from 'react';
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
  /** Column headers, in order. Their count also drives the grid template. */
  columns: ProjectsTableColumn[];
  descriptionKey: string;
  /**
   * Server-side filter tokens, AND-ed by the backend. Changing them resets to the first page.
   */
  filters: OnboardingProjectsFilter[];
  loadingMessageKey: string;
  pageSize: number;
  /** Rendered once per project; must render exactly one `Table.Row` of `columns.length` cells. */
  projectRow: ComponentType<Readonly<ProjectsTableRowProps>>;
  searchPlaceholderKey: string;
  titleKey: string;
  /** Extra toolbar controls rendered next to the search input, e.g. the filter dropdowns. */
  toolbarControls?: ReactNode;
}

/**
 * Card wrapping a paged, searchable table of onboarding projects: header, toolbar with the search
 * input and result count, the table itself and its pagination. Searching, filtering and paging are
 * all server-side, driven by `useOnboardingProjectsQuery`.
 *
 * Callers supply the columns and the row renderer; everything else is shared so the project tables
 * of the onboarding dashboard stay consistent.
 */
export function ProjectsTableCard({
  columns,
  descriptionKey,
  filters,
  loadingMessageKey,
  pageSize,
  projectRow: ProjectRow,
  searchPlaceholderKey,
  titleKey,
  toolbarControls,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const [searchValue, query, handleSearch] = useDebouncedValue();
  const [pageIndex, setPageIndex] = useState(1);
  const organizationKey = useOnboardingOrganizationKey();

  // Callers rebuild the array on every render, so key the reset off the tokens themselves.
  const filtersKey = filters.join(',');

  // Reset to the first page whenever the filters or the search query change.
  useEffect(() => {
    setPageIndex(1);
  }, [filtersKey, query]);

  const { data, isLoading } = useOnboardingProjectsQuery({
    organizationKey,
    filters,
    pageIndex,
    pageSize,
    q: query === '' ? undefined : query,
  });

  const projects = data?.projects ?? [];
  const total = data?.page.total ?? 0;
  const totalPages = data === undefined ? 0 : Math.ceil(data.page.total / data.page.pageSize);

  const title = formatMessage({ id: titleKey });
  const gridTemplate = columns
    .map(({ width }, index) => width ?? (index === 0 ? FIRST_COLUMN_TEMPLATE : COLUMN_TEMPLATE))
    .join(' ');

  return (
    <Card>
      <Card.Header description={formatMessage({ id: descriptionKey })} title={title} />
      <Card.Body>
        <LoadingContainer
          isLoading={isLoading}
          loadingMessage={formatMessage({ id: loadingMessageKey })}
        >
          <div className="sw-flex sw-flex-col sw-gap-4">
            <div className="sw-flex sw-w-full sw-items-center sw-justify-between">
              <div className="sw-flex sw-items-center sw-gap-4">
                <SearchInput
                  onChange={handleSearch}
                  placeholderLabel={formatMessage({ id: searchPlaceholderKey })}
                  value={searchValue}
                  width={SearchInputWidth.Large}
                />
                {toolbarControls}
              </div>

              <Text as="span" isSubtle size={TextSize.Small}>
                {formatMessage(
                  { id: 'onboarding_dashboard.projects.count' },
                  { b: (chunks) => <Text isHighlighted>{chunks}</Text>, count: total },
                )}
              </Text>
            </div>

            <Table ariaLabel={title} gridTemplate={gridTemplate} variety={TableVariety.Surface}>
              <Table.Header>
                <Table.Row>
                  {columns.map(({ className, isLabelHidden, justify, labelKey }) => {
                    const label = formatMessage({ id: labelKey });

                    return (
                      <Table.ColumnHeaderCell
                        className={className}
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

                {!isLoading &&
                  projects.map((project) => (
                    <ProjectRow key={project.key ?? project.name} project={project} />
                  ))}
              </Table.Body>
            </Table>

            {totalPages > 1 && (
              <div className="sw-flex sw-justify-center">
                <Pagination onChange={setPageIndex} page={pageIndex} totalPages={totalPages} />
              </div>
            )}
          </div>
        </LoadingContainer>
      </Card.Body>
    </Card>
  );
}
