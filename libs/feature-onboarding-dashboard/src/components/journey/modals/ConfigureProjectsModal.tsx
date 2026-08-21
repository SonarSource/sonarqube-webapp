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
  BadgeVariety,
  Button,
  ButtonVariety,
  IconLinkExternal,
  LinkStandalone,
  Modal,
  SearchInputWidth,
  Table,
  TableCellJustify,
  Text,
} from '@sonarsource/echoes-react';
import { PropsWithChildren, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { getConfigureProjectUrl } from '~adapters/helpers/urls';
import DateFormatter from '~shared/components/intl/DateFormatter';
import { isDefined } from '~shared/helpers/types';
import {
  OnboardingProject,
  OnboardingProjectOnboarding,
  OnboardingProjectScanMethod,
} from '~shared/types/onboarding';
import { composeProjectFilters } from '../../../helpers/onboarding-projects';
import {
  ANALYSIS_MODE_FILTER_OPTIONS,
  ANY_PROJECTS_FILTER,
  AnalysisModeFilterValue,
  SCAN_STATUS_FILTER_OPTIONS,
  ScanStatusFilterValue,
} from '../../../types/types';
import { NO_DATA } from '../../dashboardConstants';
import { getAnalysisModeBadge, getOnboardingBadge } from '../../projects/projectBadges';
import { ProjectsFilterSelect } from '../../projects/ProjectsFilterSelect';
import { ProjectsTable, ProjectsTableColumn } from '../../projects/ProjectsTable';
import { RepositoryCell } from '../../projects/RepositoryCell';

const PAGE_SIZE = 10;

const COLUMNS: ProjectsTableColumn[] = [
  { labelKey: 'onboarding_dashboard.projects.col.project' },
  { justify: TableCellJustify.Center, labelKey: 'onboarding_dashboard.projects.col.onboarding' },
  { justify: TableCellJustify.Center, labelKey: 'onboarding_dashboard.projects.col.analysis_mode' },
  { justify: TableCellJustify.Start, labelKey: 'onboarding_dashboard.stale.col.last_scan' },
  {
    isLabelHidden: true,
    justify: TableCellJustify.End,
    labelKey: 'onboarding_dashboard.projects.col.actions',
    width: 'auto',
  },
];

interface Props {
  defaultScanStatus?: ScanStatusFilterValue;
}

export function ConfigureProjectsModal({
  defaultScanStatus,
  children,
}: Readonly<PropsWithChildren<Props>>) {
  const { formatMessage } = useIntl();

  const [scanStatus, setScanStatus] = useState<ScanStatusFilterValue>(
    defaultScanStatus ?? ANY_PROJECTS_FILTER,
  );
  const [analysisMode, setAnalysisMode] = useState<AnalysisModeFilterValue>(ANY_PROJECTS_FILTER);

  const configurationDocUrl = useSharedDocUrl(SharedDocLink.CIAnalysisSetup);

  const title = formatMessage({ id: 'onboarding_dashboard.journey.analyze.modal.title' });

  const resetFilters = useCallback(() => {
    setScanStatus(defaultScanStatus ?? ANY_PROJECTS_FILTER);
    setAnalysisMode(ANY_PROJECTS_FILTER);
  }, [setScanStatus, setAnalysisMode, defaultScanStatus]);

  return (
    <Modal
      content={
        <ProjectsTable
          ariaLabel={title}
          columns={COLUMNS}
          containerClassName="sw-max-h-[calc(80vh-12rem)]"
          filters={composeProjectFilters([scanStatus, analysisMode])}
          loadingMessageKey="onboarding_dashboard.projects.loading"
          pageSize={PAGE_SIZE}
          renderRow={(project) => (
            <ConfigureProjectRow key={project.key ?? project.name} project={project} />
          )}
          searchPlaceholderKey="onboarding_dashboard.projects.search"
          searchWidth={SearchInputWidth.Medium}
          toolbarControls={
            <>
              <ProjectsFilterSelect
                id="configure-projects-scan-status-filter"
                labelKey="onboarding_dashboard.projects.filter.scan_status.label"
                onChange={setScanStatus}
                options={SCAN_STATUS_FILTER_OPTIONS}
                value={scanStatus}
              />
              <ProjectsFilterSelect
                id="configure-projects-analysis-mode-filter"
                labelKey="onboarding_dashboard.projects.filter.analysis_mode.label"
                onChange={setAnalysisMode}
                options={ANALYSIS_MODE_FILTER_OPTIONS}
                value={analysisMode}
              />
            </>
          }
        />
      }
      description={formatMessage({
        id: 'onboarding_dashboard.journey.analyze.modal.description',
      })}
      footerLink={
        <LinkStandalone enableOpenInNewTab to={configurationDocUrl}>
          {formatMessage({ id: 'onboarding_dashboard.journey.analyze.modal.how_to_configure' })}
        </LinkStandalone>
      }
      onClose={resetFilters}
      secondaryButton={<Button>{formatMessage({ id: 'close' })}</Button>}
      size="wide"
      title={title}
    >
      {children}
    </Modal>
  );
}

function ConfigureProjectRow({ project }: Readonly<{ project: OnboardingProject }>) {
  const { formatMessage } = useIntl();

  const onboardingBadge = getOnboardingBadge(project);
  const analysisBadge = getAnalysisModeBadge(project);
  const isImported = project.onboarding !== OnboardingProjectOnboarding.NotImported;

  return (
    <Table.Row>
      <Table.Cell className="sw-justify-start">
        <RepositoryCell
          alm={project.alm}
          language={project.language}
          name={project.name}
          path={project.path}
        />
      </Table.Cell>

      <Table.CellBadge variety={onboardingBadge.variety}>
        {formatMessage({ id: onboardingBadge.labelKey })}
      </Table.CellBadge>

      <Table.CellBadge variety={analysisBadge?.variety ?? BadgeVariety.Neutral}>
        {isDefined(analysisBadge)
          ? formatMessage({ id: analysisBadge.labelKey })
          : formatMessage({ id: 'none' })}
      </Table.CellBadge>

      <Table.Cell className="sw-justify-start">
        {isImported && isDefined(project.lastScan) ? (
          <DateFormatter date={project.lastScan} />
        ) : (
          <Text>{NO_DATA}</Text>
        )}
      </Table.Cell>

      <Table.Cell>
        {project.onboarding !== OnboardingProjectOnboarding.NotImported &&
          project.scanMethod !== OnboardingProjectScanMethod.Ci &&
          project.key && (
            <Button
              suffix={<IconLinkExternal />}
              to={getConfigureProjectUrl(project.key)}
              variety={ButtonVariety.Default}
            >
              {formatMessage({ id: 'onboarding_dashboard.journey.analyze.modal.configure' })}
            </Button>
          )}
      </Table.Cell>
    </Table.Row>
  );
}
