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

import { ButtonGroup, Select } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Metric } from '~shared/types/measures';
import { translate } from '../../helpers/l10n';
import { GraphType } from '../../types/project-activity';
import AddGraphMetric from './AddGraphMetric';
import { getGraphTypes, isCustomGraph } from './utils';

interface Props {
  className?: string;
  graph: GraphType;
  metrics: Metric[];
  metricsTypeFilter?: string[];
  onAddCustomMetric?: (metric: string) => void;
  onRemoveCustomMetric?: (metric: string) => void;
  onUpdateGraph: (graphType: string) => void;
  selectedMetrics?: string[];
}

export default function GraphsHeader(props: Readonly<Props>) {
  const {
    className,
    graph,
    metrics,
    metricsTypeFilter,
    onUpdateGraph,
    selectedMetrics = [],
  } = props;

  const handleGraphChange = React.useCallback(
    (value: GraphType) => {
      if (value !== graph) {
        onUpdateGraph(value);
      }
    },
    [graph, onUpdateGraph],
  );

  const noCustomGraph =
    props.onAddCustomMetric === undefined || props.onRemoveCustomMetric === undefined;

  return (
    <div className={className}>
      <ButtonGroup>
        <label className="sw-typo-semibold" htmlFor="graph-type">
          {translate('project_activity.graphs.choose_type')}
        </label>
        <Select
          data={getGraphTypes(noCustomGraph).map((type) => ({
            value: type,
            label: translate('project_activity.graphs', type),
          }))}
          hasDropdownAutoWidth
          id="graph-type"
          isNotClearable
          onChange={handleGraphChange}
          value={graph}
          width="small"
        />

        {isCustomGraph(graph) &&
          props.onAddCustomMetric !== undefined &&
          props.onRemoveCustomMetric !== undefined && (
            <AddGraphMetric
              metrics={metrics}
              metricsTypeFilter={metricsTypeFilter}
              onAddMetric={props.onAddCustomMetric}
              onRemoveMetric={props.onRemoveCustomMetric}
              selectedMetrics={selectedMetrics}
            />
          )}
      </ButtonGroup>
    </div>
  );
}
