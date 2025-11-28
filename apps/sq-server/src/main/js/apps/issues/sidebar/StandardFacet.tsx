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
import { FacetBox, FacetItem } from '~design-system';
import { ListStyleFacetFooter } from '~shared/components/facet/ListStyleFacetFooter';
import MultipleSelectionHint from '~shared/components/MultipleSelectionHint';
import { highlightTerm } from '~shared/helpers/search';
import {
  getStandards,
  renderCWECategory,
  renderOwaspMobileTop10Version2024Category,
  renderOwaspTop102021Category,
  renderOwaspTop102025Category,
  renderOwaspTop10Category,
  renderSonarSourceSecurityCategory,
  renderStigCategory,
  renderStigV6Category,
} from '~shared/helpers/security-standards';
import { StandardsInformation, StandardsInformationKey } from '~shared/types/security';
import { ListStyleFacet } from '~sq-server-commons/components/controls/ListStyleFacet';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { Facet, IssuesQuery } from '~sq-server-commons/types/issues';
import { STANDARDS, formatFacetStat } from '~sq-server-commons/utils/issues-utils';

interface Props {
  cwe: string[];
  cweOpen: boolean;
  cweStats: Record<string, number> | undefined;
  fetchingCwe: boolean;
  'fetchingOwaspMobileTop10-2024': boolean;
  fetchingOwaspTop10: boolean;
  'fetchingOwaspTop10-2021': boolean;
  'fetchingOwaspTop10-2025': boolean;
  fetchingSonarSourceSecurity: boolean;
  'fetchingStig-ASD_V5R3': boolean;
  'fetchingStig-ASD_V6': boolean;
  loadSearchResultCount?: (property: string, changes: Partial<IssuesQuery>) => Promise<Facet>;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  'owaspMobileTop10-2024': string[];
  'owaspMobileTop10-2024Open': boolean;
  'owaspMobileTop10-2024Stats': Record<string, number> | undefined;
  owaspTop10: string[];
  'owaspTop10-2021': string[];
  'owaspTop10-2021Open': boolean;
  'owaspTop10-2021Stats': Record<string, number> | undefined;
  'owaspTop10-2025': string[];
  'owaspTop10-2025Open': boolean;
  'owaspTop10-2025Stats': Record<string, number> | undefined;
  owaspTop10Open: boolean;
  owaspTop10Stats: Record<string, number> | undefined;
  query: Partial<IssuesQuery>;
  sonarsourceSecurity: string[];
  sonarsourceSecurityOpen: boolean;
  sonarsourceSecurityStats: Record<string, number> | undefined;
  'stig-ASD_V5R3': string[];
  'stig-ASD_V5R3Open': boolean;
  'stig-ASD_V5R3Stats': Record<string, number> | undefined;
  'stig-ASD_V6': string[];
  'stig-ASD_V6Open': boolean;
  'stig-ASD_V6Stats': Record<string, number> | undefined;
}

interface State {
  showFullSonarSourceList: boolean;
  showFullStigV5R3List: boolean;
  showFullStigV6List: boolean;
  standards: StandardsInformation;
}

type StatsProp =
  | 'owaspMobileTop10-2024Stats'
  | 'owaspTop10-2021Stats'
  | 'owaspTop10-2025Stats'
  | 'owaspTop10Stats'
  | 'cweStats'
  | 'sonarsourceSecurityStats'
  | 'stig-ASD_V5R3Stats'
  | 'stig-ASD_V6Stats';

type ValuesProp =
  | 'owaspMobileTop10-2024'
  | 'owaspTop10-2021'
  | 'owaspTop10-2025'
  | 'owaspTop10'
  | 'sonarsourceSecurity'
  | 'cwe'
  | 'stig-ASD_V5R3'
  | 'stig-ASD_V6';

const INITIAL_FACET_COUNT = 15;

export class StandardFacet extends React.PureComponent<Props, State> {
  mounted = false;
  property = STANDARDS;

