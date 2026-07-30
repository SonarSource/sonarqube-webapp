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

import { BadgeVariety, Table, TableCellJustify } from '@sonarsource/echoes-react';
import DateFormatter from '~shared/components/intl/DateFormatter';
import { isDefined } from '~shared/helpers/types';
import { NO_DATA } from '../../dashboardConstants';
import { GateStatusBadge } from '../../projects/GateStatusBadge';
import {
  ProjectsTableCard,
  ProjectsTableColumn,
  ProjectsTableRowProps,
} from '../../projects/ProjectsTableCard';
import { RepositoryCell } from '../../projects/RepositoryCell';

const PAGE_SIZE = 10;

const COLUMNS: ProjectsTableColumn[] = [
  { labelKey: 'onboarding_dashboard.stale.col.project' },
  { justify: TableCellJustify.Start, labelKey: 'onboarding_dashboard.stale.col.gate_status' },
  { justify: TableCellJustify.Start, labelKey: 'onboarding_dashboard.stale.col.last_scan' },
];

/**
 * "Commits not being scanned" table: the projects the backend flags as stale, i.e. with commits
 * that haven't been scanned recently.
 */
export function StaleProjectsCard() {
  return (
    <ProjectsTableCard
      columns={COLUMNS}
      descriptionKey="onboarding_dashboard.stale.description"
      filter="stale"
      loadingMessageKey="onboarding_dashboard.stale.loading"
      pageSize={PAGE_SIZE}
      projectRow={StaleProjectRow}
      searchPlaceholderKey="onboarding_dashboard.stale.search"
      titleKey="onboarding_dashboard.stale.title"
    />
  );
}

function StaleProjectRow({ project }: Readonly<ProjectsTableRowProps>) {
  return (
    <Table.Row>
      <Table.Cell className="sw-justify-start">
        <RepositoryCell project={project} />
      </Table.Cell>

      <Table.Cell className="sw-justify-start">
        <GateStatusBadge status={project.gateStatus} />
      </Table.Cell>

      {isDefined(project.lastScan) ? (
        <Table.CellBadge cellClassName="sw-justify-start" variety={BadgeVariety.Neutral}>
          <DateFormatter date={project.lastScan} />
        </Table.CellBadge>
      ) : (
        <Table.Cell className="sw-justify-start">{NO_DATA}</Table.Cell>
      )}
    </Table.Row>
  );
}
