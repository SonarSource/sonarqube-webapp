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

import { Text } from '@sonarsource/echoes-react';
import { keepPreviousData } from '@tanstack/react-query';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { KeyboardHint } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import SourceViewer from '~sq-server-commons/components/SourceViewer/SourceViewer';
import FilesCounter from '~sq-server-commons/components/ui/FilesCounter';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { getComponentMeasureUniqueKey } from '~sq-server-commons/helpers/component';
import { SOFTWARE_QUALITY_RATING_METRICS_MAP } from '~sq-server-commons/helpers/constants';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import { RequestData } from '~sq-server-commons/helpers/request';
import { getProjectUrl } from '~sq-server-commons/helpers/urls';
import {
  useComponentTreeQuery,
  useMeasuresComponentQuery,
} from '~sq-server-commons/queries/measures';
import A11ySkipTarget from '~sq-server-commons/sonar-aligned/components/a11y/A11ySkipTarget';
import { useLocation, useRouter } from '~sq-server-commons/sonar-aligned/components/hoc/withRouter';
import { getBranchLikeQuery } from '~sq-server-commons/sonar-aligned/helpers/branch-like';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { isApplication, isFile, isView } from '~sq-server-commons/types/component';
import { MeasurePageView } from '~sq-server-commons/types/measures';
import {
  Component,
  ComponentMeasureEnhanced,
  ComponentMeasureIntern,
  Period,
} from '~sq-server-commons/types/types';
import { complementary } from '../config/complementary';
import FilesView from '../drilldown/FilesView';
import TreeMapView from '../drilldown/TreeMapView';
import { Query, enhanceComponent, parseQuery } from '../utils';
import MeasureContentHeader from './MeasureContentHeader';
import MeasureHeader from './MeasureHeader';
import MeasureViewSelect from './MeasureViewSelect';
import MeasuresBreadcrumbs from './MeasuresBreadcrumbs';

interface Props {
  leakPeriod?: Period;
  requestedMetric: Pick<Metric, 'key' | 'direction'>;
  rootComponent: Component;
  updateQuery: (query: Partial<Query>) => void;
}

