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
  Button,
  ButtonVariety,
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
  ToggleButtonGroup,
} from '@sonarsource/echoes-react';
import { CSSProperties } from 'react';
import { useIntl } from 'react-intl';
import { Path } from 'react-router';
import { Image } from '~adapters/components/common/Image';
import { useAlmIconSrc } from '~adapters/helpers/almIcons';
import { toDisplayPercent } from '~shared/helpers/onboarding/percent';
import { OnboardingOrganizationRow, OnboardingOrganizationSort } from '~shared/types/onboarding';
import { OnboardingDashboardAction } from '~shared/types/onboarding-dashboard-telemetry';
import { NO_DATA } from '../dashboardConstants';
import { isKnownPlatform, PLATFORM_CONFIG } from '../devops/platformConfig';
import { ProjectsTableColumn } from '../projects/ProjectsTable';
import { TableBodyRows } from '../projects/TableBodyRows';
import { TableHeaderRows } from '../projects/TableHeaderRows';

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

const SORT_OPTIONS = [
  {
    labelKey: 'onboarding_dashboard.enterprise.organizations.sort.progress',
    value: OnboardingOrganizationSort.Progress,
  },
  {
    labelKey: 'onboarding_dashboard.enterprise.organizations.sort.name',
    value: OnboardingOrganizationSort.Name,
  },
];

interface Props {
  /** Where the binding setup of an organization lives, for the call-to-action of an unbound one. */
  getBindingUrl: (organizationKey: string) => Partial<Path>;
  /** Where the dashboard of an organization lives, the drill-down of every row. */
  getDashboardUrl: (organizationKey: string) => Partial<Path>;
  isLoading: boolean;
  /** Reported when a row action is selected, so the owner can track it. */
  onAction?: (action: OnboardingDashboardAction, organization: OnboardingOrganizationRow) => void;
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
 * The per-organization roll-up of an enterprise: one row per organization, led by the icon of its
 * DevOps platform, with the projects it has imported and analyzed and its progress, the way to
 * view and manage the organization and, for one that is not bound yet, the way to bind it.
 *
 * Presentational: the search, the sort and the page are owned by the caller, which fetches them
 * server-side. An organization whose figures could not be read has no numbers, never zeros.
 */
export function OrganizationsCoverageTable({
  getBindingUrl,
  getDashboardUrl,
  isLoading,
  onAction,
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

  const handleSortChange = (value: string) => {
    const nextSort = SORT_OPTIONS.find((option) => option.value === value)?.value;

    if (nextSort !== undefined) {
      onSortChange(nextSort);
    }
  };

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

            <ToggleButtonGroup
              onChange={handleSortChange}
              options={SORT_OPTIONS.map(({ labelKey, value }) => ({
                label: formatMessage({ id: labelKey }),
                value,
              }))}
              selected={sort}
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

      <Table.Cell className="sw:justify-end sw:gap-2">
        {!isUnavailable && !organization.bound && (
          <Button
            ariaLabel={formatMessage(
              { id: 'onboarding_dashboard.enterprise.organizations.action.bind.label' },
              { name },
            )}
            onClick={() => {
              onAction?.(OnboardingDashboardAction.BindOrganization, organization);
            }}
            to={getBindingUrl(key)}
            variety={ButtonVariety.Primary}
          >
            {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.action.bind' })}
          </Button>
        )}

        <Button
          ariaLabel={formatMessage(
            { id: 'onboarding_dashboard.enterprise.organizations.action.view.label' },
            { name },
          )}
          onClick={() => {
            onAction?.(OnboardingDashboardAction.ViewOrganizationDashboard, organization);
          }}
          to={getDashboardUrl(key)}
          variety={ButtonVariety.Default}
        >
          {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.action.view' })}
        </Button>
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
