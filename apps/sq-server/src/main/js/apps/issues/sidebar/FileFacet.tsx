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

import { omit } from 'lodash';
import * as React from 'react';
import { QualifierIcon } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { MetricKey } from '~shared/types/metrics';
import { getFiles } from '~sq-server-commons/api/components';
import { ListStyleFacet } from '~sq-server-commons/components/controls/ListStyleFacet';
import { translate } from '~sq-server-commons/helpers/l10n';
import { collapsePath, splitPath } from '~sq-server-commons/helpers/path';
import { highlightTerm } from '~sq-server-commons/helpers/search';
import { getBranchLikeQuery } from '~sq-server-commons/sonar-aligned/helpers/branch-like';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { TreeComponentWithPath } from '~sq-server-commons/types/component';
import { Facet, IssuesQuery } from '~sq-server-commons/types/issues';

interface Props {
  branchLike?: BranchLike;
  componentKey: string;
  fetching: boolean;
  files: string[];
  loadSearchResultCount: (property: string, changes: Partial<IssuesQuery>) => Promise<Facet>;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  query: IssuesQuery;
  stats: Facet | undefined;
}

const MAX_PATH_LENGTH = 15;

export class FileFacet extends React.PureComponent<Props> {
  getFacetItemText = (path: string) => {
    return path;
  };

  getSearchResultKey = (file: TreeComponentWithPath) => {
    return file.path;
  };

  getSearchResultText = (file: TreeComponentWithPath) => {
    return file.path;
  };

  handleSearch = (query: string, page: number) => {
    const { branchLike } = this.props;

    return getFiles({
      component: this.props.componentKey,
      ...getBranchLikeQuery(branchLike),
      q: query,
      p: page,
      ps: 30,
    }).then(({ components, paging }) => ({
      paging,
      results: components.filter((file) => file.path !== undefined),
    }));
  };

  loadSearchResultCount = (files: TreeComponentWithPath[]) => {
    return this.props.loadSearchResultCount(MetricKey.files, {
      files: files
        .map((file) => {
          return file.path;
        })
        .filter(isDefined),
    });
  };

  renderFile = (file: React.ReactNode) => (
    <>
      <QualifierIcon className="sw-mr-1" qualifier="fil" />

      {file}
    </>
  );

  renderFacetItem = (path: string) => {
    return this.renderFile(path);
  };

  renderSearchResult = (file: TreeComponentWithPath, term: string) => {
    const { head, tail } = splitPath(collapsePath(file.path, MAX_PATH_LENGTH));

    return this.renderFile(
      <>
        {head}/{highlightTerm(tail, term)}
      </>,
    );
  };

  render() {
    return (
      <ListStyleFacet<TreeComponentWithPath>
        facetHeader={translate('issues.facet.files')}
        fetching={this.props.fetching}
        getFacetItemText={this.getFacetItemText}
        getSearchResultKey={this.getSearchResultKey}
        getSearchResultText={this.getSearchResultText}
        loadSearchResultCount={this.loadSearchResultCount}
        minSearchLength={3}
        onChange={this.props.onChange}
        onSearch={this.handleSearch}
        onToggle={this.props.onToggle}
        open={this.props.open}
        property={MetricKey.files}
        query={omit(this.props.query, MetricKey.files)}
        renderFacetItem={this.renderFacetItem}
        renderSearchResult={this.renderSearchResult}
        searchPlaceholder={translate('search.search_for_files')}
        stats={this.props.stats}
        values={this.props.files}
      />
    );
  }
}
