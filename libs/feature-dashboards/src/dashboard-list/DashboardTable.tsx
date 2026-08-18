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
  Link,
  LinkHighlight,
  Spinner,
  Table,
  TableVariety,
  Text,
  TextSize,
  Tooltip,
  TooltipSide,
} from '@sonarsource/echoes-react';
import { type ComponentProps, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { To } from 'react-router-dom';
import DateFromNow from '~shared/components/intl/DateFromNow';

export interface DashboardTableItem {
  createdById?: string;
  description?: string;
  id: string;
  name: string;
  type: string;
  updatedAt: number | string;
  updatedById?: string;
}

export interface DashboardTableProps<TDashboard extends DashboardTableItem = DashboardTableItem> {
  dashboards: TDashboard[];
  getCreatorContent: (dashboard: TDashboard) => ComponentProps<typeof Table.CellText>['content'];
  getDashboardUrl: (dashboard: TDashboard) => To;
  gridTemplate: string;
  isLoadingDashboards: boolean;
  isMemberOfOrganization: boolean;
  renderActionsCell?: (dashboard: TDashboard) => ReactNode;
  renderDashboardNameSuffix?: (dashboard: TDashboard) => ReactNode;
}

export function DashboardTable<TDashboard extends DashboardTableItem>(
  props: Readonly<DashboardTableProps<TDashboard>>,
) {
  const {
    dashboards,
    getCreatorContent,
    getDashboardUrl,
    gridTemplate,
    isLoadingDashboards,
    isMemberOfOrganization,
    renderActionsCell,
    renderDashboardNameSuffix,
  } = props;
  const intl = useIntl();
  const hasActionsColumn = renderActionsCell !== undefined;

  return (
    <Table
      ariaLabel={intl.formatMessage({ id: 'dashboard.list.table.aria_label' })}
      gridTemplate={gridTemplate}
      variety={TableVariety.Ghost}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell
            label={intl.formatMessage({
              id: 'dashboard.dashboard_name',
            })}
          />
          <Table.ColumnHeaderCell
            label={intl.formatMessage({
              id: 'dashboard.list.table.column.last_edited',
            })}
          />
          {isMemberOfOrganization && (
            <Table.ColumnHeaderCell
              label={intl.formatMessage({
                id: 'dashboard.list.table.column.creator',
              })}
            />
          )}
          {hasActionsColumn && <Table.ColumnHeaderCell label="" />}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {isLoadingDashboards && (
          <Table.Row>
            <Table.CellText
              content={<Spinner isLoading={isLoadingDashboards} wrapperClassName="sw-my-2" />}
            />
            <Table.Cell />
            {isMemberOfOrganization && <Table.Cell />}
            {hasActionsColumn && <Table.Cell />}
          </Table.Row>
        )}
        {dashboards.length === 0 && !isLoadingDashboards && (
          <Table.Row>
            <Table.CellText
              content={
                <div className="sw-flex sw-justify-center">
                  <Text isSubtle>{intl.formatMessage({ id: 'dashboard.list.no_results' })}</Text>
                </div>
              }
            />
            <Table.Cell />
            {isMemberOfOrganization && <Table.Cell />}
            {hasActionsColumn && <Table.Cell />}
          </Table.Row>
        )}
        {dashboards.length > 0 &&
          !isLoadingDashboards &&
          dashboards.map((dashboard) => (
            <Table.Row key={dashboard.id}>
              <Table.CellText
                content={
                  <div className="sw-flex sw-items-center sw-gap-2 sw-my-3">
                    <Link highlight={LinkHighlight.Default} to={getDashboardUrl(dashboard)}>
                      {dashboard.name}
                    </Link>
                    {renderDashboardNameSuffix?.(dashboard)}
                  </div>
                }
                description={
                  <Tooltip content={dashboard.description} side={TooltipSide.Right}>
                    <div className="sw-mb-3 sw-truncate">{dashboard.description}</div>
                  </Tooltip>
                }
              />
              <Table.CellText
                content={
                  <Text size={TextSize.Small}>
                    <DateFromNow date={dashboard.updatedAt} />
                  </Text>
                }
              />
              {isMemberOfOrganization && <Table.CellText content={getCreatorContent(dashboard)} />}
              {hasActionsColumn && <Table.Cell>{renderActionsCell?.(dashboard)}</Table.Cell>}
            </Table.Row>
          ))}
      </Table.Body>
    </Table>
  );
}
