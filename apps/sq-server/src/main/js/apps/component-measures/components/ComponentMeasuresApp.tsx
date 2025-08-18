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

import { withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Spinner, Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { useMeasuresComponentQuery } from '~adapters/queries/measures';
import { FlagMessage, LargeCenteredLayout, themeBorder, themeColor } from '~design-system';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { isPortfolioLike } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { enhanceMeasure } from '~sq-server-commons/components/measure/utils';
import '~sq-server-commons/components/search-navigator.css';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import HelpTooltip from '~sq-server-commons/sonar-aligned/components/controls/HelpTooltip';
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
  const { component } = React.useContext(ComponentContext);
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { query: rawQuery, pathname } = useLocation();
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
        <StyledMain className="sw-rounded-1 sw-mb-4">
          <MeasureOverview
            bubblesByDomain={bubblesByDomain}
            leakPeriod={leakPeriod}
            rootComponent={component}
            updateQuery={updateQuery}
          />
        </StyledMain>
      );
    }

    if (!metric) {
      return (
        <StyledMain className="sw-rounded-1 sw-p-6 sw-mb-4">
          <MeasuresEmpty />
        </StyledMain>
      );
    }

    const hideDrilldown =
      isPullRequest(branchLike) &&
      (metric.key === MetricKey.coverage || metric.key === MetricKey.duplicated_lines_density);

    if (hideDrilldown) {
      return (
        <StyledMain className="sw-rounded-1 sw-p-6 sw-mb-4">
          <Text isSubtle>{translate('component_measures.details_are_not_available')}</Text>
        </StyledMain>
      );
    }

    return (
      <StyledMain className="sw-rounded-1 sw-mb-4">
        <MeasureContent
          leakPeriod={leakPeriod}
          requestedMetric={metric}
          rootComponent={component}
          updateQuery={updateQuery}
        />
      </StyledMain>
    );
  };

  return (
    <LargeCenteredLayout className="sw-pt-8" id="component-measures">
      <Suggestions suggestionGroup="component_measures" />
      <Helmet defer={false} title={translate('layout.measures')} />

      <Spinner isLoading={isLoading} />

      {measures.length > 0 ? (
        <div className="sw-grid sw-grid-cols-12 sw-w-full">
          <Sidebar
            componentKey={componentKey}
            measures={measures}
            selectedMetric={metric ? metric.key : query.metric}
            showFullMeasures={showFullMeasures}
            updateQuery={updateQuery}
          />

          <div className="sw-col-span-9 sw-ml-12">
            {!component?.canBrowseAllChildProjects && isPortfolioLike(component?.qualifier) && (
              <FlagMessage className="sw-mb-4 it__portfolio_warning" variant="warning">
                {translate('component_measures.not_all_measures_are_shown')}
                <HelpTooltip
                  className="sw-ml-2"
                  overlay={translate('component_measures.not_all_measures_are_shown.help')}
                />
              </FlagMessage>
            )}
            {renderContent()}
          </div>
        </div>
      ) : (
        <StyledMain className="sw-rounded-1 sw-p-6 sw-mb-4">
          <MeasuresEmpty />
        </StyledMain>
      )}
    </LargeCenteredLayout>
  );
}

const StyledMain = withTheme(styled.main`
  background-color: ${themeColor('pageBlock')};
  border: ${themeBorder('default', 'pageBlockBorder')};
`);
