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

import { Link, MessageCallout, MessageType } from '@sonarsource/echoes-react';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import ListFooter from '~sq-server-shared/components/controls/ListFooter';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { queryToSearchString } from '~sq-server-shared/sonar-aligned/helpers/urls';
import { AzureProject, AzureRepository } from '~sq-server-shared/types/alm-integration';
import { CreateProjectModes } from '~sq-server-shared/types/create-project';
import AzureProjectAccordion from './AzureProjectAccordion';

export interface AzureProjectsListProps {
  loadingRepositories: Record<string, boolean>;
  onImportRepository: (repository: AzureRepository) => void;
  onOpenProject: (key: string) => void;
  projects?: AzureProject[];
  repositories?: Record<string, AzureRepository[]>;
  searchQuery?: string;
  searchResults?: AzureRepository[];
}

const PAGE_SIZE = 10;

export default function AzureProjectsList(props: AzureProjectsListProps) {
  const { loadingRepositories, projects = [], repositories, searchResults, searchQuery } = props;

  const [page, setPage] = React.useState(1);

  if (searchResults && searchResults.length === 0) {
    return (
      <MessageCallout
        text={translate('onboarding.create_project.azure.no_results')}
        type={MessageType.Warning}
      />
    );
  }

  if (projects.length === 0) {
    return (
      <MessageCallout
        text={
          <FormattedMessage
            id="onboarding.create_project.azure.no_projects"
            values={{
              link: (
                <Link
                  to={{
                    pathname: '/projects/create',
                    search: queryToSearchString({
                      mode: CreateProjectModes.AzureDevOps,
                      resetPat: 1,
                    }),
                  }}
                >
                  {translate('onboarding.create_project.update_your_token')}
                </Link>
              ),
            }}
          />
        }
        type={MessageType.Warning}
      />
    );
  }

  let filteredProjects: AzureProject[];
  if (searchResults !== undefined) {
    filteredProjects = uniqBy(
      searchResults.map((r) => {
        return (
          projects.find((p) => p.name === r.projectName) || {
            name: r.projectName,
            description: translateWithParameters(
              'onboarding.create_project.azure.search_results_for_project_X',
              r.projectName,
            ),
          }
        );
      }),
      'name',
    );
  } else {
    filteredProjects = projects;
  }

  const displayedProjects = filteredProjects.slice(0, page * PAGE_SIZE);

  // Add a suffix to the key to force react to not reuse AzureProjectAccordions between
  // search results and project exploration
  const keySuffix = searchResults ? ' - result' : '';

  return (
    <div>
      <div className="sw-flex sw-flex-col sw-gap-6">
        {displayedProjects.map((p, i) => (
          <AzureProjectAccordion
            key={`${p.name}${keySuffix}`}
            loading={Boolean(loadingRepositories[p.name])}
            onImportRepository={props.onImportRepository}
            onOpen={props.onOpenProject}
            project={p}
            repositories={
              searchResults
                ? searchResults.filter((s) => s.projectName === p.name)
                : repositories?.[p.name]
            }
            searchQuery={searchQuery}
            startsOpen={searchResults !== undefined || i === 0}
          />
        ))}
      </div>

      <ListFooter
        className="sw-mb-12"
        count={displayedProjects.length}
        loadMore={() => {
          setPage((p) => p + 1);
        }}
        total={filteredProjects.length}
      />
    </div>
  );
}
