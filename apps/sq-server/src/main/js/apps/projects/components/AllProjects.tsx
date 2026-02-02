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

import { Heading, Layout, Spinner } from '@sonarsource/echoes-react';
import { chunk, keyBy, last, mapValues, omitBy, pick } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { useCurrentUser } from '~adapters/helpers/users';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import ListFooter from '~shared/components/controls/ListFooter';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { isDefined } from '~shared/helpers/types';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { ComponentQualifier } from '~shared/types/component';
import { RawQuery } from '~shared/types/router';
import { searchProjects } from '~sq-server-commons/api/components';
import EmptySearch from '~sq-server-commons/components/common/EmptySearch';
import '~sq-server-commons/components/search-navigator.css';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import handleRequiredAuthentication from '~sq-server-commons/helpers/handleRequiredAuthentication';
import { convertToQueryData, hasFilterParams } from '~sq-server-commons/helpers/projects';
import { useMeasuresForProjectsQuery } from '~sq-server-commons/queries/measures';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import {
  PROJECTS_PAGE_SIZE,
  useMyScannableProjectsQuery,
  useProjectsQuery,
} from '~sq-server-commons/queries/projects';
import { Feature } from '~sq-server-commons/types/features';
import { isLoggedIn } from '~sq-server-commons/types/users';
import { parseUrlQuery } from '../query';
import '../styles.css';
import { SORTING_SWITCH, defineMetrics, getFacetsMap, parseSorting } from '../utils';
import EmptyFavoriteSearch from './EmptyFavoriteSearch';
import EmptyInstance from './EmptyInstance';
import NoFavoriteProjects from './NoFavoriteProjects';
import PageHeader from './PageHeader';
import PageSidebar from './PageSidebar';
import ProjectsList from './ProjectsList';

export const LS_PROJECTS_SORT = 'sonarqube.projects.sort';
export const LS_PROJECTS_VIEW = 'sonarqube.projects.view';

