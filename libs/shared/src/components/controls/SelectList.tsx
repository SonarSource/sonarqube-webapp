/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
  IconSearch,
  Spinner,
  Table,
  TextInput,
  ToggleButtonGroup,
} from '@sonarsource/echoes-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import ListFooter from './ListFooter';

export enum SelectListFilter {
  All = 'all',
  Selected = 'selected',
  Unselected = 'deselected',
}

export interface SelectListSearchParams {
  filter: SelectListFilter;
  page?: number;
  pageSize?: number;
  query: string;
}

interface Column<T> {
  key: string;
  label: string;
  renderCell: (item: T) => React.ReactNode;
  width?: string;
}

export interface SelectListProps<T> {
  ariaLabel: string;
  columns: Column<T>[];
  disabledItems?: T[];
  itemKey: (item: T) => string;
  items: T[];
  labelAll?: string;
  labelSelected?: string;
  labelUnselected?: string;
  loading?: boolean;
  needToReload?: boolean;
  onLoadMore?: () => void;
  onReload?: () => void;
  onSearch: (params: SelectListSearchParams) => Promise<void>;
  onSelectionChange: (selected: T[]) => void;
  pageSize?: number;
  readOnly?: boolean;
  searchInputPlaceholder?: string;
  selectedItems: T[];
  totalItemCount?: number;
}

const DEFAULT_PAGE_SIZE = 6;

export function SelectList<T>(props: Readonly<SelectListProps<T>>) {
  const {
    ariaLabel,
    columns,
    disabledItems = [],
    items,
    itemKey,
    labelAll,
    labelSelected,
    labelUnselected,
    loading,
    onLoadMore,
    onSearch,
    onSelectionChange,
    pageSize = DEFAULT_PAGE_SIZE,
    readOnly = false,
    searchInputPlaceholder,
    selectedItems,
    totalItemCount,
    needToReload,
    onReload,
  } = props;

  const intl = useIntl();
  const searchInputId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SelectListFilter>(SelectListFilter.All);
  const [page, setPage] = useState(1);

  const search = useCallback(
    (newParams: Partial<SelectListSearchParams>) => {
      const newSearchQuery = newParams.query ?? searchQuery;
      const newFilter = newParams.filter ?? filter;
      const newPage = newParams.page ?? page;

      const effectiveFilter = newSearchQuery === '' ? newFilter : SelectListFilter.All;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      onSearch({
        query: newSearchQuery,
        filter: effectiveFilter,
        page: newPage,
        pageSize,
      });
    },
    [searchQuery, filter, page, onSearch, pageSize],
  );

  useEffect(() => {
    search({ page: 1 });
    // Only re-run search when searchQuery or filter changes, otherwise we'll get an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filter]);

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as SelectListFilter);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      const newPage = page + 1;
      setPage(newPage);
      search({ page: newPage });
    }
  };

  const selectedKeys = useMemo(() => new Set(selectedItems.map(itemKey)), [selectedItems, itemKey]);
  const disabledKeys = useMemo(() => new Set(disabledItems.map(itemKey)), [disabledItems, itemKey]);

  const toggleRow = useCallback(
    (item: T) => {
      const key = itemKey(item);
      const newSelectedItems = [...selectedItems];
      if (selectedKeys.has(key)) {
        onSelectionChange(newSelectedItems.filter((selected) => itemKey(selected) !== key));
      } else {
        onSelectionChange([...newSelectedItems, item]);
      }
    },
    [itemKey, selectedItems, selectedKeys, onSelectionChange],
  );

  const gridTemplate = useMemo(() => {
    return `max-content ${columns.map((c) => c.width || '1fr').join(' ')}`;
  }, [columns]);

  return (
    <>
      <div className="sw-flex sw-items-center sw-mb-4">
        <ToggleButtonGroup
          isDisabled={searchQuery !== ''}
          onChange={handleFilterChange}
          options={[
            {
              label:
                labelSelected ?? intl.formatMessage({ id: 'selected', defaultMessage: 'Selected' }),
              value: SelectListFilter.Selected,
            },
            {
              label:
                labelUnselected ??
                intl.formatMessage({ id: 'unselected', defaultMessage: 'Deselected' }),
              value: SelectListFilter.Unselected,
            },
            {
              label: labelAll ?? intl.formatMessage({ id: 'all', defaultMessage: 'All' }),
              value: SelectListFilter.All,
            },
          ]}
          selected={filter}
        />
      </div>
      <div className="sw-mb-4">
        <TextInput
          id={searchInputId}
          onChange={(e) => {
            handleQueryChange(e.target.value);
          }}
          placeholder={
            searchInputPlaceholder ??
            intl.formatMessage({ id: 'search', defaultMessage: 'Search...' })
          }
          prefix={
            <>
              <Spinner isLoading={loading} />
              {loading ? undefined : <IconSearch />}
            </>
          }
          type="search"
          value={searchQuery}
        />
      </div>
      <div className="sw-overflow-y-auto sw-shrink">
        <Table ariaLabel={ariaLabel} gridTemplate={gridTemplate}>
          <Table.Body>
            {items.map((item) => {
              const key = itemKey(item);
              const isSelected = selectedKeys.has(key);
              const isDisabled = disabledKeys.has(key);
              return (
                <Table.Row key={key} selected={isSelected}>
                  <Table.CellCheckbox
                    ariaLabel={`Select ${key}`}
                    checked={isSelected}
                    isDisabled={readOnly || isDisabled}
                    onCheck={() => {
                      toggleRow(item);
                    }}
                  />
                  {columns.map((col) => (
                    <Table.Cell className="sw-justify-start" key={col.key}>
                      {col.renderCell(item)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>

      {Boolean(totalItemCount) && (
        <ListFooter
          count={items.length}
          loadMore={handleLoadMore}
          needReload={needToReload}
          reload={onReload}
          total={totalItemCount}
        />
      )}
    </>
  );
}

SelectList.displayName = 'SelectList';
