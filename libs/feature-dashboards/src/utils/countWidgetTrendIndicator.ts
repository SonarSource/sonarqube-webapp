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

import { CodeScope } from '../types/widget-common';
import type { CountConfig } from '../widget-creation-modal/state/widgetConfigTypes';
import { isIssueCountHistoryDashboardMetric } from './issueCountHistoryMetric';

export function isCountWidgetTrendIndicatorSupported(
  metric: CountConfig['metric'],
  scope: CodeScope,
): boolean {
  if (!isIssueCountHistoryDashboardMetric(metric)) {
    return true;
  }
  return scope !== CodeScope.New;
}

export function isCountWidgetTrendVisible(
  showTrendIndicator: boolean,
  metric: CountConfig['metric'],
  scope: CodeScope,
): boolean {
  return showTrendIndicator && isCountWidgetTrendIndicatorSupported(metric, scope);
}

export function clampCountTrendIndicator(countConfig: CountConfig): CountConfig {
  if (isCountWidgetTrendIndicatorSupported(countConfig.metric, countConfig.scope)) {
    return countConfig;
  }
  return { ...countConfig, showTrendIndicator: false };
}
