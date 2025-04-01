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

import { Button, ButtonVariety, Divider } from '@sonarsource/echoes-react';
import { flatMap } from 'lodash';
import * as React from 'react';
import { StyledPageTitle } from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';
import { hasFilterParams } from '~sq-server-shared/helpers/projects';
import { MetricKey } from '~sq-server-shared/sonar-aligned/types/metrics';
import { RawQuery } from '~sq-server-shared/sonar-aligned/types/router';
import { ProjectsQuery } from '~sq-server-shared/types/projects';
import { Dict } from '~sq-server-shared/types/types';
import CoverageFilter from '../filters/CoverageFilter';
import DuplicationsFilter from '../filters/DuplicationsFilter';
import LanguagesFilter from '../filters/LanguagesFilter';
import NewCoverageFilter from '../filters/NewCoverageFilter';
import NewDuplicationsFilter from '../filters/NewDuplicationsFilter';
import NewLinesFilter from '../filters/NewLinesFilter';
import QualifierFacet from '../filters/QualifierFilter';
import QualityGateFacet from '../filters/QualityGateFilter';
import RatingFilter from '../filters/RatingFilter';
import SizeFilter from '../filters/SizeFilter';
import TagsFacet from '../filters/TagsFilter';
import { Facets } from '../types';
import FavoriteFilter from './FavoriteFilter';

export interface PageSidebarProps {
  applicationsEnabled: boolean;
  facets?: Facets;
  loadSearchResultCount: (property: string, values: string[]) => Promise<Dict<number>>;
  onClearAll: () => void;
  onQueryChange: (change: RawQuery) => void;
  query: ProjectsQuery;
  view: string;
}

export default function PageSidebar(props: PageSidebarProps) {
  const {
    applicationsEnabled,
    facets,
    loadSearchResultCount,
    onClearAll,
    onQueryChange,
    query,
    view,
  } = props;
  const isFiltered = hasFilterParams(query);
  const isLeakView = view === 'leak';
  const maxFacetValue = getMaxFacetValue(facets);
  const facetProps = { onQueryChange, maxFacetValue };

  const heading = React.useRef<HTMLHeadingElement>(null);

  const clearAll = React.useCallback(() => {
    onClearAll();
    if (heading.current) {
      heading.current.focus();
    }
  }, [onClearAll, heading]);

  return (
    <div className="sw-typo-default sw-px-4 sw-pt-12 sw-pb-24">
      <FavoriteFilter />

      <div className="sw-flex sw-items-center sw-justify-between">
        <StyledPageTitle as="h2" className="sw-typo-lg-semibold" ref={heading} tabIndex={-1}>
          {translate('filters')}
        </StyledPageTitle>

        {isFiltered && (
          <Button onClick={clearAll} variety={ButtonVariety.DangerOutline}>
            {translate('clear_all_filters')}
          </Button>
        )}
      </div>

      <Divider className="sw-my-2" />

      <QualityGateFacet
        {...facetProps}
        facet={getFacet(facets, 'gate')}
        value={query.gate?.split(',')}
      />

      <Divider className="sw-my-2" />

      {!isLeakView && (
        <>
          <RatingFilter
            {...facetProps}
            facets={facets}
            property="security"
            value={query.security}
          />

          <Divider className="sw-my-2" />

          <RatingFilter
            {...facetProps}
            facets={facets}
            property="reliability"
            value={query.reliability}
          />

          <Divider className="sw-my-2" />

          <RatingFilter
            {...facetProps}
            facets={facets}
            property="maintainability"
            value={query.maintainability}
          />

          <Divider className="sw-my-2" />

          <RatingFilter
            {...facetProps}
            facets={facets}
            property="security_review"
            value={query.security_review}
          />

          <Divider className="sw-my-2" />

          <CoverageFilter
            {...facetProps}
            facet={getFacet(facets, MetricKey.coverage)}
            value={query.coverage}
          />

          <Divider className="sw-my-2" />

          <DuplicationsFilter
            {...facetProps}
            facet={getFacet(facets, 'duplications')}
            value={query.duplications}
          />

          <Divider className="sw-my-2" />

          <SizeFilter {...facetProps} facet={getFacet(facets, 'size')} value={query.size} />
        </>
      )}
      {isLeakView && (
        <>
          <RatingFilter
            {...facetProps}
            facets={facets}
            property="new_security"
            value={query.new_security}
          />

          <Divider className="sw-my-2" />

          <RatingFilter
            {...facetProps}
            facets={facets}
            property="new_reliability"
            value={query.new_reliability}
          />

          <Divider className="sw-my-2" />

          <RatingFilter
            {...facetProps}
            facets={facets}
            property="new_maintainability"
            value={query.new_maintainability}
          />

          <Divider className="sw-my-2" />

          <RatingFilter
            {...facetProps}
            facets={facets}
            property="security_review"
            value={query.new_security_review}
          />

          <Divider className="sw-my-2" />

          <NewCoverageFilter
            {...facetProps}
            facet={getFacet(facets, MetricKey.new_coverage)}
            value={query.new_coverage}
          />

          <Divider className="sw-my-2" />

          <NewDuplicationsFilter
            {...facetProps}
            facet={getFacet(facets, 'new_duplications')}
            value={query.new_duplications}
          />

          <Divider className="sw-my-2" />

          <NewLinesFilter
            {...facetProps}
            facet={getFacet(facets, MetricKey.new_lines)}
            value={query.new_lines}
          />
        </>
      )}

      <Divider className="sw-my-2" />

      <LanguagesFilter
        {...facetProps}
        facet={getFacet(facets, 'languages')}
        loadSearchResultCount={loadSearchResultCount}
        query={query}
        value={query.languages}
      />

      <Divider className="sw-my-2" />

      {applicationsEnabled && (
        <>
          <QualifierFacet
            {...facetProps}
            facet={getFacet(facets, 'qualifier')}
            value={query.qualifier}
          />

          <Divider className="sw-my-2" />
        </>
      )}
      <TagsFacet
        {...facetProps}
        facet={getFacet(facets, 'tags')}
        loadSearchResultCount={loadSearchResultCount}
        query={query}
        value={query.tags}
      />
    </div>
  );
}

function getFacet(facets: Facets | undefined, name: string) {
  return facets?.[name];
}

function getMaxFacetValue(facets?: Facets) {
  return facets && Math.max(...flatMap(Object.values(facets), (facet) => Object.values(facet)));
}
