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

/* eslint-disable react/no-unused-prop-types */
import {
  FormFieldWidth,
  Heading,
  Link,
  MessageCallout,
  MessageVariety,
  Select,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { GithubOrganization, GithubRepository } from '~sq-server-commons/types/alm-integration';
import { AlmKeys, AlmSettingsInstance } from '~sq-server-commons/types/alm-settings';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { Feature } from '~sq-server-commons/types/features';
import { Paging } from '~sq-server-commons/types/types';
import AlmSettingsInstanceDropdown from '../components/AlmSettingsInstanceDropdown';
import RepositoryList from '../components/RepositoryList';

interface GitHubProjectCreateRendererProps {
  almInstances: AlmSettingsInstance[];
  error: boolean;
  loadingBindings: boolean;
  loadingOrganizations: boolean;
  loadingRepositories: boolean;
  onImportRepository: (key: string[]) => void;
  onLoadMore: () => void;
  onSearch: (q: string) => void;
  onSelectOrganization: (key: string) => void;
  onSelectedAlmInstanceChange: (instance: AlmSettingsInstance) => void;
  organizations?: GithubOrganization[];
  repositories?: GithubRepository[];
  repositoryPaging: Paging;
  searchQuery: string;
  selectedAlmInstance?: AlmSettingsInstance;
  selectedOrganization?: GithubOrganization;
}

function orgToOption({ key, name }: GithubOrganization) {
  return { value: key, label: name };
}

export default function GitHubProjectCreateRenderer(
  props: Readonly<GitHubProjectCreateRendererProps>,
) {
  const isMonorepoSupported = useContext(AvailableFeaturesContext).includes(
    Feature.MonoRepositoryPullRequestDecoration,
  );

  const {
    error,
    loadingBindings,
    loadingOrganizations,
    organizations,
    selectedOrganization,
    almInstances,
    selectedAlmInstance,
    repositories,
  } = props;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { canAdmin } = useAppState();

  useEffect(() => {
    const selectedKeys = Array.from(selected).filter((key) =>
      repositories?.find((r) => r.key === key),
    );
    setSelected(new Set(selectedKeys));
    // We want to update only when `repositories` changes.
    // If we subscribe to `selected` changes we will enter an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositories]);

  if (loadingBindings) {
    return <Spinner />;
  }

  const handleCheck = (key: string) => {
    setSelected((prev) => new Set(prev.delete(key) ? prev : prev.add(key)));
  };

  const handleCheckAll = () => {
    setSelected(
      new Set(repositories?.filter((r) => r.sqProjectKey === undefined).map((r) => r.key) ?? []),
    );
  };

  const handleImport = () => {
    props.onImportRepository(Array.from(selected));
  };

  const handleUncheckAll = () => {
    setSelected(new Set());
  };

  return (
    <>
      <header className="sw-mb-10">
        <Heading as="h1" className="sw-mb-4">
          {translate('onboarding.create_project.github.title')}
        </Heading>
        <Text>
          {isMonorepoSupported ? (
            <FormattedMessage
              id="onboarding.create_project.github.subtitle.with_monorepo"
              values={{
                monorepoSetupLink: (
                  <Link
                    to={{
                      pathname: '/projects/create',
                      search: queryToSearchString({
                        mode: CreateProjectModes.GitHub,
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
            <FormattedMessage id="onboarding.create_project.github.subtitle" />
          )}
        </Text>
      </header>

      <AlmSettingsInstanceDropdown
        almInstances={almInstances}
        almKey={AlmKeys.GitHub}
        onChangeConfig={props.onSelectedAlmInstanceChange}
        selectedAlmInstance={selectedAlmInstance}
      />

      {error && selectedAlmInstance && (
        <MessageCallout
          className="sw-my-2"
          text={
            <span>
              {canAdmin ? (
                <FormattedMessage
                  id="onboarding.create_project.github.warning.message_admin"
                  values={{
                    link: (
                      <Link to="/admin/settings?category=almintegration">
                        {translate('onboarding.create_project.github.warning.message_admin.link')}
                      </Link>
                    ),
                  }}
                />
              ) : (
                translate('onboarding.create_project.github.warning.message')
              )}
            </span>
          }
          variety={MessageVariety.Warning}
        />
      )}

      <Spinner isLoading={loadingOrganizations && !error}>
        {!error && (
          <div className="sw-flex sw-flex-col">
            {organizations && organizations.length > 0 ? (
              <Select
                data={organizations.map(orgToOption)}
                id="github-choose-organization"
                isSearchable
                label={translate('onboarding.create_project.github.choose_organization')}
                onChange={(value: string) => {
                  props.onSelectOrganization(value);
                }}
                value={selectedOrganization ? orgToOption(selectedOrganization).value : null}
                width={FormFieldWidth.Large}
              />
            ) : (
              !loadingOrganizations && (
                <MessageCallout
                  className="sw-mb-2"
                  text={
                    <span>
                      {canAdmin ? (
                        <FormattedMessage
                          id="onboarding.create_project.github.no_orgs_admin"
                          values={{
                            link: (
                              <Link to="/admin/settings?category=almintegration">
                                {translate(
                                  'onboarding.create_project.github.warning.message_admin.link',
                                )}
                              </Link>
                            ),
                          }}
                        />
                      ) : (
                        translate('onboarding.create_project.github.no_orgs')
                      )}
                    </span>
                  }
                  variety={MessageVariety.Danger}
                />
              )
            )}
          </div>
        )}
        {selectedOrganization && (
          <RepositoryList
            {...props}
            almKey={AlmKeys.GitHub}
            checkAll={handleCheckAll}
            onCheck={handleCheck}
            onImport={handleImport}
            selected={selected}
            uncheckAll={handleUncheckAll}
          />
        )}
      </Spinner>
    </>
  );
}
