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

import { fireEvent, screen } from '@testing-library/react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import type { WidgetBodyMap, WidgetHeaderMap } from '../../../dashboard-layout/logic/types';
import {
  DashboardMetricType,
  RichMetricKey,
  type ProjectDashboardWidgetPropMap,
} from '../../../types/dashboard-widget';
import {
  CodeScope,
  TopListLimit,
  TopListRankBy,
  VisualizationType,
} from '../../../types/widget-common';
import { ConfigureWidgetPreview } from '../ConfigureWidgetPreview';

describe('ConfigureWidgetPreview', () => {
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

  const bodyMap: WidgetBodyMap<ProjectDashboardWidgetPropMap> = {
    count: noopBody,
    donutChart: noopBody,
    lineChart: noopBody,
    pieChart: noopBody,
    ratingBadge: noopBody,
    topList: noopBody,
  };

  it('shows placeholder when complete config is null', () => {
    renderWithRouter(
      <ConfigureWidgetPreview bodyMap={bodyMap} completeConfig={null} headerMap={headerMap} />,
    );

    expect(screen.getByTestId('widget-preview-pane')).toBeInTheDocument();
    expect(screen.getByText('dashboard.add_widget_modal.preview.placeholder')).toBeInTheDocument();
  });

  it('renders top list header and body when config is complete', () => {
    function TopListHeader() {
      return <div data-testid="top-list-preview-header" />;
    }

    function TopListBody() {
      return <div data-testid="top-list-preview-body" />;
    }

    renderWithRouter(
      <ConfigureWidgetPreview
        bodyMap={{ ...bodyMap, topList: TopListBody }}
        completeConfig={{
          widgetType: VisualizationType.TopList,
          limit: TopListLimit.Five,
          metric: {
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        }}
        headerMap={{ ...headerMap, topList: TopListHeader }}
      />,
    );

    expect(screen.getByTestId('top-list-preview-header')).toBeInTheDocument();
    expect(screen.getByTestId('top-list-preview-body')).toBeInTheDocument();
    expect(screen.getByTestId('widget-preview-body')).toBeInTheDocument();
  });

  it('blocks click actions in the preview body', () => {
    function TopListBody() {
      return <button type="button">Preview action</button>;
    }

    renderWithRouter(
      <ConfigureWidgetPreview
        bodyMap={{ ...bodyMap, topList: TopListBody }}
        completeConfig={{
          widgetType: VisualizationType.TopList,
          limit: TopListLimit.Five,
          metric: {
            metricKey: RichMetricKey.Issues,
            type: DashboardMetricType.Rich,
          },
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        }}
        headerMap={headerMap}
      />,
    );

    const previewBody = screen.getByTestId('widget-preview-body');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefault = jest.spyOn(clickEvent, 'preventDefault');
    const stopPropagation = jest.spyOn(clickEvent, 'stopPropagation');

    fireEvent(previewBody, clickEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });
});
