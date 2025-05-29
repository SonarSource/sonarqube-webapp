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

import * as React from 'react';
import { Note } from '~design-system';
import { getRuleRepositories } from '~sq-server-commons/api/rules';
import { ListStyleFacet } from '~sq-server-commons/components/controls/ListStyleFacet';
import { BasicProps } from '~sq-server-commons/components/facets/Facet';
import withLanguagesContext from '~sq-server-commons/context/languages/withLanguagesContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { highlightTerm } from '~sq-server-commons/helpers/search';
import { Languages } from '~sq-server-commons/types/languages';

interface StateProps {
  languages: Languages;
}

interface Props extends BasicProps, StateProps {
  referencedRepositories: Record<string, { key: string; language: string; name: string }>;
}

class RepositoryFacet extends React.PureComponent<Props> {
  getLanguageName = (languageKey: string) => {
    const { languages } = this.props;
    const language = languages[languageKey];
    return language?.name || languageKey;
  };

  handleSearch(query: string) {
    return getRuleRepositories({ q: query }).then((repos) => {
      return {
        paging: { pageIndex: 1, pageSize: repos.length, total: repos.length },
        results: repos.map((r) => r.key),
      };
    });
  }

  renderName = (repositoryKey: string) => {
    const { referencedRepositories } = this.props;
    const repository = referencedRepositories[repositoryKey];
    return repository ? (
      <>
        {repository.name}
        <Note className="sw-ml-1">{this.getLanguageName(repository.language)}</Note>
      </>
    ) : (
      repositoryKey
    );
  };

  renderTextName = (repositoryKey: string) => {
    const { referencedRepositories } = this.props;
    const repository = referencedRepositories[repositoryKey];
    return repository?.name || repositoryKey;
  };

  renderSearchTextName = (repositoryKey: string, query: string) => {
    const { referencedRepositories } = this.props;
    const repository = referencedRepositories[repositoryKey];

    return repository ? (
      <>
        {highlightTerm(repository.name, query)}
        <Note className="sw-ml-1">{this.getLanguageName(repository.language)}</Note>
      </>
    ) : (
      repositoryKey
    );
  };

  render() {
    return (
      <ListStyleFacet<string>
        facetHeader={translate('coding_rules.facet.repositories')}
        fetching={false}
        getFacetItemText={this.renderTextName}
        getSearchResultKey={(rep) => rep}
        getSearchResultText={this.renderTextName}
        onChange={this.props.onChange}
        onSearch={this.handleSearch}
        onToggle={this.props.onToggle}
        open={this.props.open}
        property="repositories"
        renderFacetItem={this.renderName}
        renderSearchResult={this.renderSearchTextName}
        searchInputAriaLabel={translate('search.search_for_repositories')}
        searchPlaceholder={translate('search.search_for_repositories')}
        stats={this.props.stats}
        values={this.props.values}
      />
    );
  }
}

export default withLanguagesContext(RepositoryFacet);
