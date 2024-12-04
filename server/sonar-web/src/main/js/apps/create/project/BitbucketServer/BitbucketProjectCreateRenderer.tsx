/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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

import { Heading, Link, LinkHighlight, Spinner, Text } from '@sonarsource/echoes-react';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PageContentFontWrapper } from '~design-system';
import { queryToSearchString } from '~sonar-aligned/helpers/urls';
import { AvailableFeaturesContext } from '../../../../app/components/available-features/AvailableFeaturesContext';
import { BitbucketRepository } from '../../../../types/alm-integration';
import { AlmKeys, AlmSettingsInstance } from '../../../../types/alm-settings';
import { Feature } from '../../../../types/features';
import AlmSettingsInstanceDropdown from '../components/AlmSettingsInstanceDropdown';
import WrongBindingCountAlert from '../components/WrongBindingCountAlert';
import { CreateProjectModes } from '../types';
import BitbucketImportRepositoryForm from './BitbucketImportRepositoryForm';
import BitbucketServerPersonalAccessTokenForm from './BitbucketServerPersonalAccessTokenForm';

export interface BitbucketProjectCreateRendererProps {
  almInstances: AlmSettingsInstance[];
  canFetchMore: boolean;
  hasProjects: boolean;
  isLoading: boolean;
  onFetchMore: () => void;
  onImportRepository: (repository: BitbucketRepository) => void;
  onPersonalAccessTokenCreated: () => void;
  onSearch: (query: string) => void;
  onSelectedAlmInstanceChange: (instance: AlmSettingsInstance) => void;
  repositories: BitbucketRepository[];
  resetPat: boolean;
  searching: boolean;
  selectedAlmInstance?: AlmSettingsInstance;
  showPersonalAccessTokenForm?: boolean;
}

export default function BitbucketProjectCreateRenderer(
  props: Readonly<BitbucketProjectCreateRendererProps>,
) {
  const {
    almInstances,
    canFetchMore,
    hasProjects,
    isLoading,
    onFetchMore,
    onImportRepository,
    onSearch,
    onSelectedAlmInstanceChange,
    onPersonalAccessTokenCreated,
    repositories,
    resetPat,
    searching,
    selectedAlmInstance,
    showPersonalAccessTokenForm,
  } = props;

  const isMonorepoSupported = React.useContext(AvailableFeaturesContext).includes(
    Feature.MonoRepositoryPullRequestDecoration,
  );

  return (
    <PageContentFontWrapper>
      <header className="sw-mb-10">
        <Heading as="h1" className="sw-mb-4">
          <FormattedMessage id="onboarding.create_project.bitbucket.title" />
        </Heading>
        <Text>
          {isMonorepoSupported ? (
            <FormattedMessage
              id="onboarding.create_project.bitbucket.subtitle.with_monorepo"
              values={{
                monorepoSetupLink: (
                  <Link
                    highlight={LinkHighlight.Default}
                    to={{
                      pathname: '/projects/create',
                      search: queryToSearchString({
                        mode: CreateProjectModes.BitbucketServer,
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
            <FormattedMessage id="onboarding.create_project.bitbucket.subtitle" />
          )}
        </Text>
      </header>

      <AlmSettingsInstanceDropdown
        almKey={AlmKeys.BitbucketServer}
        almInstances={almInstances}
        selectedAlmInstance={selectedAlmInstance}
        onChangeConfig={onSelectedAlmInstanceChange}
      />

      <Spinner isLoading={isLoading}>
        {!isLoading && almInstances && almInstances.length === 0 && !selectedAlmInstance && (
          <WrongBindingCountAlert alm={AlmKeys.BitbucketServer} />
        )}

        {!isLoading &&
          selectedAlmInstance &&
          (showPersonalAccessTokenForm ? (
            <BitbucketServerPersonalAccessTokenForm
              almSetting={selectedAlmInstance}
              onPersonalAccessTokenCreated={onPersonalAccessTokenCreated}
              resetPat={resetPat}
            />
          ) : (
            <BitbucketImportRepositoryForm
              canFetchMore={canFetchMore}
              hasProjects={hasProjects}
              onFetchMore={onFetchMore}
              onSearch={onSearch}
              repositories={repositories}
              searching={searching}
              onImportRepository={onImportRepository}
            />
          ))}
      </Spinner>
    </PageContentFontWrapper>
  );
}
