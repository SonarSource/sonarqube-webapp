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

import { Card, MessageCallout } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Path } from 'react-router';
import { useOnboardingOrganizationsQuery } from '~shared/queries/onboarding';
import { OnboardingOrganizationSort, OnboardingSortDirection } from '~shared/types/onboarding';
import { OnboardingDashboardFilter } from '~shared/types/onboarding-dashboard-telemetry';
import { usePaginatedTableState } from '../projects/usePaginatedTableState';
import { useOnboardingDashboardTracking } from '../telemetry/OnboardingDashboardTelemetry';
import {
  DEFAULT_ORGANIZATIONS_DIRECTION,
  DEFAULT_ORGANIZATIONS_SORT,
  ORGANIZATIONS_PAGE_SIZE,
  ORGANIZATIONS_SECTION_ID,
} from './enterpriseConstants';
import { OrganizationsCoverageTable } from './OrganizationsCoverageTable';

interface Props {
  enterpriseId: string;
  getBindingUrl: (organizationKey: string) => Partial<Path>;
  getDashboardUrl: (organizationKey: string) => Partial<Path>;
}

/**
 * Card around {@link OrganizationsCoverageTable}; owns its search, sort and page and fetches them
 * server-side.
 */
export function OrganizationsCoverageCard({
  enterpriseId,
  getBindingUrl,
  getDashboardUrl,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { trackActionSelected, trackFilterChanged } = useOnboardingDashboardTracking();
  const [sort, setSort] = useState(DEFAULT_ORGANIZATIONS_SORT);
  const [direction, setDirection] = useState(DEFAULT_ORGANIZATIONS_DIRECTION);
  const { onPageChange, onSearchChange, pageIndex, query, searchValue } = usePaginatedTableState(
    `${sort}:${direction}`,
  );

  const { data, isError, isLoading } = useOnboardingOrganizationsQuery({
    direction,
    enterpriseId,
    pageIndex,
    pageSize: ORGANIZATIONS_PAGE_SIZE,
    q: query === '' ? undefined : query,
    sort,
  });

  const handleSortChange = (nextSort: OnboardingOrganizationSort) => {
    trackFilterChanged(OnboardingDashboardFilter.OrganizationSort, nextSort);
    setSort(nextSort);
  };

  const handleDirectionChange = (nextDirection: OnboardingSortDirection) => {
    trackFilterChanged(OnboardingDashboardFilter.OrganizationSortDirection, nextDirection);
    setDirection(nextDirection);
  };

  return (
    <div className="sw:scroll-mt-6" id={ORGANIZATIONS_SECTION_ID}>
      <Card>
        <Card.Header
          description={formatMessage({
            id: 'onboarding_dashboard.enterprise.organizations.description',
          })}
          title={formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.title' })}
        />
        <Card.Body>
          {isError ? (
            <MessageCallout variety="danger">
              <FormattedMessage id="default_error_message" />
            </MessageCallout>
          ) : (
            <OrganizationsCoverageTable
              direction={direction}
              getBindingUrl={getBindingUrl}
              getDashboardUrl={getDashboardUrl}
              isLoading={isLoading}
              onAction={trackActionSelected}
              onDirectionChange={handleDirectionChange}
              onPageChange={onPageChange}
              onSearchChange={onSearchChange}
              onSortChange={handleSortChange}
              organizations={data?.organizations ?? []}
              pageIndex={pageIndex}
              pageSize={ORGANIZATIONS_PAGE_SIZE}
              searchValue={searchValue}
              sort={sort}
              total={data?.page.total}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
