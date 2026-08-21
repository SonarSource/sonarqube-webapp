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
  FormFieldWidth,
  Label,
  LoadingContainer,
  Pagination,
  SearchInput,
  SearchInputWidth,
  Select,
  Table,
  TableVariety,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { useAlmIconSrc } from '~adapters/helpers/almIcons';
import { useOnboardingRepositoriesQuery } from '~adapters/queries/onboarding';
import {
  OnboardingAlm,
  OnboardingRepositoriesVisibility,
  OnboardingRepository,
} from '~shared/types/onboarding';
import { REPOSITORY_VISIBILITY_FILTER_OPTIONS } from '../../types/types';
import { PLATFORM_CONFIG } from '../devops/platformConfig';
import { ProjectsFilterSelect } from './ProjectsFilterSelect';
import { ProjectsTableColumn } from './ProjectsTable';
import { TableBodyRows } from './TableBodyRows';
import { TableHeaderRows } from './TableHeaderRows';
import { usePaginatedTableState } from './usePaginatedTableState';
import { usePlatformSelection } from './usePlatformSelection';

/** The first column holds the repository name, so it gets more room than the others. */
const FIRST_COLUMN_TEMPLATE = 'minmax(240px, 2.5fr)';
const COLUMN_TEMPLATE = 'minmax(120px, 1fr)';

/** Same shape as {@link ProjectsTableColumn} — reused so both tables share one header renderer. */
export type RepositoriesTableColumn = ProjectsTableColumn;

interface Props {
  ariaLabel: string;
  columns: RepositoriesTableColumn[];
  containerClassName?: string;
  pageSize: number;
  renderRow: (repository: OnboardingRepository) => ReactNode;
}

/**
 * Paged, searchable table of DevOps-platform repositories discovered for the current organization.
 * Includes a platform selector on SQ-Server when multiple DevOps integrations are configured.
 */
export function RepositoriesTable({
  ariaLabel,
  columns,
  containerClassName,
  pageSize,
  renderRow,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const tableRef = useRef<HTMLTableElement>(null);

  const [visibility, setVisibility] = useState<OnboardingRepositoriesVisibility>(
    OnboardingRepositoriesVisibility.All,
  );

  const { onPageChange, onSearchChange, pageIndex, query, searchValue } =
    usePaginatedTableState(visibility);

  const {
    effectiveEntry,
    isLoading: isPlatformsLoading,
    platformEntries,
    selectedDopSettingId,
    setSelectedDopSettingId,
    showPlatformSelect,
  } = usePlatformSelection();

  const platformSelectData = useMemo(
    () =>
      platformEntries.map((entry) => ({
        label: entry.key,
        prefix: <PlatformIcon alm={entry.type} />,
        value: entry.id,
      })),
    [platformEntries],
  );

  // Reset search, visibility, and page when the user explicitly changes platform.
  useEffect(() => {
    setVisibility(OnboardingRepositoriesVisibility.All);
    onSearchChange('');
    onPageChange(1);
  }, [selectedDopSettingId, onPageChange, onSearchChange]);

  const { data, isPending } = useOnboardingRepositoriesQuery(
    {
      dopSettingId: effectiveEntry?.id,
      pageIndex,
      pageSize,
      q: query === '' ? undefined : query,
      visibility,
    },
    { enabled: !isPlatformsLoading },
  );

  // Scroll the (scrollable) table body back to the top whenever a new page lands.
  useEffect(() => {
    tableRef.current?.scrollTo?.({ top: 0 });
  }, [data]);

  const repositories = useMemo(() => data?.repositories ?? [], [data?.repositories]);
  const total = data?.page.total ?? 0;
  const totalPages = data === undefined ? 0 : Math.ceil(data.page.total / data.page.pageSize);

  const gridTemplate = columns
    .map(({ width }, index) => width ?? (index === 0 ? FIRST_COLUMN_TEMPLATE : COLUMN_TEMPLATE))
    .join(' ');

  return (
    <LoadingContainer
      isLoading={isPlatformsLoading || isPending}
      loadingMessage={formatMessage({ id: 'onboarding_dashboard.repositories.loading' })}
    >
      <div className={`sw-flex sw-flex-col sw-gap-4 ${containerClassName ?? ''}`.trim()}>
        <div className="sw-flex sw-flex-col sw-gap-2">
          {/* This label is placed separately so that 'x/y results' is aligned with the controls */}
          {showPlatformSelect && (
            <Label className="sw-w-fit" htmlFor="import-repositories-platform-select">
              {formatMessage({
                id: 'onboarding_dashboard.journey.import.modal.platform_select.label',
              })}
            </Label>
          )}
          <div className="sw-flex sw-w-full sw-items-center sw-justify-between">
            <div className="sw-flex sw-items-center sw-gap-4">
              {showPlatformSelect && (
                <Select
                  data={platformSelectData}
                  id="import-repositories-platform-select"
                  isNotClearable
                  onChange={(value) => {
                    setSelectedDopSettingId(value ?? undefined);
                  }}
                  value={effectiveEntry?.id}
                  valueIcon={
                    effectiveEntry ? <PlatformIcon alm={effectiveEntry.type} /> : undefined
                  }
                  width={FormFieldWidth.Medium}
                />
              )}
              <SearchInput
                onChange={onSearchChange}
                placeholderLabel={formatMessage({
                  id: 'onboarding_dashboard.repositories.search',
                })}
                value={searchValue}
                width={SearchInputWidth.Large}
              />

              <ProjectsFilterSelect
                id="import-repositories-visibility-filter"
                labelKey="onboarding_dashboard.repositories.filter.visibility.label"
                onChange={setVisibility}
                options={REPOSITORY_VISIBILITY_FILTER_OPTIONS}
                value={visibility}
              />
            </div>

            <Text as="span" className="sw-ml-auto" isSubtle size={TextSize.Small}>
              {formatMessage(
                { id: 'onboarding_dashboard.table.results_size' },
                { size: repositories.length, total },
              )}
            </Text>
          </div>
        </div>

        <Table
          ariaLabel={ariaLabel}
          className="sw-overflow-y-auto sw-content-start"
          gridTemplate={gridTemplate}
          ref={tableRef}
          variety={TableVariety.Surface}
        >
          <Table.Header>
            <TableHeaderRows columns={columns} />
          </Table.Header>

          <Table.Body>
            <TableBodyRows
              columnCount={columns.length}
              isLoading={isPending}
              items={repositories}
              renderRow={renderRow}
            />
          </Table.Body>
        </Table>

        {totalPages > 1 && (
          <div className="sw-shrink-0 sw-flex sw-justify-center">
            <Pagination onChange={onPageChange} page={pageIndex} totalPages={totalPages} />
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}

function PlatformIcon({ alm }: Readonly<{ alm: OnboardingAlm }>) {
  const { formatMessage } = useIntl();
  const { imageKey, labelKey } = PLATFORM_CONFIG[alm];
  const iconSrc = useAlmIconSrc(imageKey);

  if (iconSrc === undefined) {
    return null;
  }
  return <Image alt={formatMessage({ id: labelKey })} height={16} src={iconSrc} width={16} />;
}
