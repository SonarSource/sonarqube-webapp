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
  LoadingContainer,
  Modal,
  ModalSize,
  Pagination,
  SearchInput,
  SearchInputWidth,
  Table,
  TableVariety,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { ANY_PROJECTS_FILTER, JourneyStep } from '../../../types/types';
import { NO_DATA } from '../../dashboardConstants';
import {
  DEVOPS_PLATFORM_FILTER_OPTIONS,
  DevopsPlatformFilterValue,
  PLATFORM_CONFIG,
} from '../../devops/platformConfig';
import { ProjectsFilterSelect } from '../../projects/ProjectsFilterSelect';
import { ProjectsTableColumn } from '../../projects/ProjectsTable';
import { RepositoryCell } from '../../projects/RepositoryCell';
import { TableBodyRows } from '../../projects/TableBodyRows';
import { TableHeaderRows } from '../../projects/TableHeaderRows';
import { usePaginatedTableState } from '../../projects/usePaginatedTableState';
import {
  DEVOPS_CONFIGURATION_ROW_ACTIONS_COLUMN,
  DevopsConfigurationRowActionsCell,
} from './DevopsConfigurationRowActionsCell';
import { DevopsConfigurationRow } from './devopsConfigurationRows';
import { useDevopsConfigurationRows } from './useDevopsConfigurationRows';

const PAGE_SIZE = 10;

/** The configuration name needs more room than the count beside it. */
const NAME_COLUMN_TEMPLATE = 'minmax(240px, 3fr)';
const COUNT_COLUMN_TEMPLATE = 'minmax(120px, 1fr)';

// The design's "Found repositories" and "Analysed" columns are left out: neither can be sourced per
// configuration today — there is no repository-count endpoint, and `/onboarding/projects` reports
// analysis per platform only.
const COLUMNS: ProjectsTableColumn[] = [
  {
    labelKey: 'onboarding_dashboard.journey.binding.modal.col.name',
    width: NAME_COLUMN_TEMPLATE,
  },
  {
    labelKey: 'onboarding_dashboard.journey.binding.modal.col.imported',
    width: COUNT_COLUMN_TEMPLATE,
  },
  DEVOPS_CONFIGURATION_ROW_ACTIONS_COLUMN,
];

const GRID_TEMPLATE = COLUMNS.map(({ width }) => width ?? COUNT_COLUMN_TEMPLATE).join(' ');

interface Props {
  /** Selects another step of the journey, which is how the row menu offers "Analyze projects". */
  onSelectStep: (step: JourneyStep) => void;
}

// Opened from the configurations donut's "View details". Search, filter and paging run in the
// browser, since the whole list arrives in one cached response.
export function DevopsConfigurationsModal({
  children,
  onSelectStep,
}: Readonly<PropsWithChildren<Props>>) {
  const { formatMessage } = useIntl();

  const [platform, setPlatform] = useState<DevopsPlatformFilterValue>(ANY_PROJECTS_FILTER);
  const { onPageChange, onSearchChange, pageIndex, query, searchValue } =
    usePaginatedTableState(platform);

  const filters = useMemo(() => ({ platform, query }), [platform, query]);

  const { isPending, page, total } = useDevopsConfigurationRows({
    filters,
    pageIndex,
    pageSize: PAGE_SIZE,
  });

  const resetFilters = useCallback(() => {
    setPlatform(ANY_PROJECTS_FILTER);
    onSearchChange('');
    onPageChange(1);
  }, [onPageChange, onSearchChange]);

  const title = formatMessage({ id: 'onboarding_dashboard.journey.binding.modal.title' });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Modal
      content={
        <LoadingContainer
          isLoading={isPending}
          loadingMessage={formatMessage({
            id: 'onboarding_dashboard.journey.binding.modal.loading',
          })}
        >
          <div className="sw-flex sw-max-h-[calc(80vh-10rem)] sw-flex-col sw-gap-4">
            <div className="sw-flex sw-w-full sw-items-center sw-justify-between sw-gap-4">
              <div className="sw-flex sw-items-center sw-gap-4">
                <SearchInput
                  onChange={onSearchChange}
                  placeholderLabel={formatMessage({
                    id: 'onboarding_dashboard.journey.binding.modal.search',
                  })}
                  value={searchValue}
                  width={SearchInputWidth.Medium}
                />

                <ProjectsFilterSelect
                  id="devops-configurations-platform-filter"
                  labelKey="onboarding_dashboard.journey.binding.modal.platform_filter.label"
                  onChange={setPlatform}
                  options={DEVOPS_PLATFORM_FILTER_OPTIONS}
                  value={platform}
                />
              </div>

              <Text as="span" isSubtle size={TextSize.Small}>
                {formatMessage(
                  { id: 'onboarding_dashboard.table.results_size' },
                  { size: page.length, total },
                )}
              </Text>
            </div>

            <Table
              ariaLabel={title}
              className="sw-content-start sw-overflow-y-auto"
              gridTemplate={GRID_TEMPLATE}
              variety={TableVariety.Surface}
            >
              <Table.Header>
                <TableHeaderRows columns={COLUMNS} />
              </Table.Header>

              <Table.Body>
                <TableBodyRows
                  columnCount={COLUMNS.length}
                  isLoading={isPending}
                  items={page}
                  renderRow={(row) => (
                    <DevopsConfigurationTableRow
                      key={row.id}
                      onSelectStep={onSelectStep}
                      row={row}
                    />
                  )}
                  rowCount={PAGE_SIZE}
                />
              </Table.Body>
            </Table>

            {totalPages > 1 && (
              <div className="sw-flex sw-shrink-0 sw-justify-center">
                <Pagination onChange={onPageChange} page={pageIndex} totalPages={totalPages} />
              </div>
            )}
          </div>
        </LoadingContainer>
      }
      onClose={resetFilters}
      secondaryButton={<Button>{formatMessage({ id: 'close' })}</Button>}
      size={ModalSize.Wide}
      title={title}
    >
      {children}
    </Modal>
  );
}

interface RowProps {
  onSelectStep: (step: JourneyStep) => void;
  row: DevopsConfigurationRow;
}

function DevopsConfigurationTableRow({ onSelectStep, row }: Readonly<RowProps>) {
  const { formatMessage } = useIntl();

  const { labelKey, qualifiedLabelKey } = PLATFORM_CONFIG[row.alm];

  return (
    <Table.Row>
      <Table.Cell className="sw-justify-start">
        {/* The qualified label, so a Bitbucket Data Center row and a Bitbucket Cloud one do not both
            read "Bitbucket" under otherwise unrelated configuration names. */}
        <RepositoryCell
          alm={row.alm}
          name={row.key}
          subtitle={formatMessage({ id: qualifiedLabelKey ?? labelKey })}
        />
      </Table.Cell>

      {/* A badge is the design's treatment for a count; an unresolved one is not a count, so it
          stays plain text rather than an empty-looking pill. */}
      {row.imported === undefined ? (
        <Table.Cell>
          <Text isSubtle>{NO_DATA}</Text>
        </Table.Cell>
      ) : (
        <Table.CellBadge variety={BadgeVariety.Neutral}>{row.imported}</Table.CellBadge>
      )}

      <DevopsConfigurationRowActionsCell onGoToStep={onSelectStep} row={row} />
    </Table.Row>
  );
}
