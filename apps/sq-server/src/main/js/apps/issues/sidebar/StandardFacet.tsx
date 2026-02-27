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

/* eslint-disable react/no-unused-prop-types */

import { Text } from '@sonarsource/echoes-react';
import { omit, sortBy, without } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { FacetBox, FacetItem } from '~design-system';
import { ListStyleFacetFooter } from '~shared/components/facet/ListStyleFacetFooter';
import MultipleSelectionHint from '~shared/components/MultipleSelectionHint';
import { highlightTerm } from '~shared/helpers/search';
import { getStandards, renderCWECategory } from '~shared/helpers/security-standards';
import { StandardsInformation, StandardsInformationKey } from '~shared/types/security';
import { ListStyleFacet } from '~sq-server-commons/components/controls/ListStyleFacet';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { Facet, IssuesQuery } from '~sq-server-commons/types/issues';
import {
  createEmptyStandardsInformation,
  STANDARDS_REGISTRY,
} from '~sq-server-commons/utils/compliance-standards';
import { formatFacetStat, STANDARDS } from '~sq-server-commons/utils/issues-utils';

// Configuration for each standard
interface StandardConfig {
  key: StandardsInformationKey;
  name: string; // Translation key suffix (e.g., 'pciDss_3.2')
  renderCategory: (standards: StandardsInformation, category: string) => string;
  showMoreEnabled?: boolean; // Whether to show "Show More/Less" functionality
}

// Derived from STANDARDS_REGISTRY - no need to manually maintain this list
const STANDARD_CONFIGS: StandardConfig[] = STANDARDS_REGISTRY.map((s) => ({
  key: s.key,
  name: s.displayName,
  renderCategory: s.renderCategory,
  showMoreEnabled: s.showMoreEnabled,
}));

interface StandardData {
  fetching: boolean;
  open: boolean;
  stats: Record<string, number> | undefined;
  values: string[];
}

interface Props {
  loadSearchResultCount?: (property: string, changes: Partial<IssuesQuery>) => Promise<Facet>;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  query: Partial<IssuesQuery>;
  standards: Record<string, StandardData>;
}

interface State {
  showMoreState: Record<string, boolean>;
  standardsInfo: StandardsInformation;
}

const INITIAL_FACET_COUNT = 15;

export class StandardFacet extends React.PureComponent<Props, State> {
  mounted = false;
  property = STANDARDS;

  state: State = {
    showMoreState: {},
    standardsInfo: createEmptyStandardsInformation(),
  };

