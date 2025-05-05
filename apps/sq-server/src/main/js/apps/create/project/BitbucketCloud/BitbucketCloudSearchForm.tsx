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

import { Link, MessageCallout, MessageType, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { InputSearch } from '~design-system';
import ListFooter from '~sq-server-commons/components/controls/ListFooter';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { BitbucketCloudRepository } from '~sq-server-commons/types/alm-integration';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import AlmRepoItem from '../components/AlmRepoItem';
import { REPOSITORY_PAGE_SIZE } from '../constants';

export interface BitbucketCloudSearchFormProps {
  isLastPage: boolean;
  loadingMore: boolean;
  onImport: (repositorySlug: string) => void;
  onLoadMore: () => void;
  onSearch: (searchQuery: string) => void;
  repositories?: BitbucketCloudRepository[];
  searchQuery: string;
  searching: boolean;
}

function getRepositoryUrl(workspace: string, slug: string) {
  return `https://bitbucket.org/${workspace}/${slug}`;
}

export default function BitbucketCloudSearchForm(props: BitbucketCloudSearchFormProps) {
  const { isLastPage, loadingMore, repositories = [], searching, searchQuery } = props;

  if (repositories.length === 0 && searchQuery.length === 0 && !searching) {
    return (
      <MessageCallout
        text={
          <FormattedMessage
            id="onboarding.create_project.bitbucketcloud.no_projects"
            values={{
              link: (
                <Link
                  to={{
                    pathname: '/projects/create',
                    search: queryToSearchString({
                      mode: CreateProjectModes.BitbucketCloud,
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

  return (
    <div>
      <div className="sw-flex sw-items-center sw-mb-6 sw-w-abs-400">
        <InputSearch
          loading={searching}
          minLength={3}
          onChange={props.onSearch}
          placeholder={translate('onboarding.create_project.search_prompt')}
          size="full"
          value={searchQuery}
        />
      </div>

      {repositories.length === 0 ? (
        <div className="sw-py-6 sw-px-2">
          <Text className="sw-typo-default">{translate('no_results')}</Text>
        </div>
      ) : (
        <ul className="sw-flex sw-flex-col sw-gap-3">
          {repositories.map((r) => (
            <AlmRepoItem
              almIconSrc={`${getBaseUrl()}/images/alm/bitbucket.svg`}
              almKey={r.slug}
              almUrl={getRepositoryUrl(r.workspace, r.slug)}
              almUrlText={translate('onboarding.create_project.bitbucketcloud.link')}
              key={r.uuid}
              onImport={props.onImport}
              primaryTextNode={<span title={r.name}>{r.name}</span>}
              secondaryTextNode={<span title={r.projectKey}>{r.projectKey}</span>}
              sqProjectKey={r.sqProjectKey}
            />
          ))}
        </ul>
      )}

      <ListFooter
        className="sw-mb-10"
        count={repositories.length}
        loadMore={props.onLoadMore}
        loading={loadingMore}
        pageSize={REPOSITORY_PAGE_SIZE}
        // we don't know the total, so only provide when we've reached the last page
        total={isLastPage ? repositories.length : undefined}
      />
    </div>
  );
}
