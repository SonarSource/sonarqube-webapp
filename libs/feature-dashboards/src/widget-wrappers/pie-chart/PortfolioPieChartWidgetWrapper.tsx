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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { getPortfolioDashboardWidgetDrilldownUrl } from '~adapters/helpers/dashboard-widget-urls';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { buildPieChartAriaLabel } from '../../components/pie-chart/pieChartAriaLabel';
import { getPieChartTitle } from '../../components/pie-chart/pieChartHeaderText';
import { InteractivePieChart } from '../../components/visualizations/pie-chart/InteractivePieChart';
import { useOptionalWidgetInstanceContext } from '../../dashboard-layout/shared/WidgetInstanceContext';
import { PieChartMetric, PieChartWidgetProps } from '../../types/dashboard-widget';
import { PieChartSegment } from '../../types/visualization';
import { usePortfolioPieChartData } from './usePortfolioPieChartData';

export function PortfolioPieChartWidgetWrapper(props: Readonly<PieChartWidgetProps>) {
  const navigate = useNavigate();
  const { formatMessage } = useIntl();
  const widgetInstance = useOptionalWidgetInstanceContext();
  const { portfolioId } = useDashboardPortfolioContext();
  const { isPending, segments } = usePortfolioPieChartData(props, portfolioId);

  const getSegmentUrl = useCallback(
    (segment: PieChartSegment): string | undefined => {
      if (
        widgetInstance === null ||
        props.metric === PieChartMetric.LineCount ||
        segment.value.startsWith('OTHER_')
      ) {
        return undefined;
      }

      return getPortfolioDashboardWidgetDrilldownUrl(widgetInstance.widgetKey, segment.value);
    },
    [props.metric, widgetInstance],
  );

  const handleSegmentClick = useCallback(
    (segment: PieChartSegment) => {
      const url = getSegmentUrl(segment);
      if (url) {
        navigate(url);
      }
    },
    [getSegmentUrl, navigate],
  );

  if (isPending) {
    return <WidgetLoadingSpinner />;
  }

  if (segments.length === 0) {
    return <WidgetNoData />;
  }

  const title = getPieChartTitle(formatMessage, {
    filter: props.filter,
    isPortfolioDashboard: true,
    metric: props.metric,
    slice: props.slice,
  });
  const ariaLabel = buildPieChartAriaLabel(formatMessage, { segments, title });

  return (
    <InteractivePieChart
      ariaLabel={ariaLabel}
      getSegmentUrl={getSegmentUrl}
      onSegmentClick={handleSegmentClick}
      pastry={props.pastry}
      segments={segments}
      showLegend={props.showLegend}
    />
  );
}
