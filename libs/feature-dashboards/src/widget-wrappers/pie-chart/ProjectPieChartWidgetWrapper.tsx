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
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import { getProjectDashboardPieChartSegmentUrl } from '~adapters/helpers/dashboard-widget-urls';
import { useOrganizationPieChartData } from '~adapters/queries/pie-chart-widget-data';
import {
  projectPieChartUsesLegacyIssueData,
  useProjectPieChartSegmentsLegacyQuery,
} from '~adapters/queries/project-pie-chart-widget-data';
import { isTransientDashboardWidgetFetchError } from '~shared/helpers/dashboard-error-reporting';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { buildPieChartAriaLabel } from '../../components/pie-chart/pieChartAriaLabel';
import { getPieChartTitle } from '../../components/pie-chart/pieChartHeaderText';
import { InteractivePieChart } from '../../components/visualizations/pie-chart/InteractivePieChart';
import { PieChartWidgetProps } from '../../types/dashboard-widget';
import { PieChartPastry, PieChartSegment } from '../../types/visualization';

enum PieWidgetState {
  Error = 'ERROR',
  NoData = 'NO_DATA',
  Pending = 'PENDING',
  Ready = 'READY',
}

function getPieWidgetState(args: {
  hasEntityKey: boolean;
  hasPieError: boolean;
  hasSegments: boolean;
  isPending: boolean;
}): PieWidgetState {
  const { hasEntityKey, hasPieError, hasSegments, isPending } = args;

  if (hasPieError) {
    return PieWidgetState.Error;
  }
  if (!hasEntityKey) {
    return PieWidgetState.NoData;
  }
  if (isPending) {
    return PieWidgetState.Pending;
  }
  if (!hasSegments) {
    return PieWidgetState.NoData;
  }
  return PieWidgetState.Ready;
}

function useProjectPieChartModelOrganizations(
  branchEntityId: string,
  projectKey: string,
  organization: string,
  widget: Readonly<PieChartWidgetProps>,
): ReturnType<typeof useOrganizationPieChartData> {
  return useOrganizationPieChartData({
    entity: { entityId: branchEntityId, entityType: 'PROJECT_BRANCH' },
    organization,
    projectKey,
    widget,
  });
}

type ProjectPieChartViewProps = Readonly<{
  error: unknown;
  hasEntityKey: boolean;
  isPending: boolean;
  projectKey: string;
  segments: PieChartSegment[];
  widget: PieChartWidgetProps;
}>;

function ProjectPieChartView(props: ProjectPieChartViewProps) {
  const { error, hasEntityKey, isPending, projectKey, segments, widget } = props;
  const navigate = useNavigate();
  const { formatMessage } = useIntl();
  const { filter, metric, pastry = PieChartPastry.Pie, showLegend, slice } = widget;

  const resolveSegmentNavigationUrl = useCallback(
    (segment: PieChartSegment): string | undefined => {
      if (segment.value.startsWith('OTHER_')) {
        return undefined;
      }
      return getProjectDashboardPieChartSegmentUrl(projectKey, segment.value, widget);
    },
    [projectKey, widget],
  );

  const handleSegmentClick = useCallback(
    (segment: PieChartSegment) => {
      const url = resolveSegmentNavigationUrl(segment);
      if (url !== undefined) {
        navigate(url);
      }
    },
    [navigate, resolveSegmentNavigationUrl],
  );

  const state = getPieWidgetState({
    hasEntityKey,
    hasPieError: Boolean(error),
    hasSegments: segments.length > 0,
    isPending,
  });

  if (state === PieWidgetState.Error) {
    if (isTransientDashboardWidgetFetchError(error)) {
      return <WidgetNoData />;
    }

    throw error;
  }
  if (state === PieWidgetState.Pending) {
    return <WidgetLoadingSpinner />;
  }
  if (state === PieWidgetState.NoData) {
    return <WidgetNoData />;
  }

  const title = getPieChartTitle(formatMessage, {
    filter,
    isPortfolioDashboard: false,
    metric,
    slice,
  });
  const ariaLabel = buildPieChartAriaLabel(formatMessage, { segments, title });

  return (
    <InteractivePieChart
      ariaLabel={ariaLabel}
      getSegmentUrl={resolveSegmentNavigationUrl}
      onSegmentClick={handleSegmentClick}
      pastry={pastry}
      segments={segments}
      showLegend={showLegend ?? false}
    />
  );
}

function ProjectPieChartWidgetLegacyView(
  props: Readonly<{ projectKey: string; widget: Readonly<PieChartWidgetProps> }>,
) {
  const { projectKey, widget } = props;
  const { error, isPending, segments } = useProjectPieChartSegmentsLegacyQuery(widget, projectKey);

  return (
    <ProjectPieChartView
      error={error}
      hasEntityKey={Boolean(projectKey)}
      isPending={isPending}
      projectKey={projectKey}
      segments={segments}
      widget={widget}
    />
  );
}

function ProjectPieChartWidgetOrganizationsContent(
  props: Readonly<{
    branchEntityId: string;
    organization: string;
    projectKey: string;
    widget: Readonly<PieChartWidgetProps>;
  }>,
) {
  const { branchEntityId, organization, projectKey, widget } = props;
  const { error, isPending, segments } = useProjectPieChartModelOrganizations(
    branchEntityId,
    projectKey,
    organization,
    widget,
  );

  return (
    <ProjectPieChartView
      error={error}
      hasEntityKey={Boolean(branchEntityId)}
      isPending={isPending}
      projectKey={projectKey}
      segments={segments}
      widget={widget}
    />
  );
}

function ProjectPieChartWidgetOrganizationsView(
  props: Readonly<{
    branchEntityId: string;
    organization: string;
    projectKey: string;
    widget: Readonly<PieChartWidgetProps>;
  }>,
) {
  const { projectKey, widget } = props;

  if (projectPieChartUsesLegacyIssueData(widget)) {
    return <ProjectPieChartWidgetLegacyView projectKey={projectKey} widget={widget} />;
  }

  return <ProjectPieChartWidgetOrganizationsContent {...props} />;
}

export function ProjectPieChartWidgetWrapper(props: Readonly<PieChartWidgetProps>) {
  const {
    componentKey: projectKey,
    isLoading,
    organization,
    projectEntityId,
  } = useDashboardProjectContext();

  if (isLoading) {
    return <WidgetLoadingSpinner />;
  }
  if (!projectEntityId || !projectKey) {
    return <WidgetNoData />;
  }

  return (
    <ProjectPieChartWidgetOrganizationsView
      branchEntityId={projectEntityId}
      organization={organization}
      projectKey={projectKey}
      widget={props}
    />
  );
}
