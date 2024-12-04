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

import { Link, LinkHighlight } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FlagMessage, InputSearch } from '~design-system';
import { queryToSearchString } from '~sonar-aligned/helpers/urls';
import { BitbucketRepository } from '../../../../types/alm-integration';
import { CreateProjectModes } from '../types';
import BitbucketRepositories from './BitbucketRepositories';

export interface BitbucketImportRepositoryFormProps {
  canFetchMore: boolean;
  hasProjects: boolean;
  onFetchMore: () => void;
  onImportRepository: (repo: BitbucketRepository) => void;
  onSearch: (query: '') => void;
  repositories: BitbucketRepository[];
  searching: boolean;
}

export default function BitbucketImportRepositoryForm(
  props: Readonly<BitbucketImportRepositoryFormProps>,
) {
  const {
    canFetchMore,
    hasProjects,
    onFetchMore,
    onImportRepository,
    onSearch,
    repositories,
    searching,
  } = props;

  const { formatMessage } = useIntl();

  if (!hasProjects) {
    return (
      <FlagMessage variant="warning">
        <span>
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
        </span>
      </FlagMessage>
    );
  }

  return (
    <div>
      <div className="sw-mb-10 sw-w-abs-800 sw-flex">
        <InputSearch
          onChange={onSearch}
          placeholder={formatMessage({
            id: 'onboarding.create_project.search_repositories_by_name',
          })}
          searchInputAriaLabel={formatMessage({
            id: 'onboarding.create_project.search_repositories_by_name',
          })}
          size="full"
        />
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