function AllProjects({ isFavorite }: Readonly<{ isFavorite: boolean }>) {
  const appState = useAppState();
  const { currentUser } = useCurrentUser();
  const router = useRouter();
  const intl = useIntl();
  const scrollElementRef = useRef<HTMLDivElement | null>(null);
  const { query, pathname } = useLocation();
  const parsedQuery = parseUrlQuery(query);
  const querySort = parsedQuery.sort ?? 'name';
  const queryView = parsedQuery.view ?? 'overall';
  const [projectsSort, setProjectsSort] = useLocalStorage(LS_PROJECTS_SORT);
  const [projectsView, setProjectsView] = useLocalStorage(LS_PROJECTS_VIEW);
  const { data: isStandardMode = false, isLoading: loadingMode } = useStandardExperienceModeQuery();

  const {
    data: projectPages,
    isLoading: loadingProjects,
    isFetchingNextPage,
    fetchNextPage,
  } = useProjectsQuery(
    {
      isFavorite,
      query: parsedQuery,
      isStandardMode,
    },
    { refetchOnMount: 'always' },
  );
  const { data: { projects: scannableProjects = [] } = {}, isLoading: loadingScannableProjects } =
    useMyScannableProjectsQuery();
  const { projects, facets, paging } = useMemo(
    () => ({
      projects:
        projectPages?.pages
          .flatMap((page) => page.components)
          .map((project) => ({
            ...project,
            isScannable: scannableProjects.find((p) => p.key === project.key) !== undefined,
          })) ?? [],
      facets: getFacetsMap(
        projectPages?.pages[projectPages?.pages.length - 1]?.facets ?? [],
        isStandardMode,
      ),
      paging: projectPages?.pages[projectPages?.pages.length - 1]?.paging,
    }),
    [projectPages, scannableProjects, isStandardMode],
  );

  const { hasFeature } = useAvailableFeatures();
  const scaEnabled = hasFeature(Feature.Sca);
  // Fetch measures by using chunks of 50
  const measureQueries = useMeasuresForProjectsQuery({
    projectKeys: projects.map((p) => p.key),
    metricKeys: defineMetrics(parsedQuery, scaEnabled),
  });
  const measuresForLastChunkAreLoading = Boolean(last(measureQueries)?.isLoading);
  const measures = measureQueries
    .map((q) => q.data)
    .flat()
    .filter(isDefined);

  // When measures for latest page are loading, we don't want to show them
  const readyProjects = useMemo(() => {
    if (measuresForLastChunkAreLoading) {
      return chunk(projects, PROJECTS_PAGE_SIZE).slice(0, -1).flat();
    }

    return projects;
  }, [projects, measuresForLastChunkAreLoading]);

  const isLoading =
    loadingMode ||
    loadingProjects ||
    loadingScannableProjects ||
    Boolean(measureQueries[0]?.isLoading);

  // Set sort and view from LS if not present in URL
  useEffect(() => {
    const hasViewParams = parsedQuery.view ?? parsedQuery.sort;
    const hasSavedOptions = projectsSort ?? projectsView;

    if (hasViewParams === undefined && hasSavedOptions) {
      router.replace({ pathname, query: { ...query, sort: projectsSort, view: projectsView } });
    }
  }, [projectsSort, projectsView, router, parsedQuery, query, pathname]);

  /*
   * Needs refactoring to query
   */
  const loadSearchResultCount = (property: string, values: string[]) => {
    const data = convertToQueryData(
      { ...parsedQuery, [property]: values },
      isFavorite,
      isStandardMode,
      {
        ps: 1,
        facets: property,
      },
    );

    return searchProjects(data).then(({ facets }) => {
      const values = facets.find((facet) => facet.property === property)?.values ?? [];

      return mapValues(keyBy(values, 'val'), 'count');
    });
  };

  const updateLocationQuery = (newQuery: RawQuery) => {
    const nextQuery = omitBy({ ...query, ...newQuery }, (x) => !x);
    router.push({ pathname, query: nextQuery });
  };

  const handleClearAll = () => {
    const queryWithoutFilters = pick(query, ['view', 'sort']);
    router.push({ pathname, query: queryWithoutFilters });
  };

  const handleSortChange = (sort: string, desc: boolean) => {
    const asString = (desc ? '-' : '') + sort;
    updateLocationQuery({ sort: asString });
    setProjectsSort(asString);
  };

  const handlePerspectiveChange = ({ view }: { view?: string }) => {
    const query: {
      sort?: string;
      view: string | undefined;
    } = {
      view: view === 'overall' ? undefined : view,
    };

    if (isDefined(parsedQuery.sort)) {
      const sort = parseSorting(parsedQuery.sort);

      if (isDefined(SORTING_SWITCH[sort.sortValue])) {
        query.sort = (sort.sortDesc ? '-' : '') + SORTING_SWITCH[sort.sortValue];
      }
    }

    router.push({ pathname, query });

    setProjectsSort(query.sort);
    setProjectsView(query.view);
  };

  const isFiltered = hasFilterParams(parsedQuery);
  const pageTitle = intl.formatMessage({ id: 'projects.page' });

  return (
    <Layout.ContentGrid id="projects-page">
      <Helmet defer={false} title={pageTitle} />
      <Heading as="h1" className="sw-sr-only">
        {pageTitle}
      </Heading>

      <Layout.AsideLeft size="large">
        <section aria-label={intl.formatMessage({ id: 'filters' })}>
          <A11ySkipTarget
            anchor="projects_filters"
            label={intl.formatMessage({ id: 'projects.skip_to_filters' })}
            weight={10}
          />

          <PageSidebar
            applicationsEnabled={appState.qualifiers.includes(ComponentQualifier.Application)}
            facets={facets}
            loadSearchResultCount={loadSearchResultCount}
            onClearAll={handleClearAll}
            onQueryChange={updateLocationQuery}
            query={parsedQuery}
            view={queryView}
          />
        </section>
      </Layout.AsideLeft>

      <Layout.PageGrid ref={scrollElementRef}>
        <A11ySkipTarget anchor="projects_main" />
        <Heading as="h2" className="sw-sr-only">
          <FormattedMessage id="list_of_projects" />
        </Heading>

        <Layout.PageContent>
          <PageHeader
            currentUser={currentUser}
            onPerspectiveChange={handlePerspectiveChange}
            onQueryChange={updateLocationQuery}
            onSortChange={handleSortChange}
            query={parsedQuery}
            selectedSort={querySort}
            total={paging?.total}
            view={queryView}
          />

          <div className="it__layout-page-main-inner it__projects-list">
            <output>
              <Spinner isLoading={isLoading}>
                {readyProjects.length === 0 && isFiltered && isFavorite && (
                  <EmptyFavoriteSearch query={parsedQuery} />
                )}
                {readyProjects.length === 0 && isFiltered && !isFavorite && <EmptySearch />}
                {readyProjects.length === 0 && !isFiltered && isFavorite && <NoFavoriteProjects />}
                {readyProjects.length === 0 && !isFiltered && !isFavorite && <EmptyInstance />}
                {readyProjects.length > 0 && (
                  <span className="sw-sr-only">
                    {intl.formatMessage(
                      { id: 'projects.x_projects_found' },
                      { count: paging?.total },
                    )}
                  </span>
                )}
              </Spinner>
            </output>
            {readyProjects.length > 0 && (
              <>
                <ProjectsList
                  cardType={queryView}
                  isFavorite={isFavorite}
                  isFiltered={hasFilterParams(parsedQuery)}
                  measures={measures}
                  projects={readyProjects}
                  query={parsedQuery}
                  scrollElement={scrollElementRef.current ?? undefined}
                />
                <ListFooter
                  count={isDefined(readyProjects) ? readyProjects.length : 0}
                  loadMore={fetchNextPage}
                  loadMoreAriaLabel={intl.formatMessage({ id: 'projects.show_more' })}
                  loading={isFetchingNextPage || measuresForLastChunkAreLoading}
                  ready={!isFetchingNextPage && !measuresForLastChunkAreLoading}
                  total={paging?.total ?? 0}
                />
              </>
            )}
          </div>
        </Layout.PageContent>

        <GlobalFooter />
      </Layout.PageGrid>
    </Layout.ContentGrid>
  );
}

function withRedirectWrapper(Component: React.ComponentType<{ isFavorite: boolean }>) {
  return function Wrapper(props: Readonly<{ isFavorite: boolean }>) {
    const { currentUser } = useCurrentUser();
    if (props.isFavorite && !isLoggedIn(currentUser)) {
      handleRequiredAuthentication();
      return null;
    }

    return <Component {...props} />;
  };
}

export default withRedirectWrapper(AllProjects);
