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

import { isCoverageMetric } from '~shared/helpers/metrics';
import { NewCodeLegend } from '../../design-system';
import { translate } from '../../helpers/l10n';
import { Serie } from '../../types/project-activity';
import Tooltip from '../controls/Tooltip';
import { GraphsLegendItem } from './GraphsLegendItem';
import { hasDataValues } from './utils';

export interface GraphsLegendCustomProps {
  leakPeriodDate?: Date;
  removeMetric: (metric: string) => void;
  series: Serie[];
}

function getNoHistoryMessage(metricKey: string) {
  return translate(
    isCoverageMetric(metricKey)
      ? 'project_activity.graphs.custom.metric_no_history.coverage'
      : 'project_activity.graphs.custom.metric_no_history',
  );
}

export default function GraphsLegendCustom(props: GraphsLegendCustomProps) {
  const { leakPeriodDate, series, removeMetric } = props;

  return (
    <ul className="activity-graph-legends sw-flex sw-justify-center sw-items-center sw-pb-4">
      {series.map((serie, idx) => {
        const hasData = hasDataValues(serie);

        const legendItem = (
          <GraphsLegendItem
            index={idx}
            metric={serie.name}
            name={serie.translatedName}
            removeMetric={removeMetric}
            showWarning={!hasData}
          />
        );

        if (!hasData) {
          const noHistoryMessage = getNoHistoryMessage(serie.name);
          return (
            <li aria-label={noHistoryMessage} className="sw-mx-2" key={serie.name}>
              <Tooltip content={noHistoryMessage}>
                <span>{legendItem}</span>
              </Tooltip>
            </li>
          );
        }

        return (
          <li className="sw-ml-3" key={serie.name}>
            {legendItem}
          </li>
        );
      })}
      {leakPeriodDate && (
        <li key={translate('hotspot.filters.period.since_leak_period')}>
          <NewCodeLegend
            className="sw-ml-3 sw-mr-4"
            text={translate('hotspot.filters.period.since_leak_period')}
          />
        </li>
      )}
    </ul>
  );
}
