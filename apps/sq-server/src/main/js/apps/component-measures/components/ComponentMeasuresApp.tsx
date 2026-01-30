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

import { Card, MessageCallout, Spinner, Text, ToggleTip } from '@sonarsource/echoes-react';
import { useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { useMeasuresComponentQuery } from '~adapters/queries/measures';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { isPortfolioLike } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { enhanceMeasure } from '~sq-server-commons/components/measure/utils';
import '~sq-server-commons/components/search-navigator.css';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { MeasurePageView } from '~sq-server-commons/types/measures';
import { useBubbleChartMetrics } from '../hooks';
import Sidebar from '../sidebar/Sidebar';
import {
  Query,
  banQualityGateMeasure,
  filterMeasures,
  getMeasuresPageMetricKeys,
  groupByDomains,
  hasBubbleChart,
  hasFullMeasures,
  hasTree,
  hasTreemap,
  parseQuery,
  serializeQuery,
  sortMeasures,
} from '../utils';
import MeasureContent from './MeasureContent';
import MeasureOverview from './MeasureOverview';
import MeasuresEmpty from './MeasuresEmpty';

export default function ComponentMeasuresApp() {
  const { component } = useContext(ComponentContext);
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { query: rawQuery, pathname } = useLocation();
  const intl = useIntl();
  const query = parseQuery(rawQuery);
  const router = useRouter();
  const metrics = useMetrics();
  const filteredMetrics = getMeasuresPageMetricKeys(metrics, branchLike);
  const componentKey =
    query.selected !== undefined && query.selected !== '' ? query.selected : (component?.key ?? '');

  const { data: { component: componentWithMeasures, period } = {}, isLoading } =
    useMeasuresComponentQuery(
      { componentKey, metricKeys: filteredMetrics, branchLike },
      { enabled: Boolean(componentKey) },
    );

  const measures = (
    componentWithMeasures
      ? filterMeasures(
          banQualityGateMeasure(componentWithMeasures).map((measure) =>
            enhanceMeasure(measure, metrics),
          ),
        )
      : []
  ).filter((measure) => measure.value !== undefined || measure.leak !== undefined);
  const bubblesByDomain = useBubbleChartMetrics(measures);

  const leakPeriod =
    componentWithMeasures?.qualifier === ComponentQualifier.Project ? period : undefined;
  const displayOverview = hasBubbleChart(bubblesByDomain, query.metric);

  if (!component) {
    return null;
  }

  const getSelectedMetric = (query: Query, displayOverview: boolean) => {
    if (displayOverview) {
      return undefined;
    }

    const metric = metrics[query.metric];

    if (!metric) {
      const domainMeasures = groupByDomains(measures);
      const firstMeasure =
        domainMeasures[0] && sortMeasures(domainMeasures[0].name, domainMeasures[0].measures)[0];

      if (firstMeasure && typeof firstMeasure !== 'string') {
        return firstMeasure.metric;
      }
    }
    return metric;
  };

  const metric = getSelectedMetric(query, displayOverview);

  const updateQuery = (newQuery: Partial<Query>) => {
    const nextQuery: Query = { ...parseQuery(query), ...newQuery };
    const metric = getSelectedMetric(nextQuery, false);

    if (metric) {
      if (query.view === MeasurePageView.treemap && !hasTreemap(metric.key, metric.type)) {
        query.view = MeasurePageView.tree;
      } else if (query.view === MeasurePageView.tree && !hasTree(metric.key)) {
        query.view = MeasurePageView.list;
      }
    }

    router.push({
      pathname,
      query: {
        ...serializeQuery(nextQuery),
        ...getBranchLikeQuery(branchLike),
        id: component?.key,
      },
    });
  };

  const showFullMeasures = hasFullMeasures(branchLike);

  const renderContent = () => {
    if (displayOverview) {
      return (
        <MeasureOverview
          bubblesByDomain={bubblesByDomain}
          leakPeriod={leakPeriod}
          rootComponent={component}
          updateQuery={updateQuery}
        />
      );
    }

    if (!metric) {
      return <MeasuresEmpty />;
    }

    const hideDrilldown =
      isPullRequest(branchLike) &&
      (metric.key === MetricKey.coverage || metric.key === MetricKey.duplicated_lines_density);

    if (hideDrilldown) {
      return (
        <Text as="div" className="sw-my-3 sw-mx-6" isSubtle>
          <FormattedMessage id="component_measures.details_are_not_available" />
        </Text>
      );
    }

    return (
      <MeasureContent
        leakPeriod={leakPeriod}
        requestedMetric={metric}
        rootComponent={component}
        updateQuery={updateQuery}
      />
    );
  };

  return (
    <ProjectPageTemplate
      asideLeft={
        <Sidebar
          componentKey={componentKey}
          measures={measures}
          selectedMetric={metric ? metric.key : query.metric}
          showFullMeasures={showFullMeasures}
          updateQuery={updateQuery}
        />
      }
      title={intl.formatMessage({ id: 'layout.measures' })}
    >
      <Suggestions suggestionGroup="component_measures" />

      <Card>
        <Spinner className="sw-my-3 sw-mx-6" isLoading={isLoading}>
          <Card.Body insetContent>
            {measures.length > 0 ? (
              <div id="component-measures">
                {!component?.canBrowseAllChildProjects && isPortfolioLike(component?.qualifier) && (
                  <MessageCallout
                    className="sw-my-3 sw-mx-6 it__portfolio_warning"
                    variety="warning"
                  >
                    <div className="sw-flex sw-items-center">
                      <FormattedMessage id="component_measures.not_all_measures_are_shown" />
                      <ToggleTip
                        className="sw-ml-2"
                        description={
                          <FormattedMessage id="component_measures.not_all_measures_are_shown.help" />
                        }
                      />
                    </div>
                  </MessageCallout>
                )}
                {renderContent()}
              </div>
            ) : (
              <MeasuresEmpty />
            )}
          </Card.Body>
        </Spinner>
      </Card>
    </ProjectPageTemplate>
  );
}