export default function MeasureContent(props: Readonly<Props>) {
  const { leakPeriod, requestedMetric, rootComponent, updateQuery } = props;
  const metrics = useMetrics();
  const { query: rawQuery } = useLocation();
  const { data: branchLike } = useCurrentBranchQuery(rootComponent);
  const router = useRouter();
  const query = parseQuery(rawQuery);
  const { selected, asc, view } = query;

  const intl = useIntl();

  const containerRef = React.useRef<HTMLDivElement>(null);
  // if asc is undefined we dont want to pass it inside options
  const { metricKeys, opts, strategy } = getComponentRequestParams(
    view,
    requestedMetric,
    branchLike,
    {
      ...(asc !== undefined && { asc }),
    },
  );
  const componentKey = selected !== undefined && selected !== '' ? selected : rootComponent.key;
  const {
    data: treeData,
    isFetchingNextPage: fetchingMoreComponents,
    fetchNextPage,
  } = useComponentTreeQuery(
    {
      strategy,
      component: componentKey,
      metrics: metricKeys,
      additionalData: opts,
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const baseComponentMetrics = [requestedMetric.key];

  if (requestedMetric.key === MetricKey.ncloc) {
    baseComponentMetrics.push(MetricKey.ncloc_language_distribution);
  }
  if (SOFTWARE_QUALITY_RATING_METRICS_MAP[requestedMetric.key]) {
    baseComponentMetrics.push(SOFTWARE_QUALITY_RATING_METRICS_MAP[requestedMetric.key]);
  }

  const { data: measuresData } = useMeasuresComponentQuery(
    { componentKey, metricKeys: baseComponentMetrics, branchLike },
    { enabled: Boolean(componentKey) },
  );

  const [selectedComponent, setSelectedComponent] = React.useState<ComponentMeasureEnhanced>();

  const metric = treeData?.pages[0]?.metrics.find((m) => m.key === requestedMetric.key);
  if (metric !== undefined) {
    metric.direction = requestedMetric.direction;
  }

  const baseComponent = treeData?.pages[0].baseComponent;
  if (!baseComponent || !metric) {
    return null;
  }

  const components =
    treeData?.pages
      .flatMap((p) => p.components)
      .map((component) => enhanceComponent(component, metric, metrics)) ?? [];

  const measures = measuresData?.component.measures ?? [];
  const measure = measures.find((m) => m.metric === requestedMetric.key);
  const secondaryMeasure = measures.find((m) => m.metric !== requestedMetric.key);
  const measureValue =
    measure && (isDiffMetric(measure.metric) ? measure.period?.value : measure.value);
  const isFileComponent = isFile(baseComponent.qualifier);

  const paging = treeData?.pages[treeData?.pages.length - 1].paging;
  const totalComponents = treeData?.pages[0].paging.total;

  const getSelectedIndex = () => {
    const componentKey = isFile(baseComponent?.qualifier)
      ? getComponentMeasureUniqueKey(baseComponent)
      : getComponentMeasureUniqueKey(selectedComponent);
    const index = components.findIndex(
      (component) => getComponentMeasureUniqueKey(component) === componentKey,
    );
    return index !== -1 ? index : undefined;
  };
  const selectedIdx = getSelectedIndex();

  const updateSelected = (component: string) => {
    updateQuery({
      selected: component !== rootComponent.key ? component : undefined,
    });
  };

  const onOpenComponent = (component: ComponentMeasureIntern) => {
    if (isView(rootComponent.qualifier)) {
      const comp = components.find(
        (c) =>
          c.refKey === component.key ||
          getComponentMeasureUniqueKey(c) === getComponentMeasureUniqueKey(component),
      );

      if (comp) {
        router.push(getProjectUrl(comp.refKey ?? comp.key, component.branch));
      } else {
        updateSelected(component.key);
      }
    } else {
      updateSelected(component.key);
      if (containerRef.current) {
        containerRef.current.focus();
      }
    }
  };

  const handleSelectRow = (component: ComponentMeasureEnhanced) => {
    setSelectedComponent(component);
  };

  const renderMeasure = () => {
    if (view === MeasurePageView.list || view === MeasurePageView.tree) {
      return (
        <FilesView
          branchLike={branchLike}
          components={components}
          defaultShowBestMeasures={
            (asc !== undefined && view === MeasurePageView.list) || view === MeasurePageView.tree
          }
          fetchMore={fetchNextPage}
          handleOpen={onOpenComponent}
          handleSelect={handleSelectRow}
          loadingMore={fetchingMoreComponents}
          metric={metric}
          metrics={metrics}
          paging={paging}
          rootComponent={rootComponent}
          selectedComponent={selectedComponent}
          selectedIdx={selectedIdx}
          view={view}
        />
      );
    }

    return <TreeMapView components={components} handleSelect={onOpenComponent} metric={metric} />;
  };

  return (
    <div ref={containerRef}>
      <A11ySkipTarget anchor="measures_main" />

      <MeasureContentHeader
        left={
          <MeasuresBreadcrumbs
            backToFirst={view === MeasurePageView.list}
            branchLike={branchLike}
            className="sw-flex-1"
            component={baseComponent}
            handleSelect={onOpenComponent}
            rootComponent={rootComponent}
          />
        }
        right={
          <div className="sw-flex sw-items-center">
            {!isFileComponent && metric && (
              <>
                {!isApplication(baseComponent.qualifier) && (
                  <>
                    <Text
                      className="sw-whitespace-nowrap"
                      id="measures-view-selection-label"
                      isHighlighted
                    >
                      <FormattedMessage id="component_measures.view_as" />
                    </Text>
                    <MeasureViewSelect
                      className="measure-view-select sw-ml-2 sw-mr-4"
                      handleViewChange={(view) => {
                        updateQuery({ view });
                      }}
                      metric={metric}
                      view={view}
                    />
                  </>
                )}

                {view !== MeasurePageView.treemap && (
                  <>
                    <KeyboardHint
                      className="sw-mr-4 sw-ml-6"
                      command={`${KeyboardKeys.DownArrow} ${KeyboardKeys.UpArrow}`}
                      title={intl.formatMessage({ id: 'component_measures.select_files' })}
                    />

                    <KeyboardHint
                      command={`${KeyboardKeys.LeftArrow} ${KeyboardKeys.RightArrow}`}
                      title={intl.formatMessage({ id: 'component_measures.navigate' })}
                    />
                  </>
                )}

                {isDefined(totalComponents) && totalComponents > 0 && (
                  <FilesCounter
                    className="sw-min-w-24 sw-text-right"
                    current={
                      isDefined(selectedIdx) && view !== MeasurePageView.treemap
                        ? selectedIdx + 1
                        : undefined
                    }
                    total={totalComponents}
                  />
                )}
              </>
            )}
          </div>
        }
      />

      <div className="sw-p-6">
        <MeasureHeader
          branchLike={branchLike}
          component={baseComponent}
          leakPeriod={leakPeriod}
          measureValue={measureValue}
          metric={metric}
          secondaryMeasure={secondaryMeasure}
        />
        {isFileComponent ? (
          <div>
            <SourceViewer
              branchLike={branchLike}
              component={baseComponent.key}
              hideHeader
              metricKey={metric.key}
            />
          </div>
        ) : (
          renderMeasure()
        )}
      </div>
    </div>
  );
}

function getComponentRequestParams(
  view: MeasurePageView,
  metric: Pick<Metric, 'key' | 'direction'>,
  branchLike?: BranchLike,
  options: object = {},
) {
  const strategy: 'leaves' | 'children' = view === MeasurePageView.list ? 'leaves' : 'children';
  const metricKeys = [metric.key];
  const softwareQualityRatingMetric = SOFTWARE_QUALITY_RATING_METRICS_MAP[metric.key];
  if (softwareQualityRatingMetric) {
    metricKeys.push(softwareQualityRatingMetric);
  }
  const opts: RequestData = {
    ...getBranchLikeQuery(branchLike),
    additionalFields: 'metrics',
    ps: 500,
  };

  const setMetricSort = () => {
    const isDiff = isDiffMetric(metric.key);
    opts.s = isDiff ? 'metricPeriod' : 'metric';
    opts.metricSortFilter = 'withMeasuresOnly';
    if (isDiff) {
      opts.metricPeriodSort = 1;
    }
  };

  const isDiff = isDiffMetric(metric.key);
  if (view === MeasurePageView.tree) {
    metricKeys.push(...(complementary[metric.key] || []));
    opts.asc = true;
    opts.s = 'qualifier,name';
  } else if (view === MeasurePageView.list) {
    metricKeys.push(...(complementary[metric.key] || []));
    opts.asc = metric.direction === 1;
    opts.metricSort = metric.key;
    setMetricSort();
  } else if (view === MeasurePageView.treemap) {
    const sizeMetric = isDiff ? MetricKey.new_lines : MetricKey.ncloc;
    metricKeys.push(...(complementary[metric.key] || []));
    metricKeys.push(sizeMetric);
    opts.asc = false;
    opts.metricSort = sizeMetric;
    setMetricSort();
  }

  return { metricKeys, opts: { ...opts, ...options }, strategy };
}
