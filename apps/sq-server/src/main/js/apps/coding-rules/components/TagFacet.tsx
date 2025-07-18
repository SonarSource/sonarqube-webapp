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

import { uniq } from 'lodash';
import * as React from 'react';
import { highlightTerm } from '~shared/helpers/search';
import { getRuleTags } from '~sq-server-commons/api/rules';
import { ListStyleFacet } from '~sq-server-commons/components/controls/ListStyleFacet';
import { BasicProps } from '~sq-server-commons/components/facets/Facet';
import { translate } from '~sq-server-commons/helpers/l10n';

export default class TagFacet extends React.PureComponent<BasicProps> {
  handleSearch = (query: string) => {
    return getRuleTags({ ps: 50, q: query }).then((tags) => ({
      paging: { pageIndex: 1, pageSize: tags.length, total: tags.length },
      results: tags,
    }));
  };

  handleSelect = (option: { value: string }) => {
    this.props.onChange({ tags: uniq([...this.props.values, option.value]) });
  };

  getTagName = (tag: string) => {
    return tag;
  };

  renderTag = (tag: string) => <>{tag}</>;

  renderSearchResult = (tag: string, term: string) => <>{highlightTerm(tag, term)}</>;

  render() {
    return (
      <ListStyleFacet<string>
        facetHeader={translate('coding_rules.facet.tags')}
        fetching={false}
        getFacetItemText={this.getTagName}
        getSearchResultKey={(tag) => tag}
        getSearchResultText={(tag) => tag}
        onChange={this.props.onChange}
        onSearch={this.handleSearch}
        onToggle={this.props.onToggle}
        open={this.props.open}
        property="tags"
        renderFacetItem={this.renderTag}
        renderSearchResult={this.renderSearchResult}
        searchInputAriaLabel={translate('search.search_for_tags')}
        searchPlaceholder={translate('search.search_for_tags')}
        stats={this.props.stats}
        values={this.props.values}
      />
    );
  }
}
