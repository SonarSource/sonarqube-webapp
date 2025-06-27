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
  Label,
  Link,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  Select,
} from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { InputSearch } from '~design-system';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { BitbucketRepository } from '~sq-server-commons/types/alm-integration';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { BBSSearchMode } from '../constants';
import BitbucketRepositories from './BitbucketRepositories';

export interface BitbucketImportRepositoryFormProps {
  canFetchMore: boolean;
  hasProjects: boolean;
  onChangeSearchMode: (searchMode: BBSSearchMode) => void;
  onFetchMore: () => void;
  onImportRepository: (repo: BitbucketRepository) => void;
  onSearch: (query: '') => void;
  repositories: BitbucketRepository[];
  searchMode: BBSSearchMode;
  searching: boolean;
}

export default function BitbucketImportRepositoryForm(
  props: Readonly<BitbucketImportRepositoryFormProps>,
) {
  const {
    canFetchMore,
    hasProjects,
    onChangeSearchMode,
    onFetchMore,
    onImportRepository,
    onSearch,
    repositories,
    searching,
    searchMode,
  } = props;

  const { formatMessage } = useIntl();

  const searchModeOptions = useMemo(
    () => [
      {
        label: formatMessage({ id: 'onboarding.create_project.search_mode.project' }),
        value: BBSSearchMode.Project,
      },
      {
        label: formatMessage({ id: 'onboarding.create_project.search_mode.repository' }),
        value: BBSSearchMode.Repository,
      },
    ],
    [formatMessage],
  );
  const searchInputPlaceholder = useMemo(() => {
    switch (searchMode) {
      case BBSSearchMode.Project:
        return formatMessage({ id: 'onboarding.create_project.search_projects_by_name' });
      case BBSSearchMode.Repository:
        return formatMessage({ id: 'onboarding.create_project.search_repositories_by_name' });
      default:
        return '';
    }
  }, [formatMessage, searchMode]);

  if (!hasProjects) {
    return (
      <MessageCallout variety={MessageVariety.Warning}>
        <FormattedMessage
          id="onboarding.create_project.no_bbs_projects"
          values={{
            link: (
              <Link
                highlight={LinkHighlight.Default}
                to={{
                  pathname: '/projects/create',
                  search: queryToSearchString({
                    mode: CreateProjectModes.BitbucketServer,
                    resetPat: 1,
                  }),
                }}
              >
                <FormattedMessage id="onboarding.create_project.update_your_token" />
              </Link>
            ),
          }}
        />
      </MessageCallout>
    );
  }

  return (
    <div>
      <div className="sw-mb-10 sw-w-abs-800 sw-flex">
        <div className="sw-flex-1">
          <InputSearch
            onChange={onSearch}
            placeholder={formatMessage({
              id: searchInputPlaceholder,
            })}
            searchInputAriaLabel={formatMessage({
              id: searchInputPlaceholder,
            })}
            size="full"
          />
        </div>
        <div className="sw-ml-4 sw-flex-1 sw-flex sw-items-center">
          <Label className="sw-mr-2" htmlFor="aria-bbs-search-mode" id="aria-bbs-search-mode">
            <FormattedMessage id="onboarding.create_project.search_mode" />
          </Label>
          <Select
            ariaLabelledBy="aria-bbs-search-mode"
            data={searchModeOptions}
            hasDropdownAutoWidth
            isNotClearable
            onChange={onChangeSearchMode}
            value={searchMode}
            width="small"
          />
        </div>
      </div>

      <BitbucketRepositories
        canFetchMore={canFetchMore}
        isLoading={searching}
        onFetchMore={onFetchMore}
        onImportRepository={onImportRepository}
        repositories={repositories}
      />
    </div>
  );
}
