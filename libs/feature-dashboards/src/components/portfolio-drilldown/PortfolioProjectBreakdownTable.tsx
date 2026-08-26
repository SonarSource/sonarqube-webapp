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
  Badge,
  Card,
  Pagination,
  SearchInput,
  SearchInputWidth,
  Spinner,
  Table,
  Text,
} from '@sonarsource/echoes-react';
import { debounce } from 'lodash';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import type { To } from 'react-router-dom';

const SEARCH_MIN_LENGTH = 3;
const SEARCH_DEBOUNCE_DELAY = 300;

type PortfolioProjectBreakdownSortDirection = 'asc' | 'desc';

export interface PortfolioProjectBreakdownRow {
  branchId: string;
  branchName: string | null;
  projectKey: string;
  projectName: string;
}

interface Props<Row extends PortfolioProjectBreakdownRow> {
  beforeTable?: ReactNode;
  emptyContent?: ReactNode;
  getRowUrl: (row: Row) => To;
  isLoading: boolean;
  isProjectSearchWithNoMatches: boolean;
  loadingLabel: string;
  metricLabel: string;
  noResultsText: string;
  onPageChange: (page: number) => void;
  onProjectQueryChange: (query: string | undefined) => void;
  onSort: () => void;
  page: number;
  projectNameLabel: string;
  projectQuery?: string;
  renderValueCell: (row: Row, url: To) => ReactNode;
  rows: Row[];
  searchPlaceholder: string;
  sortDirection: PortfolioProjectBreakdownSortDirection;
  tableBodyMessage?: ReactNode;
  tableLabel: string;
  totalPages: number;
}

export function PortfolioProjectBreakdownTable<Row extends PortfolioProjectBreakdownRow>(
  props: Readonly<Props<Row>>,
) {
  const {
    beforeTable,
    emptyContent,
    getRowUrl,
    isLoading,
    isProjectSearchWithNoMatches,
    loadingLabel,
    metricLabel,
    noResultsText,
    onPageChange,
    onProjectQueryChange,
    onSort,
    page,
    projectNameLabel,
    projectQuery,
    renderValueCell,
    rows,
    searchPlaceholder,
    sortDirection,
    tableBodyMessage,
    tableLabel,
    totalPages,
  } = props;
  const [searchInput, setSearchInput] = useState(projectQuery ?? '');

  useEffect(() => {
    setSearchInput(projectQuery ?? '');
  }, [projectQuery]);

  const debouncedUpdateProjectQuery = useMemo(
    () =>
      debounce((value: string) => {
        const trimmed = value.trim();
        if (trimmed.length > 0 && trimmed.length < SEARCH_MIN_LENGTH) {
          return;
        }
        onProjectQueryChange(trimmed === '' ? undefined : trimmed);
      }, SEARCH_DEBOUNCE_DELAY),
    [onProjectQueryChange],
  );

  useEffect(() => {
    return () => {
      debouncedUpdateProjectQuery.cancel();
    };
  }, [debouncedUpdateProjectQuery]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedUpdateProjectQuery(value);
  };

  const trimmedSearchInput = searchInput.trim();
  const isInputBelowMinLength =
    trimmedSearchInput.length > 0 && trimmedSearchInput.length < SEARCH_MIN_LENGTH;
  const desiredProjectQuery = isInputBelowMinLength ? (projectQuery ?? '') : trimmedSearchInput;
  const isSearchInputLoading = desiredProjectQuery !== (projectQuery ?? '') || isLoading;

  return (
    <Card>
      <Card.Header
        className="sw-pb-0"
        description={
          emptyContent === undefined ? (
            <SearchInput
              className="sw-pt-2"
              isLoading={isSearchInputLoading}
              minLength={SEARCH_MIN_LENGTH}
              onChange={handleSearchChange}
              placeholderLabel={searchPlaceholder}
              value={searchInput}
              width={SearchInputWidth.Medium}
            />
          ) : undefined
        }
        title={tableLabel}
      />
      <Card.Body>
        {emptyContent === undefined ? (
          <>
            {beforeTable}
            <Table
              aria-busy={isLoading}
              ariaLabel={tableLabel}
              gridTemplate="4fr minmax(140px, 1fr)"
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell label={projectNameLabel} />
                  <Table.ColumnHeaderCell
                    justify="end"
                    label={metricLabel}
                    onSort={onSort}
                    sortDirection={sortDirection}
                  />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tableBodyMessage !== undefined && (
                  <Table.Row>
                    <Table.Cell className="sw-py-6" style={{ gridColumn: '1 / -1' }}>
                      <Text as="div" isSubtle>
                        {tableBodyMessage}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )}
                {tableBodyMessage === undefined && isProjectSearchWithNoMatches && (
                  <Table.Row>
                    <Table.Cell className="sw-py-6" style={{ gridColumn: '1 / -1' }}>
                      <Text as="div" isSubtle>
                        {noResultsText}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )}
                {tableBodyMessage === undefined &&
                  !isProjectSearchWithNoMatches &&
                  rows.map((row) => {
                    const url = getRowUrl(row);
                    return (
                      <Table.Row key={`${row.projectKey}-${row.branchId}`}>
                        <Table.CellLink
                          className="fs-mask sw-flex sw-w-full sw-items-center"
                          to={url}
                        >
                          <span className="sw-inline-flex sw-items-center sw-gap-2">
                            <span>{row.projectName}</span>
                            {row.branchName ? (
                              <Badge variety="neutral">{row.branchName}</Badge>
                            ) : null}
                          </span>
                        </Table.CellLink>
                        {isLoading ? (
                          <Table.CellLink className="sw-flex sw-w-full sw-justify-end" to={url}>
                            <Spinner ariaLabel={loadingLabel} isLoading />
                          </Table.CellLink>
                        ) : (
                          renderValueCell(row, url)
                        )}
                      </Table.Row>
                    );
                  })}
              </Table.Body>
            </Table>

            {!isProjectSearchWithNoMatches && totalPages > 1 && (
              <div className="sw-flex sw-justify-center sw-mt-8">
                <Pagination
                  isDisabled={isLoading}
                  onChange={onPageChange}
                  page={page}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        ) : (
          <div className="sw-flex sw-items-center sw-justify-center sw-h-[332px]">
            {emptyContent}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
