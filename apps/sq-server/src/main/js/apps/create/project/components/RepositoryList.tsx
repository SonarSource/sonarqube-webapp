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

import {
  Button,
  ButtonSize,
  ButtonVariety,
  Checkbox,
  Divider,
  Pagination,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAlmIconSrc } from '~adapters/helpers/almIcons';
import { InputSearch } from '~design-system';
import { Paging } from '~shared/types/paging';
import { GithubRepository, GitlabProject } from '~sq-server-commons/types/alm-integration';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import AlmRepoItem from '../components/AlmRepoItem';
import { ScrollableRepositoryBox } from './ScrollableRepositoryBox';

interface RepositoryListProps {
  almKey: AlmKeys.GitHub | AlmKeys.GitLab;
  checkAll: () => void;
  loadingRepositories: boolean;
  onCheck: (key: string) => void;
  onImport: () => void;
  onPageChange: (pageIndex: number) => void;
  onSearch: (query: string) => void;
  repositories?: GithubRepository[] | GitlabProject[];
  repositoryPaging: Paging;
  searchQuery: string;
  selected: Set<string>;
  uncheckAll: () => void;
}

export default function RepositoryList(props: Readonly<RepositoryListProps>) {
  const {
    almKey,
    checkAll,
    loadingRepositories,
    onCheck,
    onImport,
    onPageChange,
    onSearch,
    repositories,
    repositoryPaging,
    searchQuery,
    selected,
    uncheckAll,
  } = props;

  const { formatMessage } = useIntl();

  const areAllRepositoriesChecked = useMemo(() => {
    const nonImportedRepos = repositories?.filter((r) => r.sqProjectKey === undefined) ?? [];
    return nonImportedRepos.length > 0 && selected.size === nonImportedRepos.length;
  }, [repositories, selected.size]);

  const totalPages = Math.ceil(repositoryPaging.total / repositoryPaging.pageSize);

  const onCheckAllRepositories = useCallback(() => {
    if (areAllRepositoriesChecked) {
      uncheckAll();
    } else {
      checkAll();
    }
  }, [areAllRepositoriesChecked, checkAll, uncheckAll]);

  const iconUrl = useAlmIconSrc(almKey);

  if (!repositories) {
    return null;
  }

  return (
    <div className="sw:mt-6">
      <div className="sw:mb-4 sw:flex sw:items-center sw:justify-between sw:gap-4 sw:w-full">
        <Checkbox
          checked={areAllRepositoriesChecked}
          isDisabled={repositories.length === 0}
          label={formatMessage({ id: 'onboarding.create_project.select_all_repositories' })}
          onCheck={onCheckAllRepositories}
        />
        <InputSearch
          loading={loadingRepositories}
          onChange={onSearch}
          placeholder={formatMessage({ id: 'onboarding.create_project.search_repositories' })}
          size="medium"
          value={searchQuery}
        />
      </div>

      <div className="sw:relative">
        <ScrollableRepositoryBox isBusy={loadingRepositories} key={repositoryPaging.pageIndex}>
          {repositories.length === 0 ? (
            <div className="sw:py-6">
              <Text isHighlighted>{formatMessage({ id: 'no_results' })}</Text>
            </div>
          ) : (
            <ul className="sw:flex sw:flex-col">
              {repositories.map(({ id, name, sqProjectKey, url, ...repo }) => (
                <AlmRepoItem
                  almIconSrc={iconUrl}
                  almKey={almKey === AlmKeys.GitHub ? (repo as GithubRepository).key : id}
                  almUrl={url}
                  almUrlText={formatMessage(
                    { id: 'onboarding.create_project.see_on' },
                    { almName: formatMessage({ id: `alm.${almKey}` }) },
                  )}
                  hasBorder={false}
                  key={id}
                  multiple
                  onCheck={(key: string) => {
                    onCheck(key);
                  }}
                  primaryTextNode={<span title={name}>{name}</span>}
                  selected={selected.has(
                    almKey === AlmKeys.GitHub ? (repo as GithubRepository).key : id,
                  )}
                  sqProjectKey={sqProjectKey}
                />
              ))}
            </ul>
          )}
        </ScrollableRepositoryBox>
        {loadingRepositories && (
          <div className="sw:absolute sw:inset-0 sw:flex sw:items-center sw:justify-center">
            <Spinner isLoading />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="sw:flex sw:justify-center sw:my-4">
          <Pagination
            isDisabled={loadingRepositories}
            onChange={onPageChange}
            page={repositoryPaging.pageIndex}
            totalPages={totalPages}
          />
        </div>
      )}

      <div className="sw:mx-[-1.5rem]">
        <Divider />
      </div>

      <div className="sw:mt-4 sw:flex sw:items-center sw:gap-4">
        <Button
          className="js-set-up-projects"
          isDisabled={selected.size === 0}
          onClick={onImport}
          size={ButtonSize.Large}
          variety={ButtonVariety.Primary}
        >
          {formatMessage({ id: 'onboarding.create_project.import' })}
        </Button>

        {selected.size > 0 && (
          <Text isSubtle>
            <FormattedMessage
              id="onboarding.create_project.x_repositories_selected"
              values={{ count: selected.size }}
            />
          </Text>
        )}
      </div>
    </div>
  );
}
