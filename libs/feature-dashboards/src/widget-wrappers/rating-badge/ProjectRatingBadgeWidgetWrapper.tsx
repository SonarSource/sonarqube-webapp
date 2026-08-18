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

import { RatingBadgeSize } from '@sonarsource/echoes-react';
import { useSearchParams } from 'react-router-dom';
import Measure from '~adapters/components/measure/Measure';
import { extractDashboardMeasureValue } from '~adapters/helpers/dashboard-measures';
import { getProjectDashboardMeasuresUrl } from '~adapters/helpers/dashboard-widget-urls';
import { useProjectRatingBadgeMeasuresQuery } from '~adapters/queries/project-rating-badge-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { RatingBadgeDisplay } from '../../components/visualizations/RatingBadgeDisplay';
import { CodeScope, WidgetMode } from '../../types/widget-common';
import { isRatingMetric } from '../../utils/lineChartMeasureTransformFlags';
import { getMetricKeyForScope } from '../../utils/projectWidgetData';
import { isQualityGateStatus, NON_LINKABLE_RATING_METRICS } from '../../utils/ratingBadge';
import { ProjectQualityGateStatusBadge } from './ProjectQualityGateStatusBadge';

interface Props {
  metricKey: MetricKey;
  mode?: WidgetMode;
  scope: CodeScope;
  showBreakdown?: boolean;
}

export function ProjectRatingBadgeWidgetWrapper(props: Readonly<Props>) {
  const { metricKey, mode, scope, showBreakdown } = props;
  const [searchParams] = useSearchParams();
  const component = searchParams.get('id') ?? '';
  const isScopeNew = scope === CodeScope.New;

  const { data: measureData, isLoading } = useProjectRatingBadgeMeasuresQuery(
    {
      component,
      metricKeys: getMetricKeyForScope(metricKey, isScopeNew),
    },
    { enabled: Boolean(component) },
  );

  const { data: metrics, isLoading: isMetricsListLoading } = useWidgetMetricMetadataQuery();
  const metricMetadata = metrics?.[metricKey];
  const metricType = metricMetadata?.type;
  const isRatingForMeasure = isRatingMetric(metricKey, metricType);
  const metricTypeForMeasure = isRatingForMeasure
    ? MetricType.Rating
    : (metricType ?? MetricType.Integer);

  const value = extractDashboardMeasureValue(measureData?.[0], isScopeNew);

  if (isLoading || isMetricsListLoading) {
    return <WidgetLoadingSpinner />;
  }

  if (metricKey === MetricKey.alert_status) {
    return renderAlertStatusWidget({ showBreakdown, value });
  }

  if (value === undefined) {
    return <WidgetNoData />;
  }

  const isLinkable = !NON_LINKABLE_RATING_METRICS.has(metricKey);
  const isEditMode = mode === WidgetMode.Edit;

  const ratingLinkTo =
    isLinkable && !isEditMode
      ? getProjectDashboardMeasuresUrl({
          component,
          metric: metricKey,
          sinceLeakPeriod: isScopeNew,
        })
      : undefined;

  return (
    <div className="sw-text-[3rem] sw-leading-none sw-h-full sw-flex sw-flex-col sw-items-center sw-justify-center">
      {metricTypeForMeasure === MetricType.Rating ? (
        <RatingBadgeDisplay
          badgeSize={RatingBadgeSize.ExtraLarge}
          linkTo={ratingLinkTo}
          metricKey={metricKey}
          value={value}
        />
      ) : (
        <Measure
          badgeSize="xl"
          metricKey={metricKey}
          metricType={metricTypeForMeasure}
          value={value}
        />
      )}
    </div>
  );
}

function renderAlertStatusWidget(args: {
  showBreakdown: boolean | undefined;
  value: string | undefined;
}): React.ReactNode {
  const { showBreakdown, value } = args;

  if (!isQualityGateStatus(value)) {
    return <WidgetNoData />;
  }

  return <ProjectQualityGateStatusBadge showBreakdown={showBreakdown} status={value} />;
}
