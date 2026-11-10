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
  BadgeVariety,
  cssVar,
  IconWarning,
  LoadingContainer,
  Pagination,
  SearchInput,
  SearchInputWidth,
  Table,
  TableCellJustify,
  TableVariety,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { CSSProperties } from 'react';
import { useIntl } from 'react-intl';
import { Path } from 'react-router';
import { Image } from '~adapters/components/common/Image';
import { useAlmIconSrc } from '~adapters/helpers/almIcons';
import { toDisplayPercent } from '~shared/helpers/onboarding/percent';
import {
  isKnownPlatform,
  OnboardingOrganizationRow,
  OnboardingOrganizationSort,
  OnboardingSortDirection,
} from '~shared/types/onboarding';
import { OnboardingDashboardAction } from '~shared/types/onboarding-dashboard-telemetry';
import { NO_DATA } from '../dashboardConstants';
import { PLATFORM_CONFIG } from '../devops/platformConfig';
import { ProjectsTableColumn } from '../projects/ProjectsTable';
import { TableBodyRows } from '../projects/TableBodyRows';
import { TableHeaderRows } from '../projects/TableHeaderRows';
import { OrganizationAccess, useOrganizationAccess } from './OrganizationAccessContext';
import { OrganizationRowActions } from './OrganizationRowActions';
import { OrganizationsSortControl } from './OrganizationsSortControl';

/** Organization and actions get the room; the figures stay compact. */
const GRID_TEMPLATE =
  'minmax(220px, 2fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(180px, 1.5fr) auto';

/** The number of columns the "couldn't load" message of an unavailable organization spans. */
const FIGURE_COLUMNS_COUNT = 3;

const COLUMNS: ProjectsTableColumn[] = [
  { labelKey: 'onboarding_dashboard.enterprise.organizations.col.organization' },
  { labelKey: 'onboarding_dashboard.enterprise.organizations.col.imported' },
  { labelKey: 'onboarding_dashboard.enterprise.organizations.col.analyzed' },
  { labelKey: 'onboarding_dashboard.enterprise.organizations.col.progress' },
  {
    isLabelHidden: true,
    justify: TableCellJustify.End,
    labelKey: 'onboarding_dashboard.enterprise.organizations.col.actions',
  },
];

interface Props {
  direction: OnboardingSortDirection;
  getBindingUrl: (organizationKey: string) => Partial<Path>;
  getDashboardUrl: (organizationKey: string) => Partial<Path>;
  isLoading: boolean;
  onAction?: (action: OnboardingDashboardAction) => void;
  onDirectionChange: (direction: OnboardingSortDirection) => void;
  onPageChange: (pageIndex: number) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: OnboardingOrganizationSort) => void;
  organizations: OnboardingOrganizationRow[];
  /** 1-based index of the current page. */
  pageIndex: number;
  /** Rows per page, which is also the number of skeleton rows while loading. */
  pageSize: number;
  searchValue: string;
  sort: OnboardingOrganizationSort;
  /** Organizations matching the search, across all pages. Undefined until a page has loaded. */
  total: number | undefined;
}

/**
 * Per-organization roll-up: imported and analyzed figures, progress and row actions. Presentational:
 * search, sort and page are owned by the caller. An unreadable organization shows no numbers, never
 * zeros.
 */
