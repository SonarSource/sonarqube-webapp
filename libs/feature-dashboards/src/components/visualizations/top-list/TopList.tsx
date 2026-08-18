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
  LinkHighlight,
  LinkStandalone,
  Table,
  TableVariety,
  Tooltip,
} from '@sonarsource/echoes-react';
import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useObserveElementTruncation } from '../../../dashboard-layout/shared/hooks/useObserveElementTruncation';
import type { TopListColumnHeaders, TopListProps, TopListRow } from '../../../types/visualization';
import { WidgetLoadingSpinner } from '../../common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../common/WidgetNoData';
import { TrendIndicator } from '../TrendIndicator';
import { formatTopListIssueCount } from './topListIssueCountFormat';

function TopListTruncatedRuleLabel({ label }: Readonly<{ label: string }>) {
  const textRef = useRef<HTMLSpanElement>(null);
  const isTruncated = useObserveElementTruncation(textRef, label);

  const text = (
    <span
      className="sw-block sw-min-w-0 sw-w-full sw-overflow-hidden sw-truncate sw-text-start"
      ref={textRef}
      {...(isTruncated ? { 'aria-label': label } : {})}
    >
      {label}
    </span>
  );

  const labelContent = (
    <div className="sw-block sw-min-w-0 sw-w-full sw-overflow-hidden">{text}</div>
  );

  if (!isTruncated) {
    return labelContent;
  }

  return (
    <Tooltip content={label} delayDuration={300}>
      <div className="sw-block sw-min-w-0 sw-w-full sw-overflow-hidden">{text}</div>
    </Tooltip>
  );
}

function TopListRankByCell({
  isSelected,
  label,
  linkTo,
  onRowClick,
  row,
}: Readonly<
  Pick<TopListRow, 'label' | 'linkTo'> & {
    isSelected: boolean;
    onRowClick?: (row: TopListRow) => void;
    row: TopListRow;
  }
>) {
  const ruleLabel = <TopListTruncatedRuleLabel label={label} />;

  if (linkTo !== undefined) {
    return (
      <Table.Cell className="sw-box-border sw-max-h-[37px] sw-min-h-0 sw-min-w-0 sw-overflow-hidden">
        <LinkStandalone
          className="sw-block sw-min-w-0 sw-w-full sw-overflow-hidden"
          highlight={LinkHighlight.CurrentColor}
          to={linkTo}
        >
          {ruleLabel}
        </LinkStandalone>
      </Table.Cell>
    );
  }

  if (onRowClick !== undefined) {
    return (
      <Table.Cell className="sw-box-border sw-max-h-[37px] sw-min-h-0 sw-min-w-0 sw-overflow-hidden">
        <button
          className="sw-block sw-min-w-0 sw-w-full sw-cursor-pointer sw-overflow-hidden sw-border-0 sw-bg-transparent sw-p-0 sw-text-start"
          onClick={() => {
            onRowClick(row);
          }}
          type="button"
          {...(isSelected ? { 'aria-current': 'true' as const } : {})}
        >
          <span className={isSelected ? 'sw-font-semibold' : undefined}>{ruleLabel}</span>
        </button>
      </Table.Cell>
    );
  }

  return (
    <Table.Cell className="sw-box-border sw-max-h-[37px] sw-min-h-0 sw-min-w-0 sw-overflow-hidden">
      {ruleLabel}
    </Table.Cell>
  );
}

function TopListCountCell({
  content,
  countLinkAriaLabel,
  countLinkTo,
}: Readonly<{ content: string; countLinkAriaLabel?: string; countLinkTo?: string }>) {
  const cellContent =
    countLinkTo !== undefined ? (
      <LinkStandalone
        aria-label={countLinkAriaLabel}
        highlight={LinkHighlight.CurrentColor}
        to={countLinkTo}
      >
        {content}
      </LinkStandalone>
    ) : (
      content
    );

  return (
    <Table.CellNumber
      className="sw-box-border sw-max-h-[37px] sw-min-h-0 sw-shrink-0 sw-justify-end sw-overflow-hidden sw-whitespace-nowrap"
      content={cellContent}
    />
  );
}

function TopListTable({
  ariaLabel,
  columnHeaders,
  onRowClick,
  rows,
  selectedRowLabel,
  showTrendColumn,
}: Readonly<{
  ariaLabel: string;
  columnHeaders: TopListColumnHeaders;
  onRowClick?: TopListProps['onRowClick'];
  rows: TopListProps['rows'];
  selectedRowLabel?: string;
  showTrendColumn: boolean;
}>) {
  const { formatMessage } = useIntl();

  return (
    <Table
      ariaLabel={ariaLabel}
      className="sw-min-w-0 sw-w-full"
      data-testid="top-list-table"
      gridTemplate={
        showTrendColumn ? 'minmax(0, 1fr) max-content max-content' : 'minmax(0, 1fr) max-content'
      }
      variety={TableVariety.Ghost}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell
            className="sw-min-w-0 sw-overflow-hidden"
            label={columnHeaders.rankBy}
          />
          <Table.ColumnHeaderCell
            className="sw-shrink-0"
            justify="end"
            label={columnHeaders.metric}
          />
          {showTrendColumn && (
            <Table.ColumnHeaderCell
              className="sw-shrink-0"
              justify="end"
              label={columnHeaders.trend}
            />
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row
            className="sw-max-h-[37px]"
            data-testid={`top-list-row-${row.rank}`}
            key={row.value}
          >
            <TopListRankByCell
              isSelected={selectedRowLabel === row.label}
              label={row.label}
              linkTo={row.linkTo}
              onRowClick={onRowClick}
              row={row}
            />
            <TopListCountCell
              content={formatTopListIssueCount(row.count, formatMessage)}
              countLinkAriaLabel={
                row.countLinkTo === undefined
                  ? undefined
                  : formatMessage(
                      { id: 'dashboard.top_list.count_link.aria_label' },
                      {
                        count: formatTopListIssueCount(row.count, formatMessage),
                        label: row.label,
                      },
                    )
              }
              countLinkTo={row.countLinkTo}
            />
            {showTrendColumn && (
              <Table.Cell className="sw-box-border sw-flex sw-max-h-[37px] sw-min-h-0 sw-shrink-0 sw-items-center sw-justify-end sw-overflow-hidden sw-whitespace-nowrap">
                {row.trendData && (
                  <TrendIndicator
                    compact
                    isPending={false}
                    trendData={row.trendData}
                    zeroPercentWhenNoChange
                  />
                )}
              </Table.Cell>
            )}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export function TopList({
  ariaLabel,
  columnHeaders,
  hasFetchError,
  isPending,
  onRowClick,
  rows,
  selectedRowLabel,
  showTrendColumn = true,
}: Readonly<TopListProps>) {
  if (hasFetchError) {
    return <WidgetNoData className="sw-my-0 sw-h-full" />;
  }

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (rows.length === 0) {
    return <WidgetNoData className="sw-my-0 sw-h-full" />;
  }

  return (
    <div
      className="sw-h-full sw-min-h-0 sw-w-full sw-min-w-0 sw-overflow-x-hidden sw-overflow-y-auto"
      data-testid="top-list"
    >
      <TopListTable
        ariaLabel={ariaLabel}
        columnHeaders={columnHeaders}
        onRowClick={onRowClick}
        rows={rows}
        selectedRowLabel={selectedRowLabel}
        showTrendColumn={showTrendColumn}
      />
    </div>
  );
}
