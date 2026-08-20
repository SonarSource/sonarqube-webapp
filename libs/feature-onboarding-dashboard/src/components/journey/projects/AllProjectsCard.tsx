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

import { Badge, Table } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingProjectOnboarding } from '~shared/types/onboarding';
import {
  ANALYSIS_MODE_FILTER_OPTIONS,
  ANY_PROJECTS_FILTER,
  AnalysisModeFilterValue,
  SCAN_STATUS_FILTER_OPTIONS,
  ScanStatusFilterValue,
} from '../../../types/types';
import { NO_DATA } from '../../dashboardConstants';
import { GateStatusBadge } from '../../projects/GateStatusBadge';
import { getAnalysisModeBadge, getOnboardingBadge } from '../../projects/projectBadges';
import {
  PROJECT_ROW_ACTIONS_COLUMN,
  ProjectRowActionsCell,
} from '../../projects/ProjectRowActionsCell';
import { ProjectsFilterSelect } from '../../projects/ProjectsFilterSelect';
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
  PROJECT_ROW_ACTIONS_COLUMN,
];

/**
 * "All projects" table of the redesigned onboarding journey: search, the scan status and analysis
 * mode filter dropdowns, and the four columns the design calls for.
 */
export function AllProjectsCard() {
  const [scanStatus, setScanStatus] = useState<ScanStatusFilterValue>(ANY_PROJECTS_FILTER);
  const [analysisMode, setAnalysisMode] = useState<AnalysisModeFilterValue>(ANY_PROJECTS_FILTER);

  return (
    <ProjectsTableCard
      columns={COLUMNS}
      descriptionKey="onboarding_dashboard.projects.description"
      loadingMessageKey="onboarding_dashboard.projects.loading"
      pageSize={PAGE_SIZE}
      renderRow={(project) => <ProjectRow key={project.key ?? project.name} project={project} />}
      searchPlaceholderKey="onboarding_dashboard.projects.search"
      titleKey="onboarding_dashboard.projects.title"
      toolbarControls={
        <>
          <ProjectsFilterSelect
            id="onboarding-projects-scan-status-filter"
            labelKey="onboarding_dashboard.projects.filter.scan_status.label"
            onChange={setScanStatus}
            options={SCAN_STATUS_FILTER_OPTIONS}
            value={scanStatus}
          />

          <ProjectsFilterSelect
            id="onboarding-projects-analysis-mode-filter"
            labelKey="onboarding_dashboard.projects.filter.analysis_mode.label"
            onChange={setAnalysisMode}
            options={ANALYSIS_MODE_FILTER_OPTIONS}
            value={analysisMode}
          />
        </>
      }
      userFilters={[scanStatus, analysisMode]}
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

      <ProjectRowActionsCell project={project} />
    </Table.Row>
  );
}
