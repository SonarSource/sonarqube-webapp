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
import { Path } from 'react-router';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import {
  onboardingOrganizationsQueryOptions,
  onboardingStatisticsQueryOptions,
} from '~shared/queries/onboarding';
import {
  DEFAULT_ORGANIZATIONS_DIRECTION,
  DEFAULT_ORGANIZATIONS_SORT,
  ORGANIZATIONS_PAGE_SIZE,
} from './enterpriseConstants';
import { OrganizationAccess } from './OrganizationAccessContext';

const EnterpriseOnboardingDashboardApp = lazyLoadComponent(
  () => import('./EnterpriseOnboardingDashboardApp'),
);

interface Props {
  addOrganizationUrl: Partial<Path>;
  createOrganizationUrl?: Partial<Path>;
  enterpriseId: string;
  getBindingUrl: (organizationKey: string) => Partial<Path>;
  getDashboardUrl: (organizationKey: string) => Partial<Path>;
  getOrganizationAccess?: (organizationKey: string) => OrganizationAccess;
}

/**
 * Code-split enterprise dashboard body (cf. LazyOnboardingDashboardApp); prefetches the statistics
 * and the first organizations page while the chunk loads.
 */
export function LazyEnterpriseOnboardingDashboardApp(props: Readonly<Props>) {
  const { enterpriseId } = props;

  usePrefetchQuery(onboardingStatisticsQueryOptions({ enterpriseId }));
  usePrefetchQuery(
    onboardingOrganizationsQueryOptions({
      direction: DEFAULT_ORGANIZATIONS_DIRECTION,
      enterpriseId,
      pageIndex: 1,
      pageSize: ORGANIZATIONS_PAGE_SIZE,
      sort: DEFAULT_ORGANIZATIONS_SORT,
    }),
  );

  return <EnterpriseOnboardingDashboardApp {...props} />;
}
