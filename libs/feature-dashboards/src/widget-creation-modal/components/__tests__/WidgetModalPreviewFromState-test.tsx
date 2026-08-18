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

import { screen } from '@testing-library/react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { WidgetNoData } from '../../../components/common/WidgetNoData';
import type { WidgetBodyMap, WidgetHeaderMap } from '../../../dashboard-layout/logic/types';
import {
  DashboardMetricType,
  type ProjectDashboardWidgetPropMap,
} from '../../../types/dashboard-widget';
import { CodeScope, VisualizationType } from '../../../types/widget-common';
import { WidgetModalPreviewFromState } from '../WidgetModalPreviewFromState';

describe('WidgetModalPreviewFromState', () => {
  const noopHeader = () => null;
  const noopBody = () => null;

  const headerMap: WidgetHeaderMap<ProjectDashboardWidgetPropMap> = {
    count: noopHeader,
    donutChart: noopHeader,
    lineChart: noopHeader,
    pieChart: noopHeader,
    ratingBadge: noopHeader,
    topList: noopHeader,
  };

  const bodyMap = {
    count: noopBody,
    donutChart: noopBody,
    lineChart: noopBody,
    pieChart: noopBody,
    ratingBadge: noopBody,
    topList: noopBody,
  } as unknown as WidgetBodyMap<ProjectDashboardWidgetPropMap>;

  it('passes extractCompleteConfig result into the preview tree', () => {
    renderWithRouter(
      <WidgetModalPreviewFromState
        bodyMap={bodyMap}
        extractCompleteConfig={() => null}
        headerMap={headerMap}
        state={{}}
      />,
    );

    expect(screen.getByTestId('widget-preview-pane')).toBeInTheDocument();
    expect(screen.getByText('dashboard.add_widget_modal.preview.placeholder')).toBeInTheDocument();
  });

  it('centers no-data states in the configured widget preview body', () => {
    renderWithRouter(
      <WidgetModalPreviewFromState
        bodyMap={{
          ...bodyMap,
          count: () => <WidgetNoData />,
        }}
        extractCompleteConfig={() => ({
          metric: {
            metricKey: MetricKey.bugs,
            type: DashboardMetricType.Raw,
          },
          scope: CodeScope.Overall,
          widgetType: VisualizationType.Count,
        })}
        headerMap={headerMap}
        state={{}}
      />,
    );

    expect(screen.getByText('dashboard.widget.no_data')).toBeInTheDocument();
    expect(screen.getByTestId('widget-preview-body')).toHaveClass(
      'sw-flex',
      'sw-flex-1',
      'sw-min-h-0',
      'sw-flex-col',
      'sw-justify-center',
    );
  });
});
