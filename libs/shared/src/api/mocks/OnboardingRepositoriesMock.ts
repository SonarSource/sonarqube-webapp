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
  OnboardingAlm,
  OnboardingDevopsPlatform,
  OnboardingRepositoriesQuery,
  OnboardingRepositoriesResponse,
  OnboardingRepositoriesVisibility,
  OnboardingRepository,
} from '../../types/onboarding';

export function mockOnboardingRepositories(): OnboardingRepository[] {
  return [
    {
      alm: OnboardingDevopsPlatform.Github as OnboardingAlm,
      id: 'platform-jobs-id',
      isImported: false,
      isPrivate: false,
      name: 'platform-jobs',
    },
    {
      alm: OnboardingDevopsPlatform.Github as OnboardingAlm,
      id: 'payments-gateway-id',
      isImported: true,
      isPrivate: true,
      name: 'payments-gateway',
    },
    {
      alm: OnboardingDevopsPlatform.Gitlab as OnboardingAlm,
      id: 'web-core-id',
      isImported: true,
      isPrivate: false,
      name: 'web-core',
    },
    {
      alm: OnboardingDevopsPlatform.Bitbucket as OnboardingAlm,
      id: 'identity-lib-id',
      isImported: true,
      isPrivate: true,
      name: 'identity-lib',
    },
    {
      alm: OnboardingDevopsPlatform.AzureDevops as OnboardingAlm,
      id: 'mobile-worker-id',
      isImported: true,
      isPrivate: false,
      name: 'mobile-worker',
    },
  ];
}

export class OnboardingRepositoriesMock {
  repositories: OnboardingRepository[] = mockOnboardingRepositories();
  overridePageSize?: number;

  applyQuery(params: OnboardingRepositoriesQuery): OnboardingRepositoriesResponse {
    const q = (params.q ?? '').trim().toLowerCase();
    const visibility = params.visibility ?? OnboardingRepositoriesVisibility.All;

    const filtered = this.repositories
      .filter((repo) => q === '' || repo.name.toLowerCase().includes(q))
      .filter((repo) => {
        if (visibility === OnboardingRepositoriesVisibility.Private) {
          return repo.isPrivate;
        }
        if (visibility === OnboardingRepositoriesVisibility.Public) {
          return !repo.isPrivate;
        }
        return true;
      });

    const pageSize = this.overridePageSize ?? params.pageSize ?? 10;
    const pageIndex = params.pageIndex ?? 1;
    const start = (pageIndex - 1) * pageSize;
    const repositories = pageSize <= 0 ? [] : filtered.slice(start, start + pageSize);

    return {
      page: { pageIndex, pageSize, total: filtered.length },
      repositories,
    };
  }

  reset() {
    this.repositories = mockOnboardingRepositories();
    this.overridePageSize = undefined;
  }
}
