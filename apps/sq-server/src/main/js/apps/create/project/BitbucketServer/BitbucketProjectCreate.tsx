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

import { useEffect, useMemo, useRef, useState } from 'react';
import { LabelValueSelectOption } from '~design-system';
import {
  getBitbucketServerProjects,
  getBitbucketServerRepositories,
} from '~sq-server-shared/api/alm-integrations';
import { useLocation } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { BitbucketProject, BitbucketRepository } from '~sq-server-shared/types/alm-integration';
import { AlmKeys } from '~sq-server-shared/types/alm-settings';
import { CreateProjectModes, ImportProjectParam } from '~sq-server-shared/types/create-project';
import { DopSetting } from '~sq-server-shared/types/dop-translation';
import { BBSSearchMode } from '../constants';
import MonorepoProjectCreate from '../monorepo/MonorepoProjectCreate';
import { useProjectCreate } from '../useProjectCreate';
import BitbucketCreateProjectRenderer from './BitbucketProjectCreateRenderer';
import BitbucketServerPersonalAccessTokenForm from './BitbucketServerPersonalAccessTokenForm';

interface Props {
  dopSettings: DopSetting[];
  isLoadingBindings: boolean;
  onProjectSetupDone: (importProjects: ImportProjectParam) => void;
}

export default function BitbucketProjectCreate({
  dopSettings,
  isLoadingBindings,
  onProjectSetupDone,
}: Readonly<Props>) {
  const location = useLocation();

  const {
    almInstances,
    handlePersonalAccessTokenCreated,
    handleSelectRepository: onSelectRepository,
    isLoadingRepositories,
    isMonorepoSetup,
    onSelectedAlmInstanceChange,
    repositories = [],
    resetPersonalAccessToken,
    searchQuery,
    selectedAlmInstance,
    selectedDopSetting,
    selectedRepository,
    setIsLoadingRepositories,
    setRepositories,
    setSearchQuery,
    setSelectedDopSetting,
    showPersonalAccessTokenForm,
  } = useProjectCreate<BitbucketRepository, BitbucketRepository[], BitbucketProject>(
    AlmKeys.BitbucketServer,
    dopSettings,
    ({ slug }) => slug,
  );

  const repositoryRequestPaging = useRef({
    isLastPage: false,
    nextPageStart: 0,
  });

  const [hasProjects, setHasProjects] = useState(false);
  const [searchMode, setSearchMode] = useState(BBSSearchMode.Repository);

  const checkHasProjects = async () => {
    if (selectedDopSetting === undefined) {
      return;
    }

    const { projects } = await getBitbucketServerProjects(selectedDopSetting.key, 0, 1);

    setHasProjects(projects.length > 0);
  };

  const fetchRepositories = async () => {
    if (selectedDopSetting === undefined || isLoadingRepositories) {
      return;
    }

    const start = repositoryRequestPaging.current.nextPageStart;

    setIsLoadingRepositories(true);
    const { isLastPage, nextPageStart, repositories } = await getBitbucketServerRepositories(
      selectedDopSetting.key,
      searchMode === BBSSearchMode.Project ? searchQuery : undefined,
      searchMode === BBSSearchMode.Repository ? searchQuery : undefined,
      start,
    );

    // This function will not be run concurrently thanks to the check `if ([...] || isLoadingRepositories)` above
    // eslint-disable-next-line require-atomic-updates
    repositoryRequestPaging.current = {
      isLastPage,
      nextPageStart,
    };
    setRepositories((currentRepositories = []) =>
      start > 0 ? [...currentRepositories, ...repositories] : repositories,
    );
    setIsLoadingRepositories(false);
  };

  const handleImportRepository = (selectedRepository: BitbucketRepository) => {
    if (selectedDopSetting) {
      onProjectSetupDone({
        creationMode: CreateProjectModes.BitbucketServer,
        almSetting: selectedDopSetting.key,
        monorepo: false,
        projects: [
          {
            projectKey: selectedRepository.projectKey,
            repositorySlug: selectedRepository.slug,
          },
        ],
      });
    }
  };

  const handleMonorepoSetupDone = (monorepoSetup: ImportProjectParam) => {
    const bitbucketMonorepoSetup = {
      ...monorepoSetup,
      projectIdentifier: selectedRepository?.projectKey,
    };

    onProjectSetupDone(bitbucketMonorepoSetup);
  };

  const repositoryOptions = useMemo(() => {
    if (repositories === undefined) {
      return [];
    }

    const projectsRepositories = repositories.reduce(
      (acc, repository) => {
        acc[repository.projectName ?? repository.projectKey] = [
          ...(acc[repository.projectName ?? repository.projectKey] ?? []),
          transformToOption(repository),
        ];
        return acc;
      },
      {} as Record<string, LabelValueSelectOption[]>,
    );

    return Object.entries(projectsRepositories).map(([projectName, repositories]) => ({
      label: projectName,
      options: repositories,
    }));
  }, [repositories]);

  const canFetchMoreRepositories = !repositoryRequestPaging.current.isLastPage;

  useEffect(
    () => {
      if (!showPersonalAccessTokenForm) {
        setSearchQuery('');
        setSearchMode(BBSSearchMode.Repository);
        repositoryRequestPaging.current = {
          isLastPage: false,
          nextPageStart: 0,
        };
        checkHasProjects();
        fetchRepositories();
      }
    },
    // We want this effect to run only when one of the following props changed:
    // - `isMonorepoSetup`
    // - `selectedDopSetting`
    // - `showPersonalAccessTokenForm`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMonorepoSetup, selectedDopSetting, showPersonalAccessTokenForm],
  );

  useEffect(
    () => {
      repositoryRequestPaging.current = {
        isLastPage: false,
        nextPageStart: 0,
      };
      fetchRepositories();
    },
    // We want this effect to run only when `searchMode` or `searchQuery` changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchMode, searchQuery],
  );

  return isMonorepoSetup ? (
    <MonorepoProjectCreate
      dopSettings={dopSettings}
      error={false}
      loadingBindings={isLoadingBindings}
      loadingOrganizations={false}
      loadingRepositories={isLoadingRepositories}
      onProjectSetupDone={handleMonorepoSetupDone}
      onSearchRepositories={setSearchQuery}
      onSelectDopSetting={setSelectedDopSetting}
      onSelectRepository={onSelectRepository}
      personalAccessTokenComponent={
        !isLoadingRepositories &&
        selectedDopSetting && (
          <BitbucketServerPersonalAccessTokenForm
            almSetting={selectedDopSetting}
            onPersonalAccessTokenCreated={handlePersonalAccessTokenCreated}
            resetPat={resetPersonalAccessToken}
          />
        )
      }
      repositoryOptions={repositoryOptions}
      repositorySearchQuery={searchQuery}
      selectedDopSetting={selectedDopSetting}
      selectedRepository={selectedRepository ? transformToOption(selectedRepository) : undefined}
      showPersonalAccessToken={showPersonalAccessTokenForm || Boolean(location.query.resetPat)}
    />
  ) : (
    <BitbucketCreateProjectRenderer
      almInstances={almInstances}
      canFetchMore={canFetchMoreRepositories}
      hasProjects={hasProjects}
      isLoading={isLoadingBindings}
      onChangeSearchMode={setSearchMode}
      onFetchMore={fetchRepositories}
      onImportRepository={handleImportRepository}
      onPersonalAccessTokenCreated={handlePersonalAccessTokenCreated}
      onSearch={setSearchQuery}
      onSelectedAlmInstanceChange={onSelectedAlmInstanceChange}
      repositories={repositories}
      resetPat={Boolean(location.query.resetPat)}
      searchMode={searchMode}
      searching={isLoadingRepositories}
      selectedAlmInstance={selectedAlmInstance}
      showPersonalAccessTokenForm={showPersonalAccessTokenForm || Boolean(location.query.resetPat)}
    />
  );
}

function transformToOption({ name, slug }: BitbucketRepository): LabelValueSelectOption {
  return { value: slug, label: name };
}