  componentDidMount() {
    this.mounted = true;

    // load standards.json only if the facet is open, or there is a selected value
    const hasSelectedValues = Object.values(this.props.standards).some(
      (data) => data.values.length > 0,
    );

    if (this.props.open || hasSelectedValues) {
      this.loadStandards();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.open && this.props.open) {
      this.loadStandards();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loadStandards = () => {
    getStandards().then(
      (standardsInfo: StandardsInformation) => {
        if (this.mounted) {
          this.setState({ standardsInfo });
        }
      },
      () => {},
    );
  };

  getValues = () => {
    const values: string[] = [];

    // Add values from configured standards
    STANDARD_CONFIGS.forEach((config) => {
      const standardData = this.props.standards[config.key];
      if (standardData?.values) {
        values.push(
          ...standardData.values.map((item) =>
            config.renderCategory(this.state.standardsInfo, item),
          ),
        );
      }
    });

    return values;
  };

  getFacetHeaderId = (property: string) => {
    return `facet_${property}`;
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleStandardHeaderClick = (standardKey: string) => () => {
    this.props.onToggle(standardKey);
  };

  handleClear = () => {
    const changes: Partial<IssuesQuery> = {
      [this.property]: [],
    };

    // Clear all configured standards
    STANDARD_CONFIGS.forEach((config) => {
      changes[config.key] = [];
    });

    this.props.onChange(changes);
  };

  handleStandardItemClick = (standardKey: string) => (itemValue: string, multiple: boolean) => {
    const standardData = this.props.standards[standardKey];
    if (!standardData) {
      return;
    }

    const items = standardData.values;

    if (multiple) {
      const newValue = sortBy(
        items.includes(itemValue) ? without(items, itemValue) : [...items, itemValue],
      );

      this.props.onChange({ [standardKey]: newValue });
    } else {
      this.props.onChange({
        [standardKey]: items.includes(itemValue) && items.length < 2 ? [] : [itemValue],
      });
    }
  };

  handleCWESearch = (query: string) => {
    return Promise.resolve({
      results: Object.keys(this.state.standardsInfo.cwe)
        .filter((cwe) =>
          renderCWECategory(this.state.standardsInfo, cwe)
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .map((cwe) => `CWE-${cwe}`),
    });
  };

  loadCWESearchResultCount = (categories: string[]) => {
    const { loadSearchResultCount } = this.props;

    return loadSearchResultCount
      ? loadSearchResultCount('cwe', { cwe: categories })
      : Promise.resolve({});
  };

  renderStandard = (config: StandardConfig) => {
    const standardData = this.props.standards[config.key];
    if (!standardData?.stats) {
      return null;
    }

    const { stats, values } = standardData;
    const sortedItems = sortBy(
      Object.keys(stats),
      (key) => -stats[key],
      (key) => config.renderCategory(this.state.standardsInfo, key),
    );

    // If show more is enabled, use the enhanced list with pagination
    if (config.showMoreEnabled) {
      return this.renderListWithShowMore({
        stats,
        values,
        sortedItems,
        showFullList: !!this.state.showMoreState[config.key],
        renderName: config.renderCategory,
        renderTooltip: config.renderCategory,
        onClick: this.handleStandardItemClick(config.key),
        onShowMore: () => {
          this.setState((state) => ({
            showMoreState: { ...state.showMoreState, [config.key]: true },
          }));
        },
        onShowLess: this.state.showMoreState[config.key]
          ? () => {
              this.setState((state) => ({
                showMoreState: { ...state.showMoreState, [config.key]: false },
              }));
            }
          : undefined,
        showMoreAriaLabel: translate('show_more'),
        showLessAriaLabel: translate('show_less'),
      });
    }

    // Otherwise, use simple list
    return this.renderFacetItemsList(
      stats,
      values,
      sortedItems,
      config.renderCategory,
      config.renderCategory,
      this.handleStandardItemClick(config.key),
    );
  };

  renderStandardHint = (config: StandardConfig) => {
    const standardData = this.props.standards[config.key];
    if (!standardData) {
      return null;
    }

    const nbSelectableItems = Object.keys(standardData.stats ?? {}).length;
    const nbSelectedItems = standardData.values.length;

    return (
      <MultipleSelectionHint
        className="sw-pt-4"
        selectedItems={nbSelectedItems}
        totalItems={nbSelectableItems}
      />
    );
  };

  // eslint-disable-next-line max-params
  renderFacetItemsList = (
    stats: Record<string, number | undefined>,
    values: string[],
    categories: string[],
    renderName: (standards: StandardsInformation, category: string) => React.ReactNode,
    renderTooltip: (standards: StandardsInformation, category: string) => string,
    onClick: (x: string, multiple?: boolean) => void,
  ) => {
    if (!categories.length) {
      return (
        <Text className="sw-ml-2 sw-mt-1" isSubtle>
          <FormattedMessage id="no_results" />
        </Text>
      );
    }

    const getStat = (category: string) => {
      return stats ? stats[category] : undefined;
    };

    return categories.map((category) => (
      <FacetItem
        active={values.includes(category)}
        className="it__search-navigator-facet"
        key={category}
        name={renderName(this.state.standardsInfo, category)}
        onClick={onClick}
        stat={formatFacetStat(getStat(category)) ?? 0}
        tooltip={renderTooltip(this.state.standardsInfo, category)}
        value={category}
      />
    ));
  };

  // Helper method to render a list with "Show More/Show Less" functionality
  renderListWithShowMore = ({
    onClick,
    onShowLess,
    onShowMore,
    renderName,
    renderTooltip,
    showFullList,
    showLessAriaLabel,
    showMoreAriaLabel,
    sortedItems,
    stats,
    values,
  }: {
    onClick: (x: string, multiple?: boolean) => void;
    onShowLess?: () => void;
    onShowMore: () => void;
    renderName: (standards: StandardsInformation, category: string) => React.ReactNode;
    renderTooltip: (standards: StandardsInformation, category: string) => string;
    showFullList: boolean;
    showLessAriaLabel?: string;
    showMoreAriaLabel?: string;
    sortedItems: string[];
    stats: Record<string, number | undefined>;
    values: string[];
  }) => {
    const limitedList = showFullList ? sortedItems : sortedItems.slice(0, INITIAL_FACET_COUNT);

    const selectedBelowLimit = showFullList
      ? []
      : sortedItems.slice(INITIAL_FACET_COUNT).filter((item) => values.includes(item));

    const allItemShown = limitedList.length + selectedBelowLimit.length === sortedItems.length;

    if (!(limitedList.length || selectedBelowLimit.length)) {
      return (
        <Text className="sw-ml-2 sw-mt-1" isSubtle>
          <FormattedMessage id="no_results" />
        </Text>
      );
    }

    return (
      <>
        {limitedList.map((item) => (
          <FacetItem
            active={values.includes(item)}
            className="it__search-navigator-facet"
            key={item}
            name={renderName(this.state.standardsInfo, item)}
            onClick={onClick}
            stat={formatFacetStat(stats[item]) ?? 0}
            tooltip={renderTooltip(this.state.standardsInfo, item)}
            value={item}
          />
        ))}

        {selectedBelowLimit.length > 0 && (
          <>
            {!allItemShown && (
              <Text as="div" className="sw-mb-2 sw-text-center" isSubtle>
                ⋯
              </Text>
            )}
            {selectedBelowLimit.map((item) => (
              <FacetItem
                active
                className="it__search-navigator-facet"
                key={item}
                name={renderName(this.state.standardsInfo, item)}
                onClick={onClick}
                stat={formatFacetStat(stats[item]) ?? 0}
                tooltip={renderTooltip(this.state.standardsInfo, item)}
                value={item}
              />
            ))}
          </>
        )}

        {(!allItemShown || showFullList) && (
          <ListStyleFacetFooter
            nbShown={limitedList.length + selectedBelowLimit.length}
            showLess={onShowLess}
            showLessAriaLabel={showLessAriaLabel}
            showMore={onShowMore}
            showMoreAriaLabel={showMoreAriaLabel}
            total={sortedItems.length}
          />
        )}
      </>
    );
  };

  renderSubFacets() {
    const { query, standards } = this.props;
    const cweData = standards[StandardsInformationKey.CWE];

    // Build standards list from configuration, separating CWE for special rendering
    const standardsList = STANDARD_CONFIGS.filter(
      (config) => config.key !== StandardsInformationKey.CWE,
    ).map((config) => {
      const standardData = standards[config.key];
      return {
        count: standardData?.values.length ?? 0,
        loading: standardData?.fetching ?? false,
        name: config.name,
        onClick: this.handleStandardHeaderClick(config.key),
        open: standardData?.open ?? false,
        panel: (
          <>
            {this.renderStandard(config)}
            {this.renderStandardHint(config)}
          </>
        ),
        property: config.key,
      };
    });

    return (
      <>
        {standardsList.map(({ name, open, panel, property, ...standard }) => (
          <FacetBox
            className="it__search-navigator-facet-box it__search-navigator-facet-header"
            data-property={property}
            id={this.getFacetHeaderId(property)}
            inner
            key={property}
            name={translate(`issues.facet.${name}`)}
            open={open}
            {...standard}
          >
            <FacetItemsList labelledby={this.getFacetHeaderId(property)}>{panel}</FacetItemsList>
          </FacetBox>
        ))}

        <ListStyleFacet<string>
          facetHeader={translate('issues.facet.cwe')}
          fetching={cweData?.fetching ?? false}
          getFacetItemText={(item) => renderCWECategory(this.state.standardsInfo, item)}
          getSearchResultText={(item) => renderCWECategory(this.state.standardsInfo, item)}
          inner
          loadSearchResultCount={this.loadCWESearchResultCount}
          onChange={this.props.onChange}
          onSearch={this.handleCWESearch}
          onToggle={this.props.onToggle}
          open={cweData?.open ?? false}
          property={StandardsInformationKey.CWE}
          query={omit(query, 'cwe')}
          renderFacetItem={(item) => renderCWECategory(this.state.standardsInfo, item)}
          renderSearchResult={(item, query) =>
            highlightTerm(renderCWECategory(this.state.standardsInfo, item), query)
          }
          searchInputAriaLabel={translate('search.search_for_cwe')}
          searchPlaceholder={translate('search.search_for_cwe')}
          stats={cweData?.stats}
          values={cweData?.values ?? []}
        />
      </>
    );
  }

  render() {
    const { open } = this.props;
    const count = this.getValues().length;

    return (
      <FacetBox
        className="it__search-navigator-facet-box it__search-navigator-facet-header"
        count={count}
        countLabel={translateWithParameters('x_selected', count)}
        data-property={this.property}
        hasEmbeddedFacets
        id={this.getFacetHeaderId(this.property)}
        name={translate('issues.facet', this.property)}
        onClear={this.handleClear}
        onClick={this.handleHeaderClick}
        open={open}
      >
        {this.renderSubFacets()}
      </FacetBox>
    );
  }
}
