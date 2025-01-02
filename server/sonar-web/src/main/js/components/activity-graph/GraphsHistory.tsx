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

import { Spinner, Text } from '@sonarsource/echoes-react';
import { uniqBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { translate, translateWithParameters } from '../../helpers/l10n';
import { GraphType, MeasureHistory, ParsedAnalysis, Serie } from '../../types/project-activity';
import GraphHistory from './GraphHistory';
import { getSeriesMetricType, hasHistoryData, isCustomGraph } from './utils';

interface Props {
  analyses: ParsedAnalysis[];
  ariaLabel?: string;
  canShowDataAsTable?: boolean;
  graph: GraphType;
  graphEndDate?: Date;
  graphStartDate?: Date;
  graphs: Serie[][];
  leakPeriodDate?: Date;
  loading: boolean;
  measuresHistory: MeasureHistory[];
  removeCustomMetric?: (metric: string) => void;
  selectedDate?: Date;
  series: Serie[];
  updateGraphZoom?: (from?: Date, to?: Date) => void;
  updateSelectedDate?: (selectedDate?: Date) => void;
}

export default function GraphsHistory(props: Readonly<Props>) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(props.selectedDate);
  const { analyses, graph, loading, series, ariaLabel, canShowDataAsTable } = props;
  const isCustom = isCustomGraph(graph);
  const showAreas = [GraphType.coverage, GraphType.duplications].includes(graph);

  useEffect(() => {
    setSelectedDate(props.selectedDate);
  }, [props.selectedDate]);

  const graphsWithMeasures = useMemo(
    () =>
      props.graphs.map((graphSeries) => {
        const seriesNames = graphSeries.map(({ name }) => name);
        const relevantMeasures = props.measuresHistory.filter(({ metric }) =>
          seriesNames.includes(metric),
        );

        return {
          graph: graphSeries,
          relevantMeasures,
        };
      }),
    [props.graphs, props.measuresHistory],
  );

  const updateTooltip = (newSelectedDate?: Date) => {
    setSelectedDate(newSelectedDate);
  };

  return (
    <div className="sw-flex sw-justify-center sw-flex-col sw-items-stretch sw-text-center sw-grow">
      <output aria-busy={loading}>
        <Spinner isLoading={loading}>
          {!hasHistoryData(series) && (
            <Text isSubdued className="sw-max-w-full">
              {translate(
                isCustom
                  ? 'project_activity.graphs.custom.no_history'
                  : 'component_measures.no_history',
              )}
            </Text>
          )}
        </Spinner>
      </output>

      {hasHistoryData(series) && !loading && (
        <>
          {graphsWithMeasures.map((graphSeries, idx) => {
            return (
              <GraphHistory
                analyses={analyses}
                canShowDataAsTable={canShowDataAsTable}
                graph={graph}
                graphEndDate={props.graphEndDate}
                graphStartDate={props.graphStartDate}
                isCustom={isCustom}
                key={idx}
                leakPeriodDate={props.leakPeriodDate}
                measuresHistory={graphSeries.relevantMeasures}
                metricsType={getSeriesMetricType(graphSeries.graph)}
                removeCustomMetric={props.removeCustomMetric}
                selectedDate={selectedDate}
                series={graphSeries.graph}
                graphDescription={
                  ariaLabel ??
                  translateWithParameters(
                    'project_activity.graphs.explanation_x',
                    uniqBy(graphSeries.graph, 'name')
                      .map(({ translatedName }) => translatedName)
                      .join(', '),
                  )
                }
                showAreas={showAreas}
                updateGraphZoom={props.updateGraphZoom}
                updateSelectedDate={props.updateSelectedDate}
                updateTooltip={updateTooltip}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
