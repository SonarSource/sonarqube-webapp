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

import { usePrefetchQuery } from '@tanstack/react-query';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import {
  onboardingProjectsQueryOptions,
  onboardingStatisticsQueryOptions,
} from '~shared/queries/onboarding';
import { ALL_PROJECTS_PAGE_SIZE } from './dashboardConstants';

const OnboardingDashboardApp = lazyLoadComponent(() => import('./OnboardingDashboardApp'));

interface Props {
  organizationKey?: string;
}

/**
 * The dashboard body, code-split out of the product bundles.
 *
 * The dynamic import lives here rather than in each product's page so that it stays relative to
 * this library: SonarQube Cloud also imports this library statically (the `ImportRepositoriesCta`
 * adapter), and `@nx/enforce-module-boundaries` forbids a project from importing the same library
 * both ways. Keeping the split inside the library gives both products the same chunk boundary
 * without that conflict.
 *
 * The statistics and the first page of the "All projects" table are requested here, while the
 * chunk downloads, rather than once the body has mounted. The overview is already requested by
 * each product's page.
 */
export function LazyOnboardingDashboardApp({ organizationKey }: Readonly<Props>) {
  usePrefetchQuery(onboardingStatisticsQueryOptions({ organizationKey }));
  usePrefetchQuery(
    onboardingProjectsQueryOptions({
      organizationKey,
      pageIndex: 1,
      pageSize: ALL_PROJECTS_PAGE_SIZE,
    }),
  );

  return <OnboardingDashboardApp organizationKey={organizationKey} />;
}
