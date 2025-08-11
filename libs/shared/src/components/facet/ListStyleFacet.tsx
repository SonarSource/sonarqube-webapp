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

import { MessageCallout, SearchInput, Text, Tooltip } from '@sonarsource/echoes-react';
import { sortBy, without } from 'lodash';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import ListFooter from '../../components/controls/ListFooter';
import MultipleSelectionHint from '../../components/MultipleSelectionHint';
import { RawQuery } from '../../types/router';
import { FacetBox } from './FacetBox';
import { FacetItem } from './FacetItem';

import { numberFormatter } from '../../helpers/measures';
import { Paging } from '../../types/paging';
import { FacetItemsList } from './FacetItemsList';
import { ListStyleFacetFooter } from './ListStyleFacetFooter';

interface SearchResponse<S> {
  maxResults?: boolean;
  paging: Paging;
  results: S[];
}

interface Props<S> {
  disableZero?: boolean;
  disabled?: boolean;
  disabledHelper?: string;
  facetHeader: string;
  fetching: boolean;
  getFacetItemText?: (item: string) => string;
  getSearchResultKey?: (result: S) => string;
  getSortedItems?: () => string[];
  hideStat?: boolean;
  inner?: boolean;
  loadSearchResultCount?: (result: S[]) => Promise<Record<string, number>>;
  maxInitialItems?: number;
  maxItems?: number;
  minSearchLength?: number;
  onChange: (changes: Record<string, string | string[]>) => void;
  onClear?: () => void;
  onItemClick?: (itemValue: string, multiple: boolean) => void;
  onSearch: (query: string, page?: number) => Promise<SearchResponse<S>>;
  onToggle?: (property: string) => void;
  open: boolean;
  property: string;
  query?: RawQuery;
  renderFacetItem?: (item: string) => string | JSX.Element;
  renderSearchResult?: (result: S, query: string) => ReactNode;
  searchInputAriaLabel?: string;
  searchPlaceholder: string;
  showLessAriaLabel?: string;
  showMoreAriaLabel?: string;
  stats: Record<string, number> | undefined;
  values: string[];
}

function formatFacetStat(stat: number | undefined) {
  return stat && numberFormatter(stat);
}

/**
 * ListStyleFacet is analogous to SearchFacet in SQ Cloud.
 * This shared component was migrated from SQ Server and **does not** take Cloud's unique interface or behavior into consideration.
 * Future work will be needed to unify the two.
 */
