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
import { useSearchParams } from 'react-router-dom';
import { isBranch, isPullRequest } from '~shared/helpers/branch-like';
import { ComponentQualifier } from '~shared/types/component';
import type {
  DashboardPortfolioContext,
  DashboardPortfolioMetric,
  DashboardProjectContext,
  ProjectCollectionEntityType,
} from '~shared/types/dashboard-context';
import type { MetricKey } from '~shared/types/metrics';
import { useComponent } from '../../context/componentContext/withComponentContext';
import { useComponentDataQuery } from '../../queries/component';
import { useComponentNavigationIdQuery } from '../../queries/navigation';
import { useCurrentBranchQuery } from '../queries/branch';
import { useWidgetMetricMetadataQuery } from '../queries/widget-metric-metadata';

// SQS-only: the context filter dropdown is not rendered on SQC, so these exports
// have no cloud counterpart.
// eslint-disable-next-line local-rules/adapter-api-parity
export const PORTFOLIO_CONTEXT_PARAM = 'context';

// eslint-disable-next-line local-rules/adapter-api-parity
export function usePortfolioContextEntityType(contextKey: string) {
  const { data, isPending } = useComponentDataQuery(
    { component: contextKey },
    { enabled: Boolean(contextKey) },
  );
  const entityType: ProjectCollectionEntityType =
    data?.component.qualifier === ComponentQualifier.Application ? 'APPLICATION' : 'PORTFOLIO';
  return { entityType, isPending: Boolean(contextKey) && isPending };
}

export function useDashboardProjectContext(): DashboardProjectContext {
  const { component, isPending } = useComponent();
  const { data: currentBranch, isPending: isBranchPending } = useCurrentBranchQuery(component);
  let projectEntityId: string | undefined;

  if (isBranch(currentBranch)) {
    projectEntityId = currentBranch.branchId;
  } else if (isPullRequest(currentBranch)) {
    projectEntityId = currentBranch.pullRequestId;
  }

  return {
    componentKey: component?.key ?? '',
    isLoading: Boolean(isPending) || isBranchPending,
    // Server has no organization concept. The project key is only used as a non-empty value by
    // the shared dashboard context; Server rule metadata queries do not consume it.
    organization: component?.key ?? '',
    projectEntityId,
  };
}

export function useDashboardPortfolioContext(): DashboardPortfolioContext {
  const { component } = useComponent();
  const [searchParams] = useSearchParams();
  const contextKey = searchParams.get(PORTFOLIO_CONTEXT_PARAM) ?? '';
  const targetComponentKey = contextKey || (component?.key ?? '');

  const { data: portfolioId } = useComponentNavigationIdQuery(
    { component: targetComponentKey },
    {
      enabled: Boolean(targetComponentKey),
    },
  );
  const { entityType, isPending: isEntityTypePending } = usePortfolioContextEntityType(contextKey);
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
    entityType,
    getPortfolioMetric,
    isEntityTypePending,
    portfolioId: portfolioId ?? '',
  };
}
