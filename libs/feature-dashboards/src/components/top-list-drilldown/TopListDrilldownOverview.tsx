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
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetFilterLine } from '../../dashboard-layout/shared/WidgetFilterLine';
import type { TopListWidgetProps } from '../../types/dashboard-widget';
import type { PieChartSegment } from '../../types/visualization';
import type { RuleMetadataByKey } from '../../types/widget-common';
import { getActualMetricKey } from '../../widget-creation-modal/utils/getActualMetricKey';
import { WidgetLoadingSpinner } from '../common/WidgetLoadingSpinner';
import { WidgetNoData } from '../common/WidgetNoData';
import { CountWidget } from '../visualizations/CountWidget';
import { TrendIndicator, type TrendData } from '../visualizations/TrendIndicator';
import { buildTopListIssueCountFilterSegments } from './topListDrilldownFilterSegments';
import { TopListDrilldownRuleHeaderCard } from './TopListDrilldownRuleHeaderCard';
import { TopListDrilldownSliceFilterCard } from './TopListDrilldownSliceFilterCard';

const summaryCardClassName = 'sw-flex sw-h-full sw-min-h-0 sw-min-w-0 sw-flex-col';
const summaryCardBodyClassName =
  'sw-box-border sw-flex sw-min-h-0 sw-flex-1 sw-flex-col sw-items-center sw-justify-center sw-p-3';
const summaryContentClassName = 'sw-flex sw-h-[56px] sw-w-full sw-items-center sw-justify-center';

interface TopListDrilldownData {
  counts: Record<string, number>;
  getRuleTrendData: (ruleKey: string) => TrendData | null;
  isPending: boolean;
  rulesByKey: RuleMetadataByKey;
  rulesOrganization?: string;
}

interface Props {
  data: TopListDrilldownData;
  filterSegments: PieChartSegment[];
  onRuleChange: (ruleKey: string) => void;
  selectedRuleKey?: string;
  widget: TopListWidgetProps;
}

function renderIssueCount(isPending: boolean, issueCount: number | null, metricKey: MetricKey) {
  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (issueCount === null) {
    return <WidgetNoData className="sw-my-0" />;
  }

  return (
    <CountWidget metricKey={metricKey} metricType={MetricType.Integer} value={String(issueCount)} />
  );
}

function renderTrend(isPending: boolean, showTrend: boolean, trendData: TrendData | null) {
  if (!showTrend) {
    return (
      <div className="sw-px-4 sw-text-center" data-testid="top-list-drilldown-trend-unavailable">
        <FormattedMessage id="dashboard.add_widget_modal.customize_visualization.checkbox.show_trend_indicator.overall_code_only" />
      </div>
    );
  }

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  return (
    <div data-testid="top-list-drilldown-trend">
      <TrendIndicator compact isPending={false} trendData={trendData} zeroPercentWhenNoChange />
    </div>
  );
}

export function TopListDrilldownOverview(props: Readonly<Props>) {
  const { data, filterSegments, onRuleChange, selectedRuleKey, widget } = props;
  const { formatMessage } = useIntl();
  const ruleKey = selectedRuleKey;
  const issueCount = ruleKey === undefined ? null : (data.counts[ruleKey] ?? 0);
  const metricKey = getActualMetricKey(widget.metric) as MetricKey;
  const trendData = useMemo(
    () => (ruleKey === undefined ? null : data.getRuleTrendData(ruleKey)),
    [data, ruleKey],
  );
  const issueCountFilterSegments = buildTopListIssueCountFilterSegments(formatMessage, widget);
  const trendFilterSegments = [
    formatMessage({ id: 'dashboard.widget.trend_indicator.change_last_30_days' }),
  ];

  return (
    <div className="sw-flex sw-flex-col sw-gap-4" data-testid="top-list-drilldown-overview">
      <TopListDrilldownSliceFilterCard
        onRuleChange={onRuleChange}
        segments={filterSegments}
        selectedRuleKey={selectedRuleKey}
      />

      {ruleKey !== undefined && (
        <TopListDrilldownRuleHeaderCard
          langName={data.rulesByKey[ruleKey]?.langName}
          name={data.rulesByKey[ruleKey]?.name}
          organization={data.rulesOrganization}
          ruleKey={ruleKey}
        />
      )}

      <div
        className="sw-grid sw-grid-cols-2 sw-items-stretch sw-gap-4"
        data-testid="top-list-drilldown-summary-row"
      >
        <Card className={summaryCardClassName} data-testid="top-list-drilldown-issue-count-card">
          <Card.Header
            description={<WidgetFilterLine segments={issueCountFilterSegments} />}
            title={formatMessage({
              id: 'dashboard.add_widget_modal.define_widget.metric.issue_count',
            })}
          />
          <Card.Body className={summaryCardBodyClassName}>
            <div className={summaryContentClassName}>
              {renderIssueCount(data.isPending, issueCount, metricKey)}
            </div>
          </Card.Body>
        </Card>

        <Card className={summaryCardClassName} data-testid="top-list-drilldown-trend-card">
          <Card.Header
            description={<WidgetFilterLine segments={trendFilterSegments} />}
            title={formatMessage({ id: 'dashboard.top_list.column.trend' })}
          />
          <Card.Body className={summaryCardBodyClassName}>
            <div className={summaryContentClassName}>
              {renderTrend(data.isPending, widget.scope !== 'new', trendData)}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