  state: State = {
    showFullSonarSourceList: false,
    showFullStigV5R3List: false,
    showFullStigV6List: false,
    standards: {
      'owaspMobileTop10-2024': {},
      owaspTop10: {},
      'owaspTop10-2021': {},
      'owaspTop10-2025': {},
      cwe: {},
      sonarsourceSecurity: {},
      'pciDss-3.2': {},
      'pciDss-4.0': {},
      'stig-ASD_V5R3': {},
      'stig-ASD_V6': {},
      casa: {},
      'owaspAsvs-4.0': {},
    },
  };

  componentDidMount() {
    this.mounted = true;

    // load standards.json only if the facet is open, or there is a selected value
    if (
      this.props.open ||
      this.props.owaspTop10.length > 0 ||
      this.props['owaspTop10-2021'].length > 0 ||
      this.props['owaspTop10-2025'].length > 0 ||
      this.props['owaspMobileTop10-2024'].length > 0 ||
      this.props.cwe.length > 0 ||
      this.props.sonarsourceSecurity.length > 0 ||
      this.props['stig-ASD_V5R3'].length > 0 ||
      this.props['stig-ASD_V6'].length > 0
    ) {
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
      ({
        [StandardsInformationKey.OWASP_MOBILE_TOP10_2024]: owaspMobileTop102024,
        [StandardsInformationKey.OWASP_TOP10_2021]: owaspTop102021,
        [StandardsInformationKey.OWASP_TOP10_2025]: owaspTop102025,
        [StandardsInformationKey.OWASP_TOP10]: owaspTop10,
        [StandardsInformationKey.CWE]: cwe,
        [StandardsInformationKey.SONARSOURCE]: sonarsourceSecurity,
        [StandardsInformationKey.PCI_DSS_3_2]: pciDss32,
        [StandardsInformationKey.PCI_DSS_4_0]: pciDss40,
        [StandardsInformationKey.OWASP_ASVS_4_0]: owaspAsvs40,
        [StandardsInformationKey.STIG_ASD_V5R3]: stigV5,
        [StandardsInformationKey.STIG_ASD_V6]: stigV6,
        [StandardsInformationKey.CASA]: casa,
      }: StandardsInformation) => {
        if (this.mounted) {
          this.setState({
            standards: {
              [StandardsInformationKey.OWASP_MOBILE_TOP10_2024]: owaspMobileTop102024,
              [StandardsInformationKey.OWASP_TOP10_2021]: owaspTop102021,
              [StandardsInformationKey.OWASP_TOP10_2025]: owaspTop102025,
              [StandardsInformationKey.OWASP_TOP10]: owaspTop10,
              [StandardsInformationKey.CWE]: cwe,
              [StandardsInformationKey.SONARSOURCE]: sonarsourceSecurity,
              [StandardsInformationKey.PCI_DSS_3_2]: pciDss32,
              [StandardsInformationKey.PCI_DSS_4_0]: pciDss40,
              [StandardsInformationKey.OWASP_ASVS_4_0]: owaspAsvs40,
              [StandardsInformationKey.STIG_ASD_V5R3]: stigV5,
              [StandardsInformationKey.STIG_ASD_V6]: stigV6,
              [StandardsInformationKey.CASA]: casa,
            },
          });
        }
      },
      () => {},
    );
  };

  getValues = () => {
    return [
      ...this.props.sonarsourceSecurity.map((item) =>
        renderSonarSourceSecurityCategory(this.state.standards, item, true),
      ),
      ...this.props.owaspTop10.map((item) =>
        renderOwaspTop10Category(this.state.standards, item, true),
      ),
      ...this.props['owaspTop10-2021'].map((item) =>
        renderOwaspTop102021Category(this.state.standards, item, true),
      ),
      ...this.props['owaspTop10-2025'].map((item) =>
        renderOwaspTop102025Category(this.state.standards, item, true),
      ),
      ...this.props['owaspMobileTop10-2024'].map((item) =>
        renderOwaspMobileTop10Version2024Category(this.state.standards, item, true),
      ),
      ...this.props.cwe.map((item) => renderCWECategory(this.state.standards, item)),
      ...this.props['stig-ASD_V5R3'].map((item) => renderStigCategory(this.state.standards, item)),
      ...this.props['stig-ASD_V6'].map((item) => renderStigV6Category(this.state.standards, item)),
    ];
  };

