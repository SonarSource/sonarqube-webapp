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

import { Heading, Link, Spinner, Text } from '@sonarsource/echoes-react';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Paging } from '~shared/types/paging';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { GitlabProject } from '~sq-server-commons/types/alm-integration';
import {
  AlmInstanceBase,
  AlmKeys,
  AlmSettingsInstance,
} from '~sq-server-commons/types/alm-settings';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { Feature } from '~sq-server-commons/types/features';
import AlmSettingsInstanceDropdown from '../components/AlmSettingsInstanceDropdown';
import { PersonalAccessTokenResetLink } from '../components/PersonalAccessTokenResetLink';
import RepositoryList from '../components/RepositoryList';
import WrongBindingCountAlert from '../components/WrongBindingCountAlert';
import GitlabPersonalAccessTokenForm from './GItlabPersonalAccessTokenForm';

export interface GitlabProjectCreateRendererProps {
  almInstances?: AlmSettingsInstance[];
  loading: boolean;
  onImport: (id: string[]) => void;
  onLoadMore: () => void;
  onPersonalAccessTokenCreated: () => void;
  onSearch: (searchQuery: string) => void;
  onSelectedAlmInstanceChange: (instance: AlmInstanceBase) => void;
  projects?: GitlabProject[];
  projectsPaging: Paging;
  resetPat: boolean;
  searchQuery: string;
  selectedAlmInstance?: AlmSettingsInstance;
  showPersonalAccessTokenForm?: boolean;
}

export default function GitlabProjectCreateRenderer(
  props: Readonly<GitlabProjectCreateRendererProps>,
) {
  const isMonorepoSupported = useContext(AvailableFeaturesContext).includes(
    Feature.MonoRepositoryPullRequestDecoration,
  );

  const {
    almInstances,
    loading,
    onLoadMore,
    onSearch,
    projects,
    projectsPaging,
    resetPat,
    searchQuery,
    selectedAlmInstance,
    showPersonalAccessTokenForm,
  } = props;

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleCheck = (id: string) => {
    setSelected((prev) => new Set(prev.delete(id) ? prev : prev.add(id)));
  };

  const handleCheckAll = () => {
    setSelected(
      new Set(projects?.filter((r) => r.sqProjectKey === undefined).map((r) => r.id) ?? []),
    );
  };

  const handleImport = () => {
    props.onImport(Array.from(selected));
  };

  const handleUncheckAll = () => {
    setSelected(new Set());
  };

  useEffect(() => {
    const selectedIds = Array.from(selected).filter((id) => projects?.find((r) => r.id === id));
    setSelected(new Set(selectedIds));
    // We want to update only when `projects` changes.
    // If we subscribe to `selected` changes we will enter an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <>
      <header className="sw-mb-10">
        <Heading as="h1" className="sw-mb-4">
          {translate('onboarding.create_project.gitlab.title')}
        </Heading>
        <Text>
          {isMonorepoSupported ? (
            <FormattedMessage
              id="onboarding.create_project.gitlab.subtitle.with_monorepo"
              values={{
                monorepoSetupLink: (
                  <Link
                    to={{
                      pathname: '/projects/create',
                      search: queryToSearchString({
                        mode: CreateProjectModes.GitLab,
                        mono: true,
                      }),
                    }}
                  >
                    <FormattedMessage id="onboarding.create_project.subtitle_monorepo_setup_link" />
                  </Link>
                ),
              }}
            />
          ) : (
            <FormattedMessage id="onboarding.create_project.gitlab.subtitle" />
          )}
        </Text>

        {selectedAlmInstance && !showPersonalAccessTokenForm && (
          <PersonalAccessTokenResetLink
            className="sw-mt-4"
            createProjectMode={CreateProjectModes.GitLab}
          />
        )}
      </header>

      <AlmSettingsInstanceDropdown
        almInstances={almInstances}
        almKey={AlmKeys.GitLab}
        onChangeConfig={props.onSelectedAlmInstanceChange}
        selectedAlmInstance={selectedAlmInstance}
      />

      <Spinner isLoading={loading} />

      {!loading && almInstances && almInstances.length === 0 && !selectedAlmInstance && (
        <WrongBindingCountAlert alm={AlmKeys.GitLab} />
      )}

      {!loading &&
        selectedAlmInstance &&
        (showPersonalAccessTokenForm ? (
          <GitlabPersonalAccessTokenForm
            almSetting={selectedAlmInstance}
            onPersonalAccessTokenCreated={props.onPersonalAccessTokenCreated}
            resetPat={resetPat}
          />
        ) : (
          <RepositoryList
            almKey={AlmKeys.GitLab}
            checkAll={handleCheckAll}
            loadingRepositories={loading}
            onCheck={handleCheck}
            onImport={handleImport}
            onLoadMore={onLoadMore}
            onSearch={onSearch}
            repositories={projects}
            repositoryPaging={projectsPaging}
            searchQuery={searchQuery}
            selected={selected}
            uncheckAll={handleUncheckAll}
          />
        ))}
    </>
  );
}
