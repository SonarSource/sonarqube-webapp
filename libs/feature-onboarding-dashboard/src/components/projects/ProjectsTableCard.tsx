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
import { useOnboardingOrganizationKey } from '~adapters/queries/onboarding';
import { useOnboardingProjectsQuery } from '~shared/queries/onboarding';
import { OnboardingProject } from '~shared/types/onboarding';
import { ProjectsTable, ProjectsTableColumn, ProjectsTableFilters } from './ProjectsTable';

export type { ProjectsTableColumn, ProjectsTableRowProps } from './ProjectsTable';

interface Props {
  columns: ProjectsTableColumn[];
  descriptionKey: string;
  /**
   * Server-side filters the user picked through {@link toolbarControls}. Changing them resets to
   * the first page.
   */
  filters?: ProjectsTableFilters;
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
 *
 * Renders nothing at all when the organization has no project for this table, so the dashboard only
 * shows the tables that actually hold something. An empty result the user brought about themselves,
 * through the search box or the toolbar filters, keeps the card visible.
 */
export function ProjectsTableCard({
  columns,
  descriptionKey,
  filters = {},
  loadingMessageKey,
  pageSize,
  renderRow,
  searchPlaceholderKey,
  titleKey,
  toolbarControls,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const organizationKey = useOnboardingOrganizationKey();

  // Whether the organization has anything at all for this table, ignoring the search box and the
  // toolbar filters: a table the user narrowed down to nothing keeps its card so the toolbar stays
  // reachable, while a table the organization has nothing for is dropped rather than shown as an
  // empty shell. Deliberately the same query as the table's own initial, unfiltered request, so it
  // is served from the cache instead of costing an extra round-trip.
  const { data: baseData } = useOnboardingProjectsQuery({
    organizationKey,
    pageIndex: 1,
    pageSize,
  });

  if (baseData?.page.total === 0) {
    return null;
  }

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