  getFacetHeaderId = (property: string) => {
    return `facet_${property}`;
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleOwaspTop10HeaderClick = () => {
    this.props.onToggle('owaspTop10');
  };

  handleOwaspTop102021HeaderClick = () => {
    this.props.onToggle('owaspTop10-2021');
  };

  handleOwaspTop102025HeaderClick = () => {
    this.props.onToggle('owaspTop10-2025');
  };

  handleOwaspMobileTop102024HeaderClick = () => {
    this.props.onToggle('owaspMobileTop10-2024');
  };

  handleStigV5R3HeaderClick = () => {
    this.props.onToggle('stig-ASD_V5R3');
  };

  handleStigV6HeaderClick = () => {
    this.props.onToggle('stig-ASD_V6');
  };

  handleSonarSourceSecurityHeaderClick = () => {
    this.props.onToggle('sonarsourceSecurity');
  };

  handleClear = () => {
    this.props.onChange({
      [this.property]: [],
      owaspTop10: [],
      'owaspTop10-2021': [],
      'owaspTop10-2025': [],
      'owaspMobileTop10-2024': [],
      cwe: [],
      sonarsourceSecurity: [],
      'stig-ASD_V5R3': [],
      'stig-ASD_V6': [],
    });
  };

  handleItemClick = (prop: ValuesProp, itemValue: string, multiple: boolean) => {
    const items = this.props[prop];

    if (multiple) {
      const newValue = sortBy(
        items.includes(itemValue) ? without(items, itemValue) : [...items, itemValue],
      );

      this.props.onChange({ [prop]: newValue });
    } else {
      this.props.onChange({
        [prop]: items.includes(itemValue) && items.length < 2 ? [] : [itemValue],
      });
    }
  };

  handleOwaspTop10ItemClick = (itemValue: string, multiple: boolean) => {
    this.handleItemClick(StandardsInformationKey.OWASP_TOP10, itemValue, multiple);
  };

  handleOwaspTop102021ItemClick = (itemValue: string, multiple: boolean) => {
    this.handleItemClick(StandardsInformationKey.OWASP_TOP10_2021, itemValue, multiple);
  };

  handleOwaspTop102025ItemClick = (itemValue: string, multiple: boolean) => {
    this.handleItemClick(StandardsInformationKey.OWASP_TOP10_2025, itemValue, multiple);
  };

  handleOwaspMobileTop102024ItemClick = (itemValue: string, multiple: boolean) => {
    this.handleItemClick(StandardsInformationKey.OWASP_MOBILE_TOP10_2024, itemValue, multiple);
  };

  handleStigV5R3ItemClick = (itemValue: string, multiple: boolean) => {
    this.handleItemClick(StandardsInformationKey.STIG_ASD_V5R3, itemValue, multiple);
  };

  handleStigV6ItemClick = (itemValue: string, multiple: boolean) => {
    this.handleItemClick(StandardsInformationKey.STIG_ASD_V6, itemValue, multiple);
  };

  handleSonarSourceSecurityItemClick = (itemValue: string, multiple: boolean) => {
    this.handleItemClick(StandardsInformationKey.SONARSOURCE, itemValue, multiple);
  };

  handleCWESearch = (query: string) => {
    return Promise.resolve({
      results: Object.keys(this.state.standards.cwe).filter((cwe) =>
        renderCWECategory(this.state.standards, cwe).toLowerCase().includes(query.toLowerCase()),
      ),
    });
  };

  loadCWESearchResultCount = (categories: string[]) => {
    const { loadSearchResultCount } = this.props;

    return loadSearchResultCount
      ? loadSearchResultCount('cwe', { cwe: categories })
      : Promise.resolve({});
  };

  renderList = (
    statsProp: StatsProp,
    valuesProp: ValuesProp,
    renderName: (standards: StandardsInformation, category: string) => string,
    onClick: (x: string, multiple?: boolean) => void,
  ) => {
    const stats = this.props[statsProp];
    const values = this.props[valuesProp];

    if (!stats) {
      return null;
    }

    const categories = sortBy(Object.keys(stats), (key) => -stats[key]);

    return this.renderFacetItemsList(stats, values, categories, renderName, renderName, onClick);
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
          {translate('no_results')}
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
        name={renderName(this.state.standards, category)}
        onClick={onClick}
        stat={formatFacetStat(getStat(category)) ?? 0}
        tooltip={renderTooltip(this.state.standards, category)}
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
          {translate('no_results')}
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
            name={renderName(this.state.standards, item)}
            onClick={onClick}
            stat={formatFacetStat(stats[item]) ?? 0}
            tooltip={renderTooltip(this.state.standards, item)}
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
                name={renderName(this.state.standards, item)}
                onClick={onClick}
                stat={formatFacetStat(stats[item]) ?? 0}
                tooltip={renderTooltip(this.state.standards, item)}
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

  renderHint = (statsProp: StatsProp, valuesProp: ValuesProp) => {
    const nbSelectableItems = Object.keys(this.props[statsProp] ?? {}).length;
    const nbSelectedItems = this.props[valuesProp].length;

    return (
      <MultipleSelectionHint
        className="sw-pt-4"
        selectedItems={nbSelectedItems}
        totalItems={nbSelectableItems}
      />
    );
  };

  renderOwaspTop10List() {
    return this.renderList(
      'owaspTop10Stats',
      StandardsInformationKey.OWASP_TOP10,
      renderOwaspTop10Category,
      this.handleOwaspTop10ItemClick,
    );
  }

  renderOwaspTop102021List() {
    return this.renderList(
      'owaspTop10-2021Stats',
      StandardsInformationKey.OWASP_TOP10_2021,
      renderOwaspTop102021Category,
      this.handleOwaspTop102021ItemClick,
    );
  }

  renderOwaspTop102025List() {
    return this.renderList(
      'owaspTop10-2025Stats',
      StandardsInformationKey.OWASP_TOP10_2025,
      renderOwaspTop102025Category,
      this.handleOwaspTop102025ItemClick,
    );
  }

  renderOwaspMobileTop102024List() {
    return this.renderList(
      'owaspMobileTop10-2024Stats',
      StandardsInformationKey.OWASP_MOBILE_TOP10_2024,
      renderOwaspMobileTop10Version2024Category,
      this.handleOwaspMobileTop102024ItemClick,
    );
  }

  renderStigV5R3List() {
    const stats = this.props['stig-ASD_V5R3Stats'];
    const values = this.props['stig-ASD_V5R3'];

    if (!stats) {
      return null;
    }

    const sortedItems = sortBy(
      Object.keys(stats),
      (key) => -stats[key],
      (key) => renderStigCategory(this.state.standards, key),
    );

    return this.renderListWithShowMore({
      stats,
      values,
      sortedItems,
      showFullList: this.state.showFullStigV5R3List,
      renderName: renderStigCategory,
      renderTooltip: renderStigCategory,
      onClick: this.handleStigV5R3ItemClick,
      onShowMore: () => {
        this.setState({ showFullStigV5R3List: true });
      },
      onShowLess: this.state.showFullStigV5R3List
        ? () => {
            this.setState({ showFullStigV5R3List: false });
          }
        : undefined,
      showMoreAriaLabel: translate('issues.facet.stigAsd_v5r3.show_more'),
      showLessAriaLabel: translate('issues.facet.stigAsd_v5r3.show_less'),
    });
  }

  renderStigV6List() {
    const stats = this.props['stig-ASD_V6Stats'];
    const values = this.props['stig-ASD_V6'];

    if (!stats) {
      return null;
    }

    const sortedItems = sortBy(
      Object.keys(stats),
      (key) => -stats[key],
      (key) => renderStigV6Category(this.state.standards, key),
    );

    return this.renderListWithShowMore({
      stats,
      values,
      sortedItems,
      showFullList: this.state.showFullStigV6List,
      renderName: renderStigV6Category,
      renderTooltip: renderStigV6Category,
      onClick: this.handleStigV6ItemClick,
      onShowMore: () => {
        this.setState({ showFullStigV6List: true });
      },
      onShowLess: this.state.showFullStigV6List
        ? () => {
            this.setState({ showFullStigV6List: false });
          }
        : undefined,
      showMoreAriaLabel: translate('issues.facet.stigAsd_v6.show_more'),
      showLessAriaLabel: translate('issues.facet.stigAsd_v6.show_less'),
    });
  }

  renderSonarSourceSecurityList() {
    const stats = this.props.sonarsourceSecurityStats;
    const values = this.props.sonarsourceSecurity;

    if (!stats) {
      return null;
    }

    const sortedItems = sortBy(
      Object.keys(stats),
      (key) => -stats[key],
      (key) => renderSonarSourceSecurityCategory(this.state.standards, key),
    );

    return this.renderListWithShowMore({
      stats,
      values,
      sortedItems,
      showFullList: this.state.showFullSonarSourceList,
      renderName: renderSonarSourceSecurityCategory,
      renderTooltip: renderSonarSourceSecurityCategory,
      onClick: this.handleSonarSourceSecurityItemClick,
      onShowMore: () => {
        this.setState({ showFullSonarSourceList: true });
      },
      showMoreAriaLabel: translate('issues.facet.sonarsource.show_more'),
    });
  }

  renderOwaspTop10Hint() {
    return this.renderHint('owaspTop10Stats', StandardsInformationKey.OWASP_TOP10);
  }

  renderOwaspTop102021Hint() {
    return this.renderHint('owaspTop10-2021Stats', StandardsInformationKey.OWASP_TOP10_2021);
  }

  renderOwaspTop102025Hint() {
    return this.renderHint('owaspTop10-2025Stats', StandardsInformationKey.OWASP_TOP10_2025);
  }

  renderOwaspMobileTop102024Hint() {
    return this.renderHint(
      'owaspMobileTop10-2024Stats',
      StandardsInformationKey.OWASP_MOBILE_TOP10_2024,
    );
  }

  renderStigV5R3Hint() {
    return this.renderHint('stig-ASD_V5R3Stats', StandardsInformationKey.STIG_ASD_V5R3);
  }

  renderStigV6Hint() {
    return this.renderHint('stig-ASD_V6Stats', StandardsInformationKey.STIG_ASD_V6);
  }

  renderSonarSourceSecurityHint() {
    return this.renderHint('sonarsourceSecurityStats', StandardsInformationKey.SONARSOURCE);
  }

  renderSubFacets() {
    const {
      cwe,
      cweOpen,
      cweStats,
      fetchingCwe,
      'fetchingOwaspMobileTop10-2024': fetchingOwaspMobileTop102024,
      fetchingOwaspTop10,
      'fetchingOwaspTop10-2021': fetchingOwaspTop102021,
      'fetchingOwaspTop10-2025': fetchingOwaspTop102025,
      fetchingSonarSourceSecurity,
      'fetchingStig-ASD_V5R3': fetchingStigV5R3,
      'fetchingStig-ASD_V6': fetchingStigV6,
      'owaspMobileTop10-2024': owaspMobileTop102024,
      'owaspMobileTop10-2024Open': owaspMobileTop102024Open,
      owaspTop10,
      owaspTop10Open,
      'owaspTop10-2021Open': owaspTop102021Open,
      'owaspTop10-2021': owaspTop102021,
      'owaspTop10-2025Open': owaspTop102025Open,
      'owaspTop10-2025': owaspTop102025,
      query,
      sonarsourceSecurity,
      sonarsourceSecurityOpen,
      'stig-ASD_V5R3': stigV5R3,
      'stig-ASD_V5R3Open': stigV5R3Open,
      'stig-ASD_V6': stigV6,
      'stig-ASD_V6Open': stigV6Open,
    } = this.props;

    const standards = [
      {
        count: sonarsourceSecurity.length,
        loading: fetchingSonarSourceSecurity,
        name: 'sonarsourceSecurity',
        onClick: this.handleSonarSourceSecurityHeaderClick,
        open: sonarsourceSecurityOpen,
        panel: (
          <>
            {this.renderSonarSourceSecurityList()}
            {this.renderSonarSourceSecurityHint()}
          </>
        ),
        property: StandardsInformationKey.SONARSOURCE,
      },
      {
        count: owaspTop102025.length,
        loading: fetchingOwaspTop102025,
        name: 'owaspTop10_2025',
        onClick: this.handleOwaspTop102025HeaderClick,
        open: owaspTop102025Open,
        panel: (
          <>
            {this.renderOwaspTop102025List()}
            {this.renderOwaspTop102025Hint()}
          </>
        ),
        property: StandardsInformationKey.OWASP_TOP10_2025,
      },
      {
        count: owaspTop102021.length,
        loading: fetchingOwaspTop102021,
        name: 'owaspTop10_2021',
        onClick: this.handleOwaspTop102021HeaderClick,
        open: owaspTop102021Open,
        panel: (
          <>
            {this.renderOwaspTop102021List()}
            {this.renderOwaspTop102021Hint()}
          </>
        ),
        property: StandardsInformationKey.OWASP_TOP10_2021,
      },
      {
        count: owaspTop10.length,
        loading: fetchingOwaspTop10,
        name: 'owaspTop10',
        onClick: this.handleOwaspTop10HeaderClick,
        open: owaspTop10Open,
        panel: (
          <>
            {this.renderOwaspTop10List()}
            {this.renderOwaspTop10Hint()}
          </>
        ),
        property: StandardsInformationKey.OWASP_TOP10,
      },
      {
        count: owaspMobileTop102024.length,
        loading: fetchingOwaspMobileTop102024,
        name: 'owaspMobileTop10_2024',
        onClick: this.handleOwaspMobileTop102024HeaderClick,
        open: owaspMobileTop102024Open,
        panel: (
          <>
            {this.renderOwaspMobileTop102024List()}
            {this.renderOwaspMobileTop102024Hint()}
          </>
        ),
        property: StandardsInformationKey.OWASP_MOBILE_TOP10_2024,
      },
      {
        count: stigV6.length,
        loading: fetchingStigV6,
        name: 'stigAsd_v6',
        onClick: this.handleStigV6HeaderClick,
        open: stigV6Open,
        panel: (
          <>
            {this.renderStigV6List()}
            {this.renderStigV6Hint()}
          </>
        ),
        property: StandardsInformationKey.STIG_ASD_V6,
      },
      {
        count: stigV5R3.length,
        loading: fetchingStigV5R3,
        name: 'stigAsd_v5r3',
        onClick: this.handleStigV5R3HeaderClick,
        open: stigV5R3Open,
        panel: (
          <>
            {this.renderStigV5R3List()}
            {this.renderStigV5R3Hint()}
          </>
        ),
        property: StandardsInformationKey.STIG_ASD_V5R3,
      },
    ];

    return (
      <>
        {standards.map(({ name, open, panel, property, ...standard }) => (
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
          fetching={fetchingCwe}
          getFacetItemText={(item) => renderCWECategory(this.state.standards, item)}
          getSearchResultText={(item) => renderCWECategory(this.state.standards, item)}
          inner
          loadSearchResultCount={this.loadCWESearchResultCount}
          onChange={this.props.onChange}
          onSearch={this.handleCWESearch}
          onToggle={this.props.onToggle}
          open={cweOpen}
          property={StandardsInformationKey.CWE}
          query={omit(query, 'cwe')}
          renderFacetItem={(item) => renderCWECategory(this.state.standards, item)}
          renderSearchResult={(item, query) =>
            highlightTerm(renderCWECategory(this.state.standards, item), query)
          }
          searchInputAriaLabel={translate('search.search_for_cwe')}
          searchPlaceholder={translate('search.search_for_cwe')}
          stats={cweStats}
          values={cwe}
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
