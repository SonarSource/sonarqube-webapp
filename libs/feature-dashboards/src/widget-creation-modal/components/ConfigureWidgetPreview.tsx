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

import { cssVar, Text, TextSize } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { GRID_CONSTANTS } from '../../dashboard-layout/ReadonlyDashboard/constants';
import { WidgetBodyMap, WidgetHeaderMap } from '../../dashboard-layout/logic/types';
import type {
  CompleteWidgetConfig,
  ProjectDashboardWidgetPropMap,
} from '../../types/dashboard-widget';
import { VisualizationType } from '../../types/widget-common';

interface ConfigureWidgetPreviewProps {
  bodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap>;
  completeConfig: CompleteWidgetConfig | null;
  headerMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap>;
}

/**
 * Live preview pane for the configure-widget modal (project + portfolio dashboards).
 */
export function ConfigureWidgetPreview({
  bodyMap,
  headerMap,
  completeConfig,
}: Readonly<ConfigureWidgetPreviewProps>) {
  return (
    <div
      className="sw-basis-[60%] sw-flex-[3] sw-min-h-0 sw-min-w-0 sw-flex sw-flex-col sw-flex-shrink-0"
      data-testid="widget-preview-pane"
    >
      <div
        style={{
          backgroundColor: cssVar('color-surface-default'),
          border: `${cssVar('border-width-default')} solid ${cssVar('color-border-weaker')}`,
          borderRadius: GRID_CONSTANTS.BORDER_RADIUS,
          padding: GRID_CONSTANTS.PADDING,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          minHeight: '400px',
        }}
      >
        {completeConfig === null ? (
          <div
            className="sw-flex sw-flex-1 sw-items-center sw-justify-center"
            style={{
              border: `${cssVar('border-width-default')} dashed ${cssVar('color-border-weaker')}`,
              borderRadius: GRID_CONSTANTS.BORDER_RADIUS,
            }}
          >
            <div className="sw-text-center">
              <Text isSubtle size={TextSize.Small}>
                <FormattedMessage id="dashboard.add_widget_modal.preview.placeholder" />
              </Text>
            </div>
          </div>
        ) : (
          <>
            <div
              className="sw-w-full"
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                flexShrink: 0,
                marginBottom: cssVar('dimension-space-100'),
              }}
            >
              {renderWidgetHeader(headerMap, completeConfig)}
            </div>

            <div
              className="sw-flex sw-flex-1 sw-min-h-0 sw-flex-col sw-justify-center"
              data-testid="widget-preview-body"
              onClickCapture={(event) => {
                // Allow hover interactions (tooltips) in preview, but block click actions/navigation.
                event.preventDefault();
                event.stopPropagation();
              }}
              style={{ overflow: 'hidden' }}
            >
              {renderWidgetBody(bodyMap, completeConfig)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function renderWidgetHeader(
  headerMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap>,
  completeConfig: CompleteWidgetConfig,
) {
  switch (completeConfig.widgetType) {
    case VisualizationType.DonutChart: {
      const HeaderComponent = headerMap[VisualizationType.DonutChart];
      return (
        <HeaderComponent
          filter={completeConfig.filter}
          metric={completeConfig.metric}
          pastry={completeConfig.pastry}
          scope={completeConfig.scope}
          showLegend={completeConfig.showLegend}
          slice={completeConfig.slice}
        />
      );
    }
    case VisualizationType.PieChart: {
      const HeaderComponent = headerMap[VisualizationType.PieChart];
      return (
        <HeaderComponent
          filter={completeConfig.filter}
          metric={completeConfig.metric}
          scope={completeConfig.scope}
          showLegend={completeConfig.showLegend}
          slice={completeConfig.slice}
        />
      );
    }
    case VisualizationType.Count: {
      const HeaderComponent = headerMap[VisualizationType.Count];
      return <HeaderComponent metric={completeConfig.metric} scope={completeConfig.scope} />;
    }
    case VisualizationType.LineChart: {
      const HeaderComponent = headerMap[VisualizationType.LineChart];
      return (
        <HeaderComponent
          groupBy={completeConfig.groupBy}
          historyRange={completeConfig.historyRange}
          metric={completeConfig.metric}
          scope={completeConfig.scope}
          showLegend={completeConfig.showLegend}
        />
      );
    }
    case VisualizationType.RatingBadge: {
      const HeaderComponent = headerMap[completeConfig.widgetType];
      return <HeaderComponent metricKey={completeConfig.metricKey} scope={completeConfig.scope} />;
    }
    case VisualizationType.TopList: {
      const HeaderComponent = headerMap[VisualizationType.TopList];
      return (
        <HeaderComponent
          limit={completeConfig.limit}
          metric={completeConfig.metric}
          rankBy={completeConfig.rankBy}
          scope={completeConfig.scope}
        />
      );
    }
    default:
      return null;
  }
}

function renderWidgetBody(
  bodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap>,
  completeConfig: CompleteWidgetConfig,
) {
  switch (completeConfig.widgetType) {
    case VisualizationType.DonutChart: {
      const BodyComponent = bodyMap[VisualizationType.DonutChart];
      return (
        <BodyComponent
          filter={completeConfig.filter}
          metric={completeConfig.metric}
          pastry={completeConfig.pastry}
          scope={completeConfig.scope}
          showLegend={completeConfig.showLegend}
          slice={completeConfig.slice}
        />
      );
    }
    case VisualizationType.PieChart: {
      const BodyComponent = bodyMap[VisualizationType.PieChart];
      return (
        <BodyComponent
          filter={completeConfig.filter}
          metric={completeConfig.metric}
          scope={completeConfig.scope}
          showLegend={completeConfig.showLegend}
          slice={completeConfig.slice}
        />
      );
    }
    case VisualizationType.LineChart: {
      const BodyComponent = bodyMap[completeConfig.widgetType];
      return (
        <BodyComponent
          groupBy={completeConfig.groupBy}
          historyRange={completeConfig.historyRange}
          metric={completeConfig.metric}
          scope={completeConfig.scope}
          showLegend={completeConfig.showLegend}
        />
      );
    }
    case VisualizationType.Count: {
      const BodyComponent = bodyMap[completeConfig.widgetType];
      return (
        <BodyComponent
          metric={completeConfig.metric}
          scope={completeConfig.scope}
          showTrendIndicator={completeConfig.showTrendIndicator}
        />
      );
    }
    case VisualizationType.RatingBadge: {
      const BodyComponent = bodyMap[completeConfig.widgetType];
      return (
        <BodyComponent
          metricKey={completeConfig.metricKey}
          scope={completeConfig.scope}
          showBreakdown={completeConfig.showBreakdown}
        />
      );
    }
    case VisualizationType.TopList: {
      const BodyComponent = bodyMap[VisualizationType.TopList];
      return (
        <BodyComponent
          limit={completeConfig.limit}
          metric={completeConfig.metric}
          rankBy={completeConfig.rankBy}
          scope={completeConfig.scope}
        />
      );
    }
    default:
      return null;
  }
}
