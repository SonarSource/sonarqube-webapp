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

import { Heading, Link, Spinner, Text } from '@sonarsource/echoes-react';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { BitbucketCloudRepository } from '~sq-server-commons/types/alm-integration';
import { AlmKeys, AlmSettingsInstance } from '~sq-server-commons/types/alm-settings';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { Feature } from '~sq-server-commons/types/features';
import AlmSettingsInstanceDropdown from '../components/AlmSettingsInstanceDropdown';
import { PersonalAccessTokenResetLink } from '../components/PersonalAccessTokenResetLink';
import WrongBindingCountAlert from '../components/WrongBindingCountAlert';
import BitbucketCloudPersonalAccessTokenForm from './BitbucketCloudPersonalAccessTokenForm';
import BitbucketCloudSearchForm from './BitbucketCloudSearchForm';

export interface BitbucketCloudProjectCreateRendererProps {
  almInstances: AlmSettingsInstance[];
  isLastPage: boolean;
  loading: boolean;
  loadingMore: boolean;
  onImport: (repositorySlug: string) => void;
  onLoadMore: () => void;
  onPersonalAccessTokenCreated: () => void;
  onSearch: (searchQuery: string) => void;
  onSelectedAlmInstanceChange: (instance: AlmSettingsInstance) => void;
  repositories?: BitbucketCloudRepository[];
  resetPat: boolean;
  searchQuery: string;
  searching: boolean;
  selectedAlmInstance?: AlmSettingsInstance;
  showPersonalAccessTokenForm: boolean;
}

export default function BitbucketCloudProjectCreateRenderer(
  props: Readonly<BitbucketCloudProjectCreateRendererProps>,
) {
  const isMonorepoSupported = useContext(AvailableFeaturesContext).includes(
    Feature.MonoRepositoryPullRequestDecoration,
  );

  const {
    almInstances,
    isLastPage,
    selectedAlmInstance,
    loading,
    loadingMore,
    repositories,
    resetPat,
    searching,
    searchQuery,
    showPersonalAccessTokenForm,
  } = props;

  return (
    <>
      <header className="sw-mb-10">
        <Heading as="h1" className="sw-mb-4">
          {translate('onboarding.create_project.bitbucketcloud.title')}
        </Heading>
        <Text>
          {isMonorepoSupported ? (
            <FormattedMessage
              id="onboarding.create_project.bitbucketcloud.subtitle.with_monorepo"
              values={{
                monorepoSetupLink: (
                  <Link
                    to={{
                      pathname: '/projects/create',
                      search: queryToSearchString({
                        mode: CreateProjectModes.BitbucketCloud,
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
            <FormattedMessage id="onboarding.create_project.bitbucketcloud.subtitle" />
          )}
        </Text>

        {selectedAlmInstance && !showPersonalAccessTokenForm && (
          <PersonalAccessTokenResetLink
            className="sw-mt-4"
            createProjectMode={CreateProjectModes.BitbucketCloud}
          />
        )}
      </header>

      <AlmSettingsInstanceDropdown
        almInstances={almInstances}
        almKey={AlmKeys.BitbucketCloud}
        onChangeConfig={props.onSelectedAlmInstanceChange}
        selectedAlmInstance={selectedAlmInstance}
      />

      <Spinner isLoading={loading} />

      {!loading && almInstances && almInstances.length === 0 && !selectedAlmInstance && (
        <WrongBindingCountAlert alm={AlmKeys.BitbucketCloud} />
      )}

      {!loading &&
        selectedAlmInstance &&
        (showPersonalAccessTokenForm ? (
          <BitbucketCloudPersonalAccessTokenForm
            almSetting={selectedAlmInstance}
            onPersonalAccessTokenCreated={props.onPersonalAccessTokenCreated}
            resetPat={resetPat}
          />
        ) : (
          <BitbucketCloudSearchForm
            isLastPage={isLastPage}
            loadingMore={loadingMore}
            onImport={props.onImport}
            onLoadMore={props.onLoadMore}
            onSearch={props.onSearch}
            repositories={repositories}
            searchQuery={searchQuery}
            searching={searching}
          />
        ))}
    </>
  );
}
