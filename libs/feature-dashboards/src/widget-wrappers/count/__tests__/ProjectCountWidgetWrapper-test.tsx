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

import { render } from '@testing-library/react';
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import { useDashboardMeasureQuery } from '~adapters/queries/dashboard-measure';
import { useProjectLegacyIssueCountWidgetQuery } from '~adapters/queries/project-count-widget-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { CountWidget } from '../../../components/visualizations/CountWidget';
import { DashboardMetricType, RichMetricKey } from '../../../data/widgets/shared';
import { CodeScope } from '../../../types/widget-common';
import { computeDashboardMeasureTrendData } from '../../../utils/countWidgetTrend';
import { ProjectCountWidgetWrapper } from '../ProjectCountWidgetWrapper';

jest.mock('~adapters/context/dashboardContext');
jest.mock('~adapters/queries/dashboard-measure');
jest.mock('~adapters/queries/project-count-widget-data');
jest.mock('~adapters/queries/widget-metric-metadata');
jest.mock('../../../components/visualizations/CountWidget', () => ({
  CountWidget: jest.fn(() => <div data-testid="count" />),
}));
jest.mock('../../../utils/countWidgetTrend');
jest.mock('../../../hooks/useMttrFormatters', () => ({
  useMttrFormatters: () => ({ formatMttr: String }),
}));

describe('ProjectCountWidgetWrapper', () => {
  it('converts the persisted metric before using the unified query', () => {
    const measure = {
      api: 'measures-history' as const,
      metricKey: MetricKey.coverage,
      scope: CodeScope.Overall,
    };
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: 'project',
      isLoading: false,
      organization: 'org',
      projectEntityId: 'branch',
    });
    jest.mocked(useDashboardMeasureQuery).mockReturnValue({
      data: {
        api: 'measures-history',
        history: [
          {
            date: '2026-08-30',
            measures: [{ metric: MetricKey.coverage, type: 'PERCENT', value: '82.5' }],
          },
        ],
      },
      isError: false,
      isPending: false,
    } as ReturnType<typeof useDashboardMeasureQuery>);
    jest.mocked(useWidgetMetricMetadataQuery).mockReturnValue({
      data: {
        [MetricKey.coverage]: {
          key: MetricKey.coverage,
          name: 'Coverage',
          type: MetricType.Percent,
        },
      },
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);

    render(
      <ProjectCountWidgetWrapper
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
      />,
    );

    expect(useDashboardMeasureQuery).toHaveBeenCalledWith(
      {
        entityId: 'branch',
        entityType: 'PROJECT_BRANCH',
        measure,
        months: undefined,
      },
      true,
    );
    expect(CountWidget).toHaveBeenCalledWith(
      expect.objectContaining({ metricKey: MetricKey.coverage, value: '82.5' }),
      undefined,
    );
  });

  it('uses the coerced display type for trend formatting', () => {
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: 'project',
      isLoading: false,
      organization: 'org',
      projectEntityId: 'branch',
    });
    jest.mocked(useDashboardMeasureQuery).mockReturnValue({
      data: {
        api: 'measures-history',
        history: [
          {
            date: '2026-07-30',
            measures: [{ metric: MetricKey.coverage, type: 'DATA', value: '70' }],
          },
          {
            date: '2026-08-30',
            measures: [{ metric: MetricKey.coverage, type: 'DATA', value: '80' }],
          },
        ],
      },
      isError: false,
      isPending: false,
    } as ReturnType<typeof useDashboardMeasureQuery>);
    jest.mocked(useWidgetMetricMetadataQuery).mockReturnValue({
      data: {
        [MetricKey.coverage]: {
          direction: 1,
          key: MetricKey.coverage,
          name: 'Coverage',
          type: MetricType.Data,
        },
      },
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useWidgetMetricMetadataQuery>);

    render(
      <ProjectCountWidgetWrapper
        metric={{ metricKey: MetricKey.coverage, type: DashboardMetricType.Raw }}
        scope={CodeScope.Overall}
        showTrendIndicator
      />,
    );

    expect(computeDashboardMeasureTrendData).toHaveBeenCalledWith(
      expect.objectContaining({
        metric: { direction: 1, type: MetricType.Integer },
      }),
    );
  });

  it('keeps new-code rich counts on the legacy snapshot query', () => {
    jest.mocked(useDashboardMeasureQuery).mockClear();
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: 'project',
      isLoading: false,
      organization: 'org',
      projectEntityId: 'branch',
    });
    jest.mocked(useProjectLegacyIssueCountWidgetQuery).mockReturnValue({
      data: 7,
      isLoading: false,
    });

    render(
      <ProjectCountWidgetWrapper
        metric={{ metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich }}
        scope={CodeScope.New}
        showTrendIndicator
      />,
    );

    expect(useProjectLegacyIssueCountWidgetQuery).toHaveBeenCalledWith(
      expect.objectContaining({ componentKey: 'project', scope: CodeScope.New }),
    );
    expect(useDashboardMeasureQuery).not.toHaveBeenCalled();
    expect(CountWidget).toHaveBeenCalledWith(
      expect.objectContaining({ showTrendIndicator: false, value: '7' }),
      undefined,
    );
  });
});
