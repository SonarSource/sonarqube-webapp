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
import { DashboardMetricType, RichMetricKey } from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';
import {
  clampCountTrendIndicator,
  isCountWidgetTrendIndicatorSupported,
  isCountWidgetTrendVisible,
} from '../countWidgetTrendIndicator';

const rawMetric = {
  metricKey: MetricKey.coverage,
  type: DashboardMetricType.Raw,
} as const;

const richMetric = {
  measureFilters: {},
  metricKey: RichMetricKey.Issues,
  type: DashboardMetricType.Rich,
} as const;

describe('countWidgetTrendIndicator', () => {
  it('supports trend for raw measures', () => {
    expect(isCountWidgetTrendIndicatorSupported(rawMetric, CodeScope.Overall)).toBe(true);
    expect(isCountWidgetTrendIndicatorSupported(rawMetric, CodeScope.New)).toBe(true);
  });

  it('supports trend for overall issue-count-history metrics', () => {
    expect(isCountWidgetTrendIndicatorSupported(richMetric, CodeScope.Overall)).toBe(true);
  });

  it('does not support trend for new-code issue-count-history metrics', () => {
    expect(isCountWidgetTrendIndicatorSupported(richMetric, CodeScope.New)).toBe(false);
  });

  it('shows trend when enabled for raw measures regardless of scope', () => {
    expect(isCountWidgetTrendVisible(true, rawMetric, CodeScope.New)).toBe(true);
  });

  it('shows trend for overall issue counts when enabled in config', () => {
    expect(isCountWidgetTrendVisible(true, richMetric, CodeScope.Overall)).toBe(true);
  });

  it('hides trend for new-code issue counts even when enabled in config', () => {
    expect(isCountWidgetTrendVisible(true, richMetric, CodeScope.New)).toBe(false);
  });

  it('clamps trend off when scope is new code for issue counts', () => {
    expect(
      clampCountTrendIndicator({
        complete: true,
        metric: richMetric,
        scope: CodeScope.New,
        showTrendIndicator: true,
      }),
    ).toEqual({
      complete: true,
      metric: richMetric,
      scope: CodeScope.New,
      showTrendIndicator: false,
    });
  });
});