export function OrganizationsCoverageTable({
  direction,
  getBindingUrl,
  getDashboardUrl,
  isLoading,
  onAction,
  onDirectionChange,
  onPageChange,
  onSearchChange,
  onSortChange,
  organizations,
  pageIndex,
  pageSize,
  searchValue,
  sort,
  total,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const totalPages = Math.ceil((total ?? 0) / pageSize);

  return (
    <LoadingContainer
      isLoading={isLoading}
      loadingMessage={formatMessage({
        id: 'onboarding_dashboard.enterprise.organizations.loading',
      })}
    >
      <div className="sw:flex sw:flex-col sw:gap-4">
        <div className="sw:flex sw:w-full sw:items-center sw:justify-between sw:gap-4">
          <div className="sw:flex sw:items-center sw:gap-4">
            <SearchInput
              onChange={onSearchChange}
              placeholderLabel={formatMessage({
                id: 'onboarding_dashboard.enterprise.organizations.search',
              })}
              value={searchValue}
              width={SearchInputWidth.Large}
            />

            <OrganizationsSortControl
              direction={direction}
              onDirectionChange={onDirectionChange}
              onSortChange={onSortChange}
              sort={sort}
            />
          </div>

          <Text as="span" className="sw:ml-auto" isSubtle size={TextSize.Small}>
            {formatMessage(
              { id: 'onboarding_dashboard.table.results_size' },
              { size: organizations.length, total: total ?? organizations.length },
            )}
          </Text>
        </div>

        <Table
          ariaLabel={formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.title' })}
          gridTemplate={GRID_TEMPLATE}
          variety={TableVariety.Surface}
        >
          <Table.Header>
            <TableHeaderRows columns={COLUMNS} />
          </Table.Header>

          <Table.Body>
            <TableBodyRows
              columnCount={COLUMNS.length}
              isLoading={isLoading}
              items={organizations}
              renderRow={(organization) => (
                <OrganizationRow
                  getBindingUrl={getBindingUrl}
                  getDashboardUrl={getDashboardUrl}
                  key={organization.key}
                  onAction={onAction}
                  organization={organization}
                />
              )}
              rowCount={pageSize}
            />
          </Table.Body>
        </Table>

        {totalPages > 1 && (
          <div className="sw:shrink-0 sw:flex sw:justify-center">
            <Pagination onChange={onPageChange} page={pageIndex} totalPages={totalPages} />
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}

const ACCESS_LABEL_IDS: Record<OrganizationAccess, string> = {
  [OrganizationAccess.Admin]: 'onboarding_dashboard.enterprise.organizations.access.admin',
  [OrganizationAccess.Member]: 'onboarding_dashboard.enterprise.organizations.access.member',
  [OrganizationAccess.None]: 'onboarding_dashboard.enterprise.organizations.access.none',
};

type RowProps = Pick<Props, 'getBindingUrl' | 'getDashboardUrl' | 'onAction'> & {
  organization: OnboardingOrganizationRow;
};

function OrganizationRow({
  getBindingUrl,
  getDashboardUrl,
  onAction,
  organization,
}: Readonly<RowProps>) {
  const { formatMessage } = useIntl();
  const { availability, key, name } = organization;

  const isUnavailable = availability === 'UNAVAILABLE';
  const access = useOrganizationAccess(key);

  return (
    <Table.Row>
      <Table.Cell className="sw:justify-start">
        <div className="sw:flex sw:min-w-0 sw:items-center sw:gap-2">
          <PlatformIcon organization={organization} />

          <div className="sw:flex sw:min-w-0 sw:flex-col">
            <Text isHighlighted>{name}</Text>
            <Text className="sw:truncate" isSubtle size={TextSize.Small}>
              {key}
            </Text>
          </div>

          {access !== undefined && (
            <Badge className="sw:shrink-0" variety={BadgeVariety.Neutral}>
              {formatMessage({ id: ACCESS_LABEL_IDS[access] })}
            </Badge>
          )}
        </div>
      </Table.Cell>

      {isUnavailable ? (
        // One message spanning the figure columns; zeros or dashes would read as data.
        <Table.Cell
          className="sw:justify-start sw:gap-2"
          style={{ gridColumn: `span ${FIGURE_COLUMNS_COUNT}` }}
        >
          <IconWarning color="echoes-color-icon-subtle" />
          <Text isSubtle>
            {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.unavailable' })}
          </Text>
        </Table.Cell>
      ) : (
        <>
          <Table.Cell className="sw:justify-start">
            <FigureText
              done={organization.repositories?.imported}
              total={organization.repositories?.discovered}
            />
          </Table.Cell>

          <Table.Cell className="sw:justify-start">
            <FigureText
              done={organization.projects?.analyzed}
              total={organization.projects?.total}
            />
          </Table.Cell>

          <Table.Cell className="sw:justify-start sw:gap-3">
            <ProgressBar name={name} value={organization.progressPct} />
          </Table.Cell>
        </>
      )}

      <Table.Cell className="sw:justify-end">
        <OrganizationRowActions
          access={access}
          getBindingUrl={getBindingUrl}
          getDashboardUrl={getDashboardUrl}
          onAction={onAction}
          organization={organization}
        />
      </Table.Cell>
    </Table.Row>
  );
}

/** Icon of the organization's DevOps platform; none when unbound or the platform has no icon. */
function PlatformIcon({ organization }: Readonly<{ organization: OnboardingOrganizationRow }>) {
  const { formatMessage } = useIntl();
  const { bound, devopsPlatform } = organization;
  const platformConfig =
    bound && isKnownPlatform(devopsPlatform) ? PLATFORM_CONFIG[devopsPlatform] : undefined;
  const iconSrc = useAlmIconSrc(platformConfig?.imageKey);

  if (platformConfig === undefined || iconSrc === undefined) {
    return null;
  }

  const label = formatMessage({ id: platformConfig.qualifiedLabelKey ?? platformConfig.labelKey });

  return <Image alt={label} className="sw:shrink-0" height={16} src={iconSrc} />;
}

/** "done / total", the total being a dash where the backend could not discover it. */
function FigureText({
  done,
  total,
}: Readonly<{ done: number | undefined; total: number | null | undefined }>) {
  const { formatMessage } = useIntl();

  if (done === undefined) {
    return <Text isSubtle>{NO_DATA}</Text>;
  }

  return (
    <Text>
      {formatMessage(
        { id: 'onboarding_dashboard.journey.step.count' },
        { done, total: total ?? NO_DATA },
      )}
    </Text>
  );
}

/**
 * Native `<progress>` for built-in semantics. Its track and fill are vendor pseudo-elements, styled
 * via arbitrary variants with Echoes tokens as CSS custom properties. Classes are written in full so
 * Tailwind can scan them.
 */
const PROGRESS_CLASS_NAME = [
  'sw:h-2 sw:min-w-0 sw:flex-1 sw:appearance-none sw:overflow-hidden sw:rounded-pill sw:border-none',
  'sw:bg-(--progress-track)',
  'sw:[&::-webkit-progress-bar]:bg-(--progress-track)',
  'sw:[&::-webkit-progress-value]:rounded-pill',
  'sw:[&::-webkit-progress-value]:bg-(--progress-fill)',
  'sw:[&::-moz-progress-bar]:rounded-pill',
  'sw:[&::-moz-progress-bar]:bg-(--progress-fill)',
].join(' ');

const PROGRESS_STYLE = {
  '--progress-fill': cssVar('color-charts-categorical-1'),
  '--progress-track': cssVar('color-background-neutral-subtle-default'),
} as CSSProperties;

function ProgressBar({
  name,
  value,
}: Readonly<{ name: string; value: number | null | undefined }>) {
  const { formatMessage } = useIntl();
  const percent = toDisplayPercent(value ?? 0);

  return (
    <>
      <progress
        aria-label={formatMessage(
          { id: 'onboarding_dashboard.enterprise.organizations.progress.label' },
          { name },
        )}
        className={PROGRESS_CLASS_NAME}
        max={100}
        style={PROGRESS_STYLE}
        value={percent}
      />

      <Text className="sw:w-10 sw:text-right" size={TextSize.Small}>
        {formatMessage({ id: 'onboarding_dashboard.percent' }, { percent })}
      </Text>
    </>
  );
}
