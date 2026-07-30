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

import { Badge, Button, ButtonGroup, ButtonVariety, Table } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingProjectOnboarding, OnboardingProjectsFilter } from '~shared/types/onboarding';
import { NO_DATA } from '../../dashboardConstants';
import { GateStatusBadge } from '../../projects/GateStatusBadge';
import { getAnalysisModeBadge, getOnboardingBadge } from '../../projects/projectBadges';
import { PROJECT_FILTERS } from '../../projects/projectFilters';
import {
  ProjectsTableCard,
  ProjectsTableColumn,
  ProjectsTableRowProps,
} from '../../projects/ProjectsTableCard';
import { RepositoryCell } from '../../projects/RepositoryCell';

const PAGE_SIZE = 50;

const COLUMNS: ProjectsTableColumn[] = [
  { labelKey: 'onboarding_dashboard.projects.col.repository' },
  { className: 'sw-justify-center', labelKey: 'onboarding_dashboard.projects.col.onboarding' },
  { className: 'sw-justify-center', labelKey: 'onboarding_dashboard.projects.col.analysis_mode' },
  { className: 'sw-justify-center', labelKey: 'onboarding_dashboard.projects.col.gate_status' },
];

/**
 * "All projects" table of the redesigned onboarding journey: search, filter chips and the four
 * columns the design calls for.
 */
export function AllProjectsCard() {
  const { formatMessage } = useIntl();

  const [filter, setFilter] = useState<OnboardingProjectsFilter>('all');

  return (
    <ProjectsTableCard
      columns={COLUMNS}
      descriptionKey="onboarding_dashboard.projects.description"
      filter={filter}
      loadingMessageKey="onboarding_dashboard.projects.loading"
      pageSize={PAGE_SIZE}
      projectRow={ProjectRow}
      searchPlaceholderKey="onboarding_dashboard.projects.search"
      titleKey="onboarding_dashboard.projects.title"
      toolbarControls={
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
      }
    />
  );
}

function ProjectRow({ project }: Readonly<ProjectsTableRowProps>) {
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
