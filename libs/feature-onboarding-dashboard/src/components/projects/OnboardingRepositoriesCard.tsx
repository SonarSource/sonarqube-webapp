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
  Badge,
  Button,
  ButtonGroup,
  ButtonVariety,
  Card,
  LoadingContainer,
  Pagination,
  SearchInput,
  SearchInputWidth,
  Table,
  TableVariety,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useOnboardingOrganizationKey } from '~adapters/queries/onboarding';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { isDefined } from '~shared/helpers/types';
import { useDebouncedValue } from '~shared/helpers/useDebouncedValue';
import { useOnboardingProjectsQuery } from '~shared/queries/onboarding';
import { OnboardingProjectOnboarding, OnboardingProjectsFilter } from '~shared/types/onboarding';
import { NO_DATA } from '../dashboardConstants';
import { GateStatusBadge } from './GateStatusBadge';
import { getAnalysisModeBadge, getOnboardingBadge } from './projectBadges';
import { PROJECT_FILTERS } from './projectFilters';
import { ProjectsTableRowsSkeleton } from './ProjectsTableRowsSkeleton';
import { RepositoryCell } from './RepositoryCell';

const PAGE_SIZE = 50;

export function OnboardingRepositoriesCard() {
  const { formatMessage } = useIntl();

  const [filter, setFilter] = useState<OnboardingProjectsFilter>('all');
  const [searchValue, query, handleSearch] = useDebouncedValue();
  const [pageIndex, setPageIndex] = useState(1);
  const organizationKey = useOnboardingOrganizationKey();

  // Reset to the first page whenever the filter or search query changes.
  useEffect(() => {
    setPageIndex(1);
  }, [filter, query]);

  const { data, isLoading } = useOnboardingProjectsQuery({
    organizationKey,
    filter,
    pageIndex,
    pageSize: PAGE_SIZE,
    q: query === '' ? undefined : query,
  });

  const projects = data?.projects ?? [];
  const filterCounts = data?.filterCounts;
  const total = data?.page.total ?? 0;
  const totalPages = data === undefined ? 0 : Math.ceil(data.page.total / data.page.pageSize);

  const options = PROJECT_FILTERS.map(({ key, labelKey }) => ({
    label: formatMessage({ id: labelKey }),
    suffix: <span className="sw-ml-2">{filterCounts?.[key] ?? 0}</span>,
    value: key,
  }));

  const title = formatMessage({ id: 'onboarding_dashboard.projects.title' });

  return (
    <Card>
      <Card.Header
        description={formatMessage({ id: 'onboarding_dashboard.projects.description' })}
        title={title}
      />
      <Card.Body>
        <LoadingContainer
          isLoading={isLoading}
          loadingMessage={formatMessage({ id: 'onboarding_dashboard.projects.loading' })}
        >
          <div className="sw-flex sw-flex-col sw-gap-4">
            <div className="sw-w-full sw-flex sw-items-center sw-justify-between">
              <div className="sw-flex sw-items-center sw-gap-4">
                <SearchInput
                  onChange={handleSearch}
                  placeholderLabel={formatMessage({ id: 'onboarding_dashboard.projects.search' })}
                  value={searchValue}
                  width={SearchInputWidth.Large}
                />
                <ButtonGroup isCombined>
                  {options.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value);
                      }}
                      variety={
                        filter === option.value ? ButtonVariety.Primary : ButtonVariety.Default
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              <Text as="span" isSubtle size={TextSize.Small}>
                {formatMessage(
                  { id: 'onboarding_dashboard.projects.count' },
                  {
                    count: total,
                    b: (count) => <Text isHighlighted>{count}</Text>,
                  },
                )}
              </Text>
            </div>

            <div className="sw-max-h-[520px] sw-overflow-y-auto">
              <Table
                ariaLabel={title}
                gridTemplate="minmax(240px, 2.5fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr)"
                variety={TableVariety.Surface}
              >
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell
                      label={formatMessage({ id: 'onboarding_dashboard.projects.col.repository' })}
                    />
                    <Table.ColumnHeaderCell
                      className="sw-justify-center"
                      label={formatMessage({ id: 'onboarding_dashboard.projects.col.onboarding' })}
                    />
                    <Table.ColumnHeaderCell
                      className="sw-justify-center"
                      label={formatMessage({
                        id: 'onboarding_dashboard.projects.col.analysis_mode',
                      })}
                    />
                    <Table.ColumnHeaderCell
                      className="sw-justify-center"
                      label={formatMessage({ id: 'onboarding_dashboard.projects.col.gate_status' })}
                    />
                    <Table.ColumnHeaderCell
                      className="sw-justify-center"
                      label={formatMessage({ id: 'onboarding_dashboard.projects.col.last_scan' })}
                    />
                    <Table.ColumnHeaderCell
                      className="sw-justify-center"
                      label={formatMessage({
                        id: 'onboarding_dashboard.projects.col.test_coverage',
                      })}
                    />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {isLoading ? (
                    <ProjectsTableRowsSkeleton columns={6} />
                  ) : (
                    <>
                      {projects.length === 0 && (
                        <Table.Row>
                          <Table.Cell className="sw-justify-start">{NO_DATA}</Table.Cell>
                          <Table.Cell>{NO_DATA}</Table.Cell>
                          <Table.Cell>{NO_DATA}</Table.Cell>
                          <Table.Cell>{NO_DATA}</Table.Cell>
                          <Table.Cell>{NO_DATA}</Table.Cell>
                          <Table.Cell>{NO_DATA}</Table.Cell>
                        </Table.Row>
                      )}
                      {projects.map((project) => {
                        const onboardingBadge = getOnboardingBadge(project);
                        const analysisBadge = getAnalysisModeBadge(project);
                        const isImported =
                          project.onboarding !== OnboardingProjectOnboarding.NotImported;

                        return (
                          <Table.Row key={project.key ?? project.name}>
                            <Table.Cell className="sw-justify-start">
                              <RepositoryCell project={project} />
                            </Table.Cell>
                            <Table.Cell>
                              <Badge variety={onboardingBadge.variety}>
                                {formatMessage({ id: onboardingBadge.labelKey })}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              {analysisBadge === undefined ? (
                                NO_DATA
                              ) : (
                                <Badge variety={analysisBadge.variety}>
                                  {formatMessage({ id: analysisBadge.labelKey })}
                                </Badge>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {isImported ? (
                                <GateStatusBadge status={project.gateStatus} />
                              ) : (
                                NO_DATA
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {isDefined(project.lastScan) ? (
                                <DateFromNow date={project.lastScan} />
                              ) : (
                                NO_DATA
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {isDefined(project.coverage) ? (
                                <Text>{project.coverage}%</Text>
                              ) : (
                                NO_DATA
                              )}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </>
                  )}
                </Table.Body>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="sw-flex sw-justify-center">
                <Pagination onChange={setPageIndex} page={pageIndex} totalPages={totalPages} />
              </div>
            )}
          </div>
        </LoadingContainer>
      </Card.Body>
    </Card>
  );
}
