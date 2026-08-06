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
import type {
  DashboardPortfolioContext,
  DashboardPortfolioMetric,
  DashboardProjectContext,
} from '~shared/types/dashboard-context';
import type { MetricKey } from '~shared/types/metrics';
import { useComponent } from '../../context/componentContext/withComponentContext';
import { useWidgetMetricMetadataQuery } from '../queries/widget-metric-metadata';

export function useDashboardProjectContext(): DashboardProjectContext {
  const { component, isPending } = useComponent();

  return {
    componentKey: component?.key ?? '',
    isLoading: Boolean(isPending),
    organization: '',
    projectEntityId: component?.key,
  };
}

export function useDashboardPortfolioContext(): DashboardPortfolioContext {
  const { component } = useComponent();
  const { data: metrics } = useWidgetMetricMetadataQuery();
  const getPortfolioMetric = useCallback(
    (key: MetricKey): DashboardPortfolioMetric | undefined => {
      const metric = metrics?.[key];
      if (metric === undefined) {
        return undefined;
      }

      return {
        direction: metric.direction,
        key: metric.key,
        type: metric.type,
      };
    },
    [metrics],
  );

  return {
    getPortfolioMetric,
    portfolioId: component?.key ?? '',
  };
}