export function ListStyleFacet<S>(props: Readonly<Props<S>>) {
  const {
    disableZero = true,
    disabled = false,
    disabledHelper,
    facetHeader,
    fetching,
    getFacetItemText = (item: string) => item,
    getSearchResultKey = (result: S) => String(result),
    getSortedItems,
    hideStat = false,
    inner = false,
    loadSearchResultCount = () => Promise.resolve({}),
    maxInitialItems = 15,
    maxItems = 100,
    minSearchLength = 2,
    onChange,
    onClear,
    onItemClick,
    onSearch,
    onToggle,
    open,
    property,
    query: initialQuery,
    renderFacetItem = (item: string) => item,
    renderSearchResult: renderSearchResultProp = (result: S, _query: string) => String(result),
    searchInputAriaLabel,
    searchPlaceholder,
    showLessAriaLabel,
    showMoreAriaLabel,
    stats = {},
    values,
  } = props;

  const [autoFocus, setAutoFocus] = useState(false);
  const [query, setQuery] = useState('');
  const [searchMaxResults, setSearchMaxResults] = useState<boolean | undefined>(undefined);
  const [searchPaging, setSearchPaging] = useState<Paging | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<S[] | undefined>(undefined);
  const [searchResultsCounts, setSearchResultsCounts] = useState<Record<string, number>>({});
  const [searching, setSearching] = useState(false);
  const [showFullList, setShowFullList] = useState(false);

  const intl = useIntl();

  function resetState() {
    setQuery('');
    setSearchMaxResults(undefined);
    setSearchResults(undefined);
    setSearching(false);
    setSearchResultsCounts({});
    setShowFullList(false);
  }

  useEffect(() => {
    if (open) {
      // focus search field *only* if it was manually open
      setAutoFocus(true);
    } else {
      resetState();
    }
  }, [open]);

  useEffect(() => {
    resetState();
  }, [initialQuery]);

  useEffect(() => {
    if (stats && Object.keys(stats).length < maxInitialItems) {
      setShowFullList(false);
    }
  }, [stats, maxInitialItems]);

  const handleItemClick = useCallback(
    (itemValue: string, multiple: boolean) => {
      if (onItemClick) {
        onItemClick(itemValue, multiple);
      } else if (multiple) {
        const newValue = sortBy(
          values.includes(itemValue) ? without(values, itemValue) : [...values, itemValue],
        );

        onChange({ [property]: newValue });
      } else {
        onChange({
          [property]: values.includes(itemValue) && values.length < 2 ? [] : [itemValue],
        });
      }
    },
    [onItemClick, onChange, property, values],
  );

  const handleHeaderClick = useCallback(() => {
    onToggle?.(property);
  }, [onToggle, property]);

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    } else {
      onChange({ [property]: [] });
    }
  }, [onClear, onChange, property]);

  const search = (query: string) => {
    if (query.length >= minSearchLength) {
      setQuery(query);
      setSearching(true);

      onSearch(query)
        .then(loadCountsForSearchResults)
        .then(({ maxResults, paging, results, stats }) => {
          setSearching(false);
          setSearchMaxResults(maxResults);
          setSearchResults(results);
          setSearchPaging(paging);
          setSearchResultsCounts({
            ...searchResultsCounts,
            ...stats,
          });
        })
        .catch(() => {
          setSearching(false);
        });
    } else {
      setQuery(query);
      setSearching(false);
      setSearchResults([]);
    }
  };

  const searchMore = () => {
    if (query && searchResults && searchPaging) {
      setSearching(true);

      props
        .onSearch(query, searchPaging.pageIndex + 1)
        .then(loadCountsForSearchResults)
        .then(({ paging, results, stats }) => {
          setSearching(false);
          setSearchResults([...searchResults, ...results]);
          setSearchPaging(paging);
          setSearchResultsCounts({
            ...searchResultsCounts,
            ...stats,
          });
        })
        .catch(() => {
          setSearching(false);
        });
    }
  };

  const loadCountsForSearchResults = (response: SearchResponse<S>) => {
    const resultsToLoad = response.results.filter((result) => {
      const key = getSearchResultKey(result);

      return getStat(key) === undefined && searchResultsCounts[key] === undefined;
    });

    if (resultsToLoad.length > 0) {
      return loadSearchResultCount(resultsToLoad).then((stats) => ({ ...response, stats }));
    }

    return { ...response, stats: {} };
  };

  const getStat = (item: string) => {
    return stats?.[item];
  };

  const getFacetHeaderId = (property: string) => {
    return `facet_${property}`;
  };

  const doShowFullList = () => {
    setShowFullList(true);
  };

  const doHideFullList = () => {
    setShowFullList(false);
  };

  const loadingResults =
    query !== '' && searching && (searchResults === undefined || searchResults.length === 0);

  const showList = query.length < minSearchLength;

  const nbSelectableItems = Object.keys(stats).length;
  const nbSelectedItems = values.length;

  return (
    <FacetBox
      count={nbSelectedItems}
      countLabel={intl.formatMessage({ id: 'x_selected' }, { 0: nbSelectedItems })}
      data-property={property}
      disabled={disabled}
      disabledHelper={disabledHelper}
      id={getFacetHeaderId(property)}
      inner={inner}
      loading={loadingResults || fetching}
      name={facetHeader}
      onClear={handleClear}
      onClick={disabled || !onToggle ? undefined : handleHeaderClick}
      open={open && !disabled}
      tooltipComponent={Tooltip}
    >
      {!disabled && (
        <>
          <SearchInput
            ariaLabel={searchInputAriaLabel ?? intl.formatMessage({ id: 'search_verb' })}
            className="sw-mb-4 sw-w-full"
            hasAutoFocus={autoFocus}
            minLength={minSearchLength}
            onChange={search}
            placeholderLabel={searchPlaceholder}
            value={query}
            width="full"
          />

          <output role={query ? 'status' : ''}>
            {showList ? (
              <OptionList
                disableZero={disableZero}
                doHideFullList={doHideFullList}
                doShowFullList={doShowFullList}
                facetHeader={facetHeader}
                getFacetHeaderId={getFacetHeaderId}
                getFacetItemText={getFacetItemText}
                getSortedItems={getSortedItems}
                getStat={getStat}
                handleItemClick={handleItemClick}
                hideStat={hideStat}
                maxInitialItems={maxInitialItems}
                maxItems={maxItems}
                property={property}
                renderFacetItem={renderFacetItem}
                showFullList={showFullList}
                showLessAriaLabel={showLessAriaLabel}
                showMoreAriaLabel={showMoreAriaLabel}
                stats={stats}
                values={values}
              />
            ) : (
              <SearchResultList
                disableZero={disableZero}
                getFacetHeaderId={getFacetHeaderId}
                getSearchResultKey={getSearchResultKey}
                getStat={getStat}
                handleItemClick={handleItemClick}
                hideStat={hideStat}
                property={property}
                query={query}
                renderSearchResultProp={renderSearchResultProp}
                searchMaxResults={searchMaxResults}
                searchMore={searchMore}
                searchPaging={searchPaging}
                searchResults={searchResults}
                searchResultsCounts={searchResultsCounts}
                searching={searching}
                showMoreAriaLabel={showMoreAriaLabel}
                values={values}
              />
            )}
          </output>

          <MultipleSelectionHint
            className="sw-pt-4"
            selectedItems={nbSelectedItems}
            totalItems={nbSelectableItems}
          />
        </>
      )}
    </FacetBox>
  );
}

