/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { Spinner } from '@sonarsource/echoes-react';
import SourceViewer from '~sq-server-commons/components/SourceViewer/SourceViewer';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { getProjectUrl } from '~sq-server-commons/helpers/urls';
import { useCurrentBranchQuery } from '~sq-server-commons/queries/branch';
import { useComponentDataQuery } from '~sq-server-commons/queries/component';
import { useComponentTreeQuery } from '~sq-server-commons/queries/measures';
import A11ySkipTarget from '~sq-server-commons/sonar-aligned/components/a11y/A11ySkipTarget';
import { useLocation, useRouter } from '~sq-server-commons/sonar-aligned/components/hoc/withRouter';
import { getBranchLikeQuery } from '~sq-server-commons/sonar-aligned/helpers/branch-like';
import { isFile, isView } from '~sq-server-commons/types/component';
import { Component, ComponentMeasureIntern, Period } from '~sq-server-commons/types/types';
import { BubblesByDomain } from '../config/bubbles';
import BubbleChartView from '../drilldown/BubbleChartView';
import {
  BUBBLES_FETCH_LIMIT,
  enhanceComponent,
  getBubbleMetrics,
  hasFullMeasures,
  parseQuery,
  Query,
} from '../utils';
import LeakPeriodLegend from './LeakPeriodLegend';
import MeasureContentHeader from './MeasureContentHeader';
import MeasuresBreadcrumbs from './MeasuresBreadcrumbs';

interface Props {
  bubblesByDomain: BubblesByDomain;
  leakPeriod?: Period;
  rootComponent: Component;
  updateQuery: (query: Partial<Query>) => void;
}

export default function MeasureOverview(props: Readonly<Props>) {
  const { leakPeriod, updateQuery, rootComponent, bubblesByDomain } = props;
  const metrics = useMetrics();
  const { data: branchLike } = useCurrentBranchQuery(rootComponent);
  const router = useRouter();
  const { query } = useLocation();
  const { selected, metric: domain } = parseQuery(query);
  // eslint-disable-next-line local-rules/no-implicit-coercion
  const componentKey = selected || rootComponent.key;
  const { data: componentData, isLoading: loadingComponent } = useComponentDataQuery(
    {
      ...getBranchLikeQuery(branchLike),
      component: componentKey,
    },
    { enabled: Boolean(componentKey) },
  );

  const component = componentData?.component;
  const { x, y, size, colors } = getBubbleMetrics(bubblesByDomain, domain, metrics);
  const metricsKey = [x.key, y.key, size.key];
  if (colors) {
    metricsKey.push(...colors.map((metric) => metric.key));
  }
  const { data: bubblesData, isLoading: loadingBubbles } = useComponentTreeQuery(
    {
      strategy: 'leaves',
      metrics: metricsKey,
      component: component?.key ?? '',
      additionalData: {
        ...getBranchLikeQuery(branchLike),
        s: 'metric',
        metricSort: size.key,
        asc: false,
        ps: BUBBLES_FETCH_LIMIT,
      },
    },
    {
      enabled: Boolean(component),
    },
  );

  const components = (bubblesData?.pages?.[0]?.components ?? []).map((c) =>
    enhanceComponent(c, undefined, metrics),
  );
  const paging = bubblesData?.pages?.[0]?.paging;

  if (!component) {
    return null;
  }

  const loading = loadingComponent || loadingBubbles;

  const updateSelected = (selectedComponent: ComponentMeasureIntern) => {
    if (component && isView(component.qualifier)) {
      router.push(
        getProjectUrl(selectedComponent.refKey ?? selectedComponent.key, selectedComponent.branch),
      );
    } else {
      updateQuery({
        selected: selectedComponent.key !== rootComponent.key ? selectedComponent.key : undefined,
      });
    }
  };
  const displayLeak = hasFullMeasures(branchLike);
  const isFileComponent = isFile(component.qualifier);

  return (
    <div>
      <A11ySkipTarget anchor="measures_main" />

      <MeasureContentHeader
        left={
          <MeasuresBreadcrumbs
            backToFirst
            branchLike={branchLike}
            component={component}
            handleSelect={updateSelected}
            rootComponent={rootComponent}
          />
        }
        right={
          leakPeriod &&
          displayLeak && <LeakPeriodLegend component={component} period={leakPeriod} />
        }
      />

      <div className="sw-p-6">
        <Spinner isLoading={loading}>
          {isFileComponent && (
            <div className="measure-details-viewer">
              <SourceViewer branchLike={branchLike} component={component.key} hideHeader />
            </div>
          )}
          {!isFileComponent && (
            <BubbleChartView
              branchLike={branchLike}
              bubblesByDomain={bubblesByDomain}
              component={component}
              components={components}
              domain={domain}
              metrics={metrics}
              paging={paging}
              updateSelected={updateSelected}
            />
          )}
        </Spinner>
      </div>
    </div>
  );
}
