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

import { MetricKey } from '~shared/types/metrics';
import { DashboardMetricType } from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import { addWidgetToSection, createWidget } from '../widgetFactory';

const metric = { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw } as const;

describe('widgetFactory', () => {
  it('creates a widget with defaults and the requested position', () => {
    const widget = createWidget('count', { metric, scope: CodeScope.Overall }, { x: 2, y: 3 });

    expect(widget).toEqual(
      expect.objectContaining({
        dimensions: { height: 4, width: 3 },
        position: { x: 2, y: 3 },
        props: { metric, scope: CodeScope.Overall, showTrendIndicator: false },
        type: 'count',
      }),
    );
    expect(widget.key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('adds and normalizes a widget in a section without mutating the input', () => {
    const widget = createWidget('count', { metric, scope: CodeScope.Overall }, { x: 0, y: 0 });
    const section = { children: [], type: 'implicit' as const };

    const result = addWidgetToSection([section], 0, widget);

    expect(section.children).toHaveLength(0);
    expect(result[0].children).toEqual([widget]);
  });
});