interface OptionListProps {
  disableZero: boolean;
  doHideFullList: () => void;
  doShowFullList: () => void;
  facetHeader: string;
  getFacetHeaderId: (property: string) => string;
  getFacetItemText: (item: string) => string;
  getSortedItems?: () => string[];
  getStat: (item: string) => number | undefined;
  handleItemClick: (itemValue: string, multiple: boolean) => void;
  hideStat: boolean;
  maxInitialItems: number;
  maxItems: number;
  property: string;
  renderFacetItem: (item: string) => string | JSX.Element;
  showFullList: boolean;
  showLessAriaLabel?: string;
  showMoreAriaLabel?: string;
  stats: Record<string, number> | undefined;
  values: string[];
}

function OptionList({
  disableZero,
  doHideFullList,
  doShowFullList,
  facetHeader,
  getFacetHeaderId,
  getFacetItemText,
  getSortedItems,
  getStat,
  handleItemClick,
  hideStat,
  maxInitialItems,
  maxItems,
  property,
  renderFacetItem,
  showFullList,
  showLessAriaLabel,
  showMoreAriaLabel,
  stats = {},
  values,
}: Readonly<OptionListProps>) {
  const intl = useIntl();

  const statsKeys = useMemo(() => Object.keys(stats), [stats]);

  const sortedItems = useMemo(
    () =>
      getSortedItems
        ? getSortedItems()
        : sortBy(
            statsKeys,
            (key) => -(getStat(key) ?? 0),
            (key) => getFacetItemText(key),
          ),
    [getSortedItems, statsKeys, getFacetItemText, getStat],
  );

  const limitedList = showFullList ? sortedItems : sortedItems.slice(0, maxInitialItems);

  // make sure all selected items are displayed
  const selectedBelowLimit = showFullList
    ? []
    : sortedItems.slice(maxInitialItems).filter((item) => values.includes(item));

  const mightHaveMoreResults = sortedItems.length >= maxItems;

  if (statsKeys.length === 0) {
    return null;
  }

  return (
    <>
      <FacetItemsList labelledby={getFacetHeaderId(property)}>
        {limitedList.map((itemKey) => (
          <FacetItem
            active={values.includes(itemKey)}
            ariaLabel={getFacetItemText(itemKey)}
            className="it__search-navigator-facet"
            disableZero={disableZero}
            hideStat={hideStat}
            key={itemKey}
            name={renderFacetItem(itemKey)}
            onClick={handleItemClick}
            stat={formatFacetStat(getStat(itemKey)) ?? 0}
            value={itemKey}
          />
        ))}
      </FacetItemsList>

      {selectedBelowLimit.length > 0 && (
        <>
          <Text as="div" className="sw-mb-2 sw-text-center" isSubtle>
            ⋯
          </Text>

          <FacetItemsList labelledby={getFacetHeaderId(property)}>
            {selectedBelowLimit.map((item) => (
              <FacetItem
                active
                className="it__search-navigator-facet"
                disableZero={disableZero}
                hideStat={hideStat}
                key={item}
                name={renderFacetItem(item)}
                onClick={handleItemClick}
                stat={formatFacetStat(getStat(item)) ?? 0}
                value={item}
              />
            ))}
          </FacetItemsList>
        </>
      )}

      <ListStyleFacetFooter
        nbShown={limitedList.length + selectedBelowLimit.length}
        showLess={showFullList ? doHideFullList : undefined}
        showLessAriaLabel={
          showLessAriaLabel ?? intl.formatMessage({ id: 'show_less_filter_x' }, { 0: facetHeader })
        }
        showMore={doShowFullList}
        showMoreAriaLabel={
          showMoreAriaLabel ?? intl.formatMessage({ id: 'show_more_filter_x' }, { 0: facetHeader })
        }
        total={sortedItems.length}
      />

      {mightHaveMoreResults && showFullList && (
        <MessageCallout className="sw-flex sw-my-4" variety="warning">
          {intl.formatMessage({ id: 'facet_might_have_more_results' })}
        </MessageCallout>
      )}
    </>
  );
}

