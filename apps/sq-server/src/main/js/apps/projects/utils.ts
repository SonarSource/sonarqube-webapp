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

import { invert } from 'lodash';
import { MetricKey } from '~shared/types/metrics';
import { Facet, getScannableProjects, searchProjects } from '~sq-server-commons/api/components';
import {
  convertToQueryData,
  defineFacets,
  propertyToMetricMap,
  propertyToMetricMapLegacy,
} from '~sq-server-commons/helpers/projects';
import { ProjectsQuery } from '~sq-server-commons/types/projects';

interface SortingOption {
  class?: string;
  value: string;
}

export const PROJECTS_DEFAULT_FILTER = 'sonarqube.projects.default';
export const PROJECTS_FAVORITE = 'favorite';
export const PROJECTS_ALL = 'all';

export const SORTING_METRICS: SortingOption[] = [
  { value: 'name' },
  { value: 'analysis_date' },
  { value: 'creation_date' },
  { value: 'reliability' },
  { value: 'security' },
  { value: 'security_review' },
  { value: 'maintainability' },
  { value: 'coverage' },
  { value: 'duplications' },
  { value: 'size' },
];

export const SORTING_LEAK_METRICS: SortingOption[] = [
  { value: 'name' },
  { value: 'analysis_date' },
  { value: 'creation_date' },
  { value: 'new_reliability', class: 'projects-leak-sorting-option' },
  { value: 'new_security', class: 'projects-leak-sorting-option' },
  { value: 'new_security_review', class: 'projects-leak-sorting-option' },
  { value: 'new_maintainability', class: 'projects-leak-sorting-option' },
  { value: 'new_coverage', class: 'projects-leak-sorting-option' },
  { value: 'new_duplications', class: 'projects-leak-sorting-option' },
  { value: 'new_ncloc', class: 'projects-leak-sorting-option' },
];

export const SORTING_SWITCH: Record<string, string> = {
  analysis_date: 'analysis_date',
  name: 'name',
  reliability: 'new_reliability',
  security: 'new_security',
  security_review: 'new_security_review',
  maintainability: 'new_maintainability',
  coverage: 'new_coverage',
  duplications: 'new_duplications',
  size: 'new_ncloc',
  new_reliability: 'reliability',
  new_security: 'security',
  new_security_review: 'security_review',
  new_maintainability: 'maintainability',
  new_coverage: 'coverage',
  new_duplications: 'duplications',
  new_ncloc: 'size',
};

export const VIEWS = [
  { value: 'overall', label: 'overall' },
  { value: 'leak', label: 'new_code' },
];

const PAGE_SIZE = 50;

export const METRICS = [
  MetricKey.alert_status,
  MetricKey.software_quality_reliability_issues,
  MetricKey.bugs,
  MetricKey.reliability_rating,
  MetricKey.software_quality_reliability_rating,
  MetricKey.software_quality_security_issues,
  MetricKey.vulnerabilities,
  MetricKey.security_rating,
  MetricKey.software_quality_security_rating,
  MetricKey.software_quality_maintainability_issues,
  MetricKey.code_smells,
  MetricKey.sqale_rating,
  MetricKey.software_quality_maintainability_rating,
  MetricKey.security_hotspots_reviewed,
  MetricKey.security_review_rating,
  MetricKey.duplicated_lines_density,
  MetricKey.coverage,
  MetricKey.ncloc,
  MetricKey.ncloc_language_distribution,
  MetricKey.projects,
];

export const METRICS_WITH_SCA = [
  ...METRICS,
  MetricKey.sca_count_any_issue,
  MetricKey.sca_rating_any_issue,
];

export const LEAK_METRICS = [
  MetricKey.alert_status,
  MetricKey.new_violations,
  MetricKey.new_security_hotspots_reviewed,
  MetricKey.new_security_review_rating,
  MetricKey.new_coverage,
  MetricKey.new_duplicated_lines_density,
  MetricKey.new_ncloc,
  MetricKey.projects,
];

const REVERSED_FACETS = ['coverage', 'new_coverage'];
let scannableProjectsCached: { key: string; name: string }[] | null = null;

export function parseSorting(sort: string): { sortDesc: boolean; sortValue: string } {
  const desc = sort.startsWith('-');

  return { sortValue: desc ? sort.substring(1) : sort, sortDesc: desc };
}

export async function fetchScannableProjects() {
  if (scannableProjectsCached) {
    return Promise.resolve({ scannableProjects: scannableProjectsCached });
  }

  const response = await getScannableProjects().then(({ projects }) => {
    scannableProjectsCached = projects;
    return projects;
  });

  return { scannableProjects: response };
}

export function fetchProjects({
  isFavorite,
  query,
  pageIndex = 1,
  isStandardMode,
}: {
  isFavorite: boolean;
  isStandardMode: boolean;
  pageIndex?: number;
  query: ProjectsQuery;
}) {
  const ps = PAGE_SIZE;

  const data = convertToQueryData(query, isFavorite, isStandardMode, {
    p: pageIndex > 1 ? pageIndex : undefined,
    ps,
    facets: defineFacets(query, isStandardMode).join(),
    f: 'analysisDate,leakPeriodDate',
  });

  return searchProjects(data)
    .then((response) => Promise.all([Promise.resolve(response), fetchScannableProjects()]))
    .then(([{ components, facets, paging }, { scannableProjects }]) => {
      return {
        facets: getFacetsMap(facets, isStandardMode),
        projects: components.map((component) => ({
          ...component,
          isScannable: scannableProjects.find((p) => p.key === component.key) !== undefined,
        })),
        total: paging.total,
      };
    });
}

export function defineMetrics(query: ProjectsQuery, scaEnabled = false): string[] {
  if (query.view === 'leak') {
    return LEAK_METRICS;
  }

  if (scaEnabled) {
    return METRICS_WITH_SCA;
  }

  return METRICS;
}

function mapFacetValues(values: Array<{ count: number; val: string }>) {
  const map: Record<string, number> = {};

  values.forEach((value) => {
    map[value.val] = value.count;
  });

  return map;
}

export function getFacetsMap(facets: Facet[], isStandardMode: boolean) {
  const map: Record<string, Record<string, number>> = {};

  facets.forEach((facet) => {
    const property = invert(isStandardMode ? propertyToMetricMapLegacy : propertyToMetricMap)[
      facet.property
    ];
    const { values } = facet;

    if (REVERSED_FACETS.includes(property)) {
      values.reverse();
    }

    map[property] = mapFacetValues(values);
  });

  return map;
}
