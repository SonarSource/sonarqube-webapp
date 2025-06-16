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

import { Spinner } from '@sonarsource/echoes-react';
import ListFooter from '~shared/components/controls/ListFooter';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { BitbucketRepository } from '~sq-server-commons/types/alm-integration';
import AlmRepoItem from '../components/AlmRepoItem';

export interface BitbucketRepositoriesProps {
  canFetchMore: boolean;
  isLoading: boolean;
  onFetchMore: () => void;
  onImportRepository: (repo: BitbucketRepository) => void;
  repositories: BitbucketRepository[];
}

export default function BitbucketRepositories(props: Readonly<BitbucketRepositoriesProps>) {
  const { canFetchMore, isLoading, onFetchMore, onImportRepository, repositories } = props;

  return (
    <Spinner isLoading={isLoading && repositories.length === 0}>
      <ul className="sw-flex sw-flex-col sw-gap-3">
        {repositories.map((r) => (
          <AlmRepoItem
            almIconSrc={`${getBaseUrl()}/images/alm/bitbucket.svg`}
            almKey={r.name}
            key={r.id}
            onImport={() => {
              onImportRepository(r);
            }}
            primaryTextNode={<span>{r.name}</span>}
            secondaryTextNode={<span>{r.projectName}</span>}
            sqProjectKey={r.sqProjectKey}
          />
        ))}
      </ul>

      <ListFooter
        canFetchMore={canFetchMore}
        className="sw-mb-12"
        count={repositories.length}
        loadMore={onFetchMore}
      />
    </Spinner>
  );
}