interface SearchResultListProps<S> {
  disableZero: boolean;
  getFacetHeaderId: (property: string) => string;
  getSearchResultKey: (result: S) => string;
  getStat: (item: string) => number | undefined;
  handleItemClick: (itemValue: string, multiple: boolean) => void;
  hideStat: boolean;
  property: string;
  query: string;
  renderSearchResultProp: (result: S, query: string) => React.ReactNode;
  searchMaxResults: boolean | undefined;
  searchMore: () => void;
  searchPaging: { total: number } | undefined;
  searchResults: S[] | undefined;
  searchResultsCounts: Record<string, number>;
  searching: boolean;
  showMoreAriaLabel?: string;
  values: string[];
}

function SearchResultList<S>({
  disableZero,
  getFacetHeaderId,
  getSearchResultKey,
  getStat,
  handleItemClick,
  hideStat,
  property,
  query,
  renderSearchResultProp,
  searchMaxResults,
  searchMore,
  searchPaging,
  searchResults,
  searchResultsCounts,
  searching,
  showMoreAriaLabel,
  values,
}: Readonly<SearchResultListProps<S>>) {
  const intl = useIntl();

  if (!searchResults?.length) {
    return <div className="sw-mb-2">{intl.formatMessage({ id: 'no_results' })}</div>;
  }

  return (
    <>
      <FacetItemsList labelledby={getFacetHeaderId(property)}>
        {searchResults.map((result) => {
          const key = getSearchResultKey(result);
          const active = values.includes(key);
          const stat = formatFacetStat(getStat(key) ?? searchResultsCounts[key]) ?? '';
          return (
            <FacetItem
              active={active}
              ariaLabel=""
              className="it__search-navigator-facet"
              disableZero={disableZero}
              hideStat={hideStat}
              key={key}
              name={renderSearchResultProp(result, query)}
              onClick={handleItemClick}
              stat={stat}
              value={key}
            />
          );
        })}
      </FacetItemsList>

      {searchMaxResults && (
        <MessageCallout className="sw-flex sw-my-4" variety="warning">
          {intl.formatMessage({ id: 'facet_might_have_more_results' })}
        </MessageCallout>
      )}

      {searchPaging && (
        <ListFooter
          className="sw-mb-2"
          count={searchResults.length}
          loadMore={searchMore}
          loadMoreAriaLabel={showMoreAriaLabel}
          ready={!searching}
          total={searchPaging.total}
        />
      )}
    </>
  );
}
