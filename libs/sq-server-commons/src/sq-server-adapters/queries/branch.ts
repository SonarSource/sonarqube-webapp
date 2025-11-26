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

import { queryOptions, useQuery } from '@tanstack/react-query';
import { flatten } from 'lodash';
import { useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { isBranch, isPullRequest } from '~shared/helpers/branch-like';
import { isPortfolioLike, isProject } from '~shared/helpers/component';
import { isDefined } from '~shared/helpers/types';
import { StaleTime } from '~shared/queries/common';
import { LightComponent } from '~shared/types/component';
import { getBranches, getPullRequests } from '../../api/branches';
import { AvailableFeaturesContext } from '../../context/available-features/AvailableFeaturesContext';
import { BranchLike } from '../../types/branch-like';
import { Feature } from '../../types/features';

function branchesQuery(
  component: Pick<LightComponent, 'key' | 'qualifier'> | undefined,
  branchSupportFeatureEnabled: boolean,
) {
  return queryOptions({
    // we don't care about branchSupportFeatureEnabled in the key, as it never changes during a user session
    queryKey: ['branches', 'list', component?.key],
    queryFn: async ({ queryKey: [, , key] }) => {
      if (component === undefined || key === undefined || isPortfolioLike(component.qualifier)) {
        return [] as BranchLike[];
      }

      // Pull Requests exist only for projects and if [branch-support] is enabled
      const branchLikesPromise =
        isProject(component.qualifier) && branchSupportFeatureEnabled
          ? [getBranches(key), getPullRequests(key)]
          : [getBranches(key)];
      const branchLikes = await Promise.all(branchLikesPromise).then(flatten<BranchLike>);

      return branchLikes;
    },
    enabled: isDefined(component),
    staleTime: StaleTime.SHORT,
  });
}

export function useProjectBranchesQuery(
  component: Pick<LightComponent, 'key' | 'qualifier'> | undefined,
) {
  const features = useContext(AvailableFeaturesContext);

  return useQuery(branchesQuery(component, features.includes(Feature.BranchSupport)));
}

export function useCurrentBranchQuery(
  component: LightComponent | undefined,
  staleTime = StaleTime.LIVE,
) {
  const features = useContext(AvailableFeaturesContext);
  const { search } = useLocation();

  const select = useCallback(
    (branchLikes: BranchLike[]) => {
      const searchParams = new URLSearchParams(search);
      if (searchParams.has('branch')) {
        return branchLikes.find((b) => isBranch(b) && b.name === searchParams.get('branch'));
      } else if (searchParams.has('pullRequest')) {
        return branchLikes.find(
          (b) => isPullRequest(b) && b.key === searchParams.get('pullRequest'),
        );
      } else if (searchParams.has('fixedInPullRequest')) {
        const targetBranch = branchLikes
          .filter(isPullRequest)
          .find((b) => b.key === searchParams.get('fixedInPullRequest'))?.target;
        return branchLikes.find((b) => isBranch(b) && b.name === targetBranch);
      }

      return branchLikes.find((b) => isBranch(b) && b.isMain);
    },
    [search],
  );

  return useQuery({
    ...branchesQuery(component, features.includes(Feature.BranchSupport)),
    select,
    staleTime,
  });
}
