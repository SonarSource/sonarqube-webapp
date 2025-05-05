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

import {
  Heading,
  Link,
  MessageCallout,
  MessageType,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { InputSearch, PageContentFontWrapper } from '~design-system';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getGlobalSettingsUrl } from '~sq-server-commons/helpers/urls';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { AzureProject, AzureRepository } from '~sq-server-commons/types/alm-integration';
import { AlmKeys, AlmSettingsInstance } from '~sq-server-commons/types/alm-settings';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { Feature } from '~sq-server-commons/types/features';
import { ALM_INTEGRATION_CATEGORY } from '../../../settings/constants';
import AlmSettingsInstanceDropdown from '../components/AlmSettingsInstanceDropdown';
import WrongBindingCountAlert from '../components/WrongBindingCountAlert';
import AzurePersonalAccessTokenForm from './AzurePersonalAccessTokenForm';
import AzureProjectsList from './AzureProjectsList';

export interface AzureProjectCreateRendererProps {
  almInstances?: AlmSettingsInstance[];
  loading: boolean;
  loadingRepositories: Record<string, boolean>;
  onImportRepository: (resository: AzureRepository) => void;
  onOpenProject: (key: string) => void;
  onPersonalAccessTokenCreate: () => void;
  onSearch: (query: string) => void;
  onSelectedAlmInstanceChange: (instance: AlmSettingsInstance) => void;
  projects?: AzureProject[];
  repositories?: Record<string, AzureRepository[]>;
  resetPat: boolean;
  searchQuery?: string;
  searchResults?: AzureRepository[];
  searching?: boolean;
  selectedAlmInstance?: AlmSettingsInstance;
  showPersonalAccessTokenForm?: boolean;
}

export default function AzureProjectCreateRenderer(
  props: Readonly<AzureProjectCreateRendererProps>,
) {
  const {
    loading,
    loadingRepositories,
    projects,
    repositories,
    searching,
    searchResults,
    searchQuery,
    almInstances,
    showPersonalAccessTokenForm,
    resetPat,
    selectedAlmInstance,
  } = props;

  const isMonorepoSupported = React.useContext(AvailableFeaturesContext).includes(
    Feature.MonoRepositoryPullRequestDecoration,
  );

  const { canAdmin } = useAppState();

  const showCountError = !loading && (!almInstances || almInstances.length === 0);
  const showUrlError =
    !loading && selectedAlmInstance !== undefined && selectedAlmInstance.url === undefined;

  return (
    <PageContentFontWrapper>
      <header className="sw-mb-10">
        <Heading as="h1">{translate('onboarding.create_project.azure.title')}</Heading>
        <Text>
          {isMonorepoSupported ? (
            <FormattedMessage
              id="onboarding.create_project.azure.subtitle.with_monorepo"
              values={{
                monorepoSetupLink: (
                  <Link
                    to={{
                      pathname: '/projects/create',
                      search: queryToSearchString({
                        mode: CreateProjectModes.AzureDevOps,
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
            <FormattedMessage id="onboarding.create_project.azure.subtitle" />
          )}
        </Text>
      </header>

      <AlmSettingsInstanceDropdown
        almInstances={almInstances}
        almKey={AlmKeys.Azure}
        onChangeConfig={props.onSelectedAlmInstanceChange}
        selectedAlmInstance={selectedAlmInstance}
      />

      <Spinner isLoading={loading} />

      {showUrlError && (
        <MessageCallout
          className="sw-mb-2"
          text={
            canAdmin ? (
              <FormattedMessage
                id="onboarding.create_project.azure.no_url.admin"
                values={{
                  alm: translate('onboarding.alm', AlmKeys.Azure),
                  url: (
                    <Link to={getGlobalSettingsUrl(ALM_INTEGRATION_CATEGORY)}>
                      {translate('settings.page')}
                    </Link>
                  ),
                }}
              />
            ) : (
              translate('onboarding.create_project.azure.no_url')
            )
          }
          type={MessageType.Danger}
        />
      )}

      {showCountError && <WrongBindingCountAlert alm={AlmKeys.Azure} />}

      {!loading &&
        selectedAlmInstance?.url &&
        (showPersonalAccessTokenForm ? (
          <div>
            <AzurePersonalAccessTokenForm
              almSetting={selectedAlmInstance}
              onPersonalAccessTokenCreate={props.onPersonalAccessTokenCreate}
              resetPat={resetPat}
            />
          </div>
        ) : (
          <>
            <div className="sw-mb-10 sw-w-abs-400">
              <InputSearch
                onChange={props.onSearch}
                placeholder={translate('onboarding.create_project.search_projects_repositories')}
                size="full"
              />
            </div>
            <Spinner isLoading={Boolean(searching)}>
              <AzureProjectsList
                loadingRepositories={loadingRepositories}
                onImportRepository={props.onImportRepository}
                onOpenProject={props.onOpenProject}
                projects={projects}
                repositories={repositories}
                searchQuery={searchQuery}
                searchResults={searchResults}
              />
            </Spinner>
          </>
        ))}
    </PageContentFontWrapper>
  );
}
