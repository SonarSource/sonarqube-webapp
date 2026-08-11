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

import { Card } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingProject, OnboardingProjectsFilter } from '~shared/types/onboarding';
import { ProjectsTable, ProjectsTableColumn } from './ProjectsTable';

export type { ProjectsTableColumn, ProjectsTableRowProps } from './ProjectsTable';

interface Props {
  columns: ProjectsTableColumn[];
  descriptionKey: string;
  filters: OnboardingProjectsFilter[];
  loadingMessageKey: string;
  pageSize: number;
  renderRow: (project: OnboardingProject) => ReactNode;
  searchPlaceholderKey: string;
  titleKey: string;
  /** Extra toolbar controls rendered next to the search input, e.g. the filter dropdowns. */
  toolbarControls?: ReactNode;
}

/**
 * Card shell around {@link ProjectsTable}: header (title + description), body, and the shared
 * "N project(s)" result-count label. Used by the onboarding-dashboard project tables that live
 * on the page (as opposed to inside a modal).
 */
export function ProjectsTableCard({
  columns,
  descriptionKey,
  filters,
  loadingMessageKey,
  pageSize,
  renderRow,
  searchPlaceholderKey,
  titleKey,
  toolbarControls,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const title = formatMessage({ id: titleKey });

  return (
    <Card>
      <Card.Header description={formatMessage({ id: descriptionKey })} title={title} />
      <Card.Body>
        <ProjectsTable
          ariaLabel={title}
          columns={columns}
          filters={filters}
          loadingMessageKey={loadingMessageKey}
          pageSize={pageSize}
          renderRow={renderRow}
          searchPlaceholderKey={searchPlaceholderKey}
          toolbarControls={toolbarControls}
        />
      </Card.Body>
    </Card>
  );
}
