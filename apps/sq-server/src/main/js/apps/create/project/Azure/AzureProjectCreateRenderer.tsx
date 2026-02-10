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

import { Layout, Link, MessageCallout, MessageVariety, Spinner } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { InputSearch } from '~design-system';
import { useLocation } from '~shared/components/hoc/withRouter';
import { GlobalPageTemplate } from '~sq-server-commons/components/ui/GlobalPageTemplate';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { getGlobalSettingsUrl } from '~sq-server-commons/helpers/urls';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { AzureProject, AzureRepository } from '~sq-server-commons/types/alm-integration';
import { AlmKeys, AlmSettingsInstance } from '~sq-server-commons/types/alm-settings';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { Feature } from '~sq-server-commons/types/features';
import { ALM_INTEGRATION_CATEGORY } from '../../../settings/constants';
import AlmSettingsInstanceDropdown from '../components/AlmSettingsInstanceDropdown';
import { PersonalAccessTokenResetLink } from '../components/PersonalAccessTokenResetLink';
import WrongBindingCountAlert from '../components/WrongBindingCountAlert';
import { isProjectSetupDone } from '../utils';
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
  const location = useLocation();

  const showCountError = !loading && (!almInstances || almInstances.length === 0);
  const showUrlError =
    !loading && selectedAlmInstance !== undefined && selectedAlmInstance.url === undefined;

  const { formatMessage } = useIntl();

  return (
    <GlobalPageTemplate
      description={
        <Layout.PageHeader.Description>
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
          {selectedAlmInstance && !showPersonalAccessTokenForm && (
            <PersonalAccessTokenResetLink
              className="sw-mt-4"
              createProjectMode={CreateProjectModes.AzureDevOps}
            />
          )}
        </Layout.PageHeader.Description>
      }
      pageClassName={classNames({ 'sw-hidden': isProjectSetupDone(location) })}
      title={formatMessage({ id: 'onboarding.create_project.azure.title' })}
    >
      <AlmSettingsInstanceDropdown
        almInstances={almInstances}
        almKey={AlmKeys.Azure}
        onChangeConfig={props.onSelectedAlmInstanceChange}
        selectedAlmInstance={selectedAlmInstance}
      />

      <Spinner isLoading={loading} />

      {showUrlError && (
        <MessageCallout className="sw-mb-2" variety={MessageVariety.Danger}>
          {canAdmin ? (
            <FormattedMessage
              id="onboarding.create_project.azure.no_url.admin"
              values={{
                alm: <FormattedMessage id="onboarding.alm.azure" />,
                url: (
                  <Link to={getGlobalSettingsUrl(ALM_INTEGRATION_CATEGORY)}>
                    <FormattedMessage id="settings.page" />
                  </Link>
                ),
              }}
            />
          ) : (
            <FormattedMessage id="onboarding.create_project.azure.no_url" />
          )}
        </MessageCallout>
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
                placeholder={formatMessage({
                  id: 'onboarding.create_project.search_projects_repositories',
                })}
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
    </GlobalPageTemplate>
  );
}
