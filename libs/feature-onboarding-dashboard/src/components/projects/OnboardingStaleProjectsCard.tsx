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
  Card,
  SearchInput,
  SearchInputWidth,
  Spinner,
  Table,
  TableVariety,
  Text,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { useOnboardingOrganizationKey } from '~adapters/queries/onboarding';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { isDefined } from '~shared/helpers/types';
import { useDebouncedValue } from '~shared/helpers/useDebouncedValue';
import { useOnboardingProjectsQuery } from '~shared/queries/onboarding';
import { NO_DATA } from '../dashboardConstants';
import { GateStatusBadge } from './GateStatusBadge';
import { RepositoryCell } from './RepositoryCell';

// The API has no dedicated "stale" filter, so fetch a large page. Orgs with more stale
// projects than this cap will see the actual total in the count, plus an explicit note.
const STALE_PAGE_SIZE = 500;

export function OnboardingStaleProjectsCard() {
  const { formatMessage } = useIntl();
  const [searchValue, query, handleSearch] = useDebouncedValue();
  const organizationKey = useOnboardingOrganizationKey();

  const { data, isLoading } = useOnboardingProjectsQuery({
    organizationKey,
    pageSize: STALE_PAGE_SIZE,
    q: query === '' ? undefined : query,
    filter: 'stale',
  });

  const staleProjects = data?.projects ?? [];
  const total = data?.page.total ?? 0;
  const isCapped = total > staleProjects.length;

  const title = formatMessage({ id: 'onboarding_dashboard.stale.title' });

  return (
    <Card className="sw-min-w-0">
      <Card.Header
        description={formatMessage({ id: 'onboarding_dashboard.stale.description' })}
        title={title}
      />
      <Spinner isLoading={isLoading}>
        <Card.Body className="sw-min-h-[20rem]">
          <div className="sw-flex sw-flex-col sw-items-start sw-justify-start sw-gap-4">
            <div className="sw-w-full sw-flex sw-items-center sw-gap-2 sw-justify-between">
              <SearchInput
                onChange={handleSearch}
                placeholderLabel={formatMessage({ id: 'onboarding_dashboard.stale.search' })}
                value={searchValue}
                width={SearchInputWidth.Medium}
              />

              <div className="sw-flex sw-flex-col sw-items-end">
                <Text as="span" className="sw-text-sm sw-text-gray-500">
                  {formatMessage(
                    { id: 'onboarding_dashboard.projects.count' },
                    {
                      count: total,
                      b: (count) => <Text isHighlighted>{count}</Text>,
                    },
                  )}
                </Text>
                {isCapped && (
                  <Text as="span" isSubtle size="small">
                    {formatMessage(
                      { id: 'onboarding_dashboard.stale.capped' },
                      { count: staleProjects.length },
                    )}
                  </Text>
                )}
              </div>
            </div>

            {staleProjects.length > 0 && (
              <div className="sw-max-h-[320px] sw-overflow-y-auto">
                <Table
                  ariaLabel={title}
                  gridTemplate="minmax(220px, 2fr) 1fr 1fr"
                  variety={TableVariety.Surface}
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell
                        label={formatMessage({ id: 'onboarding_dashboard.stale.col.repository' })}
                      />
                      <Table.ColumnHeaderCell
                        label={formatMessage({ id: 'onboarding_dashboard.stale.col.gate_status' })}
                      />
                      <Table.ColumnHeaderCell
                        label={formatMessage({ id: 'onboarding_dashboard.stale.col.last_scan' })}
                      />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {staleProjects.map((project) => (
                      <Table.Row key={project.key ?? project.name}>
                        <Table.Cell>
                          <RepositoryCell project={project} />
                        </Table.Cell>
                        <Table.Cell>
                          <GateStatusBadge status={project.gateStatus} />
                        </Table.Cell>
                        <Table.Cell>
                          {isDefined(project.lastScan) ? (
                            <DateFromNow date={project.lastScan} />
                          ) : (
                            NO_DATA
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>
        </Card.Body>
      </Spinner>
    </Card>
  );
}
