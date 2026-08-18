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

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { getPortfolioDashboardWidgetDrilldownUrl } from '~adapters/helpers/dashboard-widget-urls';
import { usePortfolioTopListData } from '~adapters/queries/portfolio-top-list-widget-data';
import { TopList } from '../../components/visualizations/top-list/TopList';
import { getTopListColumnHeaders } from '../../components/visualizations/top-list/topListColumnHeaders';
import { buildTopListRows } from '../../components/visualizations/top-list/topListRowUtils';
import { useOptionalWidgetInstanceContext } from '../../dashboard-layout/shared/WidgetInstanceContext';
import { type TopListWidgetProps } from '../../types/dashboard-widget';
import { TopListRow } from '../../types/visualization';
import { CodeScope, TopListMetric } from '../../types/widget-common';
import { formatRuleDisplayLabel } from '../../utils/topListRuleLabels';

export interface PortfolioTopListWidgetOptions {
  onRowSelect?: (label: string) => void;
  selectedRowLabel?: string;
  /**
   * When true, row links to the portfolio breakdown page are omitted (e.g. breakdown preview).
   */
  suppressPortfolioDrilldownLink?: boolean;
}

export function PortfolioTopListWidgetWrapper(
  props: Readonly<TopListWidgetProps & PortfolioTopListWidgetOptions>,
) {
  const {
    limit,
    onRowSelect,
    rankBy,
    scope,
    selectedRowLabel,
    suppressPortfolioDrilldownLink = false,
  } = props;
  const { formatMessage } = useIntl();
  const widgetInstance = useOptionalWidgetInstanceContext();
  const { portfolioId } = useDashboardPortfolioContext();
  const showTrendIndicator = scope !== CodeScope.New;

  const {
    counts,
    getRuleTrendData,
    isError: hasFetchError,
    isPending,
    rulesByKey,
  } = usePortfolioTopListData(props, portfolioId, {
    fetchTrendHistory: showTrendIndicator,
  });

  const getRowUrl = useCallback(
    (ruleKey: string): string | undefined => {
      if (suppressPortfolioDrilldownLink || onRowSelect !== undefined || widgetInstance === null) {
        return undefined;
      }

      return getPortfolioDashboardWidgetDrilldownUrl(widgetInstance.widgetKey, ruleKey);
    },
    [onRowSelect, suppressPortfolioDrilldownLink, widgetInstance],
  );

  const handleRowClick = useCallback(
    (row: TopListRow) => {
      onRowSelect?.(row.label);
    },
    [onRowSelect],
  );

  const rows = useMemo(() => {
    return buildTopListRows(
      counts,
      (value) => formatRuleDisplayLabel(value, rulesByKey[value], { includeLanguage: false }),
      getRowUrl,
      getRuleTrendData,
      limit,
      getRowUrl,
    );
  }, [counts, getRowUrl, getRuleTrendData, limit, rulesByKey]);

  const ariaLabel = formatMessage({ id: 'dashboard.top_list.aria_label' }, { limit });
  const columnHeaders = getTopListColumnHeaders(rankBy, TopListMetric.IssueCount, formatMessage);

  return (
    <TopList
      ariaLabel={ariaLabel}
      columnHeaders={columnHeaders}
      hasFetchError={hasFetchError}
      isPending={isPending}
      onRowClick={onRowSelect === undefined ? undefined : handleRowClick}
      rows={rows}
      selectedRowLabel={selectedRowLabel}
    />
  );
}
