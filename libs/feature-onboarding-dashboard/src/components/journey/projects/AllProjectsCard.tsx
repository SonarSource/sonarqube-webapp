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
import { useDebouncedValue } from '~shared/helpers/useDebouncedValue';
import { useOnboardingProjectsQuery } from '~shared/queries/onboarding';
import {
  OnboardingProject,
  OnboardingProjectOnboarding,
  OnboardingProjectsFilter,
} from '~shared/types/onboarding';
import { NO_DATA } from '../../dashboardConstants';
import { GateStatusBadge } from '../../projects/GateStatusBadge';
import { getAnalysisModeBadge, getOnboardingBadge } from '../../projects/projectBadges';
import { PROJECT_FILTERS } from '../../projects/projectFilters';
import { ProjectsTableRowsSkeleton } from '../../projects/ProjectsTableRowsSkeleton';
import { RepositoryCell } from '../../projects/RepositoryCell';

const PAGE_SIZE = 50;
const COLUMN_COUNT = 4;
const GRID_TEMPLATE =
  'minmax(240px, 2.5fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr)';

/**
 * "All projects" table of the redesigned onboarding journey: search, filter chips and the four
 * columns the design calls for. Filtering, searching and paging are all server-side, driven by
 * `useOnboardingProjectsQuery`.
 */
export function AllProjectsCard() {
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
  const total = data?.page.total ?? 0;
  const totalPages = data === undefined ? 0 : Math.ceil(data.page.total / data.page.pageSize);

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
            <div className="sw-flex sw-w-full sw-items-center sw-justify-between">
              <div className="sw-flex sw-items-center sw-gap-4">
                <SearchInput
                  onChange={handleSearch}
                  placeholderLabel={formatMessage({ id: 'onboarding_dashboard.projects.search' })}
                  value={searchValue}
                  width={SearchInputWidth.Large}
                />
                <ButtonGroup isCombined>
                  {PROJECT_FILTERS.map(({ key, labelKey }) => (
                    <Button
                      key={key}
                      onClick={() => {
                        setFilter(key);
                      }}
                      variety={filter === key ? ButtonVariety.Primary : ButtonVariety.Default}
                    >
                      {formatMessage({ id: labelKey })}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              <Text as="span" isSubtle size={TextSize.Small}>
                {formatMessage(
                  { id: 'onboarding_dashboard.projects.count' },
                  { b: (chunks) => <Text isHighlighted>{chunks}</Text>, count: total },
                )}
              </Text>
            </div>

            <Table ariaLabel={title} gridTemplate={GRID_TEMPLATE} variety={TableVariety.Surface}>
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
                    label={formatMessage({ id: 'onboarding_dashboard.projects.col.analysis_mode' })}
                  />
                  <Table.ColumnHeaderCell
                    className="sw-justify-center"
                    label={formatMessage({ id: 'onboarding_dashboard.projects.col.gate_status' })}
                  />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {isLoading && <ProjectsTableRowsSkeleton columns={COLUMN_COUNT} />}

                {!isLoading && projects.length === 0 && <EmptyRow />}

                {!isLoading &&
                  projects.map((project) => (
                    <ProjectRow key={project.key ?? project.name} project={project} />
                  ))}
              </Table.Body>
            </Table>

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

function EmptyRow() {
  return (
    <Table.Row>
      <Table.Cell className="sw-justify-start">{NO_DATA}</Table.Cell>
      {Array.from({ length: COLUMN_COUNT - 1 }, (_, index) => (
        <Table.Cell key={`empty-cell-${index}`}>{NO_DATA}</Table.Cell>
      ))}
    </Table.Row>
  );
}

interface ProjectRowProps {
  project: OnboardingProject;
}

function ProjectRow({ project }: Readonly<ProjectRowProps>) {
  const { formatMessage } = useIntl();

  const onboardingBadge = getOnboardingBadge(project);
  const analysisBadge = getAnalysisModeBadge(project);
  const isImported = project.onboarding !== OnboardingProjectOnboarding.NotImported;

  return (
    <Table.Row>
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
        {isImported ? <GateStatusBadge status={project.gateStatus} /> : NO_DATA}
      </Table.Cell>
    </Table.Row>
  );
}
