/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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

import { ThemeProp, themeColor, withTheme } from 'design-system';
import * as React from 'react';
import { Popup, PopupPlacement } from '../../components/ui/popups';
import { isDefined } from '../../helpers/types';
import { AnalysisEvent, GraphType, MeasureHistory, Serie } from '../../types/project-activity';
import DateTimeFormatter from '../intl/DateTimeFormatter';
import GraphsTooltipsContent from './GraphsTooltipsContent';
import GraphsTooltipsContentCoverage from './GraphsTooltipsContentCoverage';
import GraphsTooltipsContentDuplication from './GraphsTooltipsContentDuplication';
import GraphsTooltipsContentEvents from './GraphsTooltipsContentEvents';
import GraphsTooltipsContentIssues from './GraphsTooltipsContentIssues';
import { DEFAULT_GRAPH } from './utils';

interface PropsWithoutTheme {
  events: AnalysisEvent[];
  formatValue: (tick: number | string) => string;
  graph: string;
  graphWidth: number;
  measuresHistory: MeasureHistory[];
  selectedDate: Date;
  series: Serie[];
  tooltipIdx: number;
  tooltipPos: number;
}

export type Props = PropsWithoutTheme & ThemeProp;

const TOOLTIP_WIDTH = 280;
const TOOLTIP_LEFT_MARGIN = 60;
const TOOLTIP_LEFT_FLIP_THRESHOLD = 50;

export class GraphsTooltipsClass extends React.PureComponent<Props> {
  renderContent() {
    const { tooltipIdx, series, graph, measuresHistory } = this.props;

    return series.map((serie, idx) => {
      const point = serie.data[tooltipIdx];

      if (!point || (!point.y && point.y !== 0)) {
        return null;
      }

      if (graph === DEFAULT_GRAPH) {
        return (
          <GraphsTooltipsContentIssues
            index={idx}
            key={serie.name}
            measuresHistory={measuresHistory}
            name={serie.name}
            tooltipIdx={tooltipIdx}
            translatedName={serie.translatedName}
            value={this.props.formatValue(point.y)}
          />
        );
      }

      return (
        <GraphsTooltipsContent
          index={idx}
          key={serie.name}
          name={serie.name}
          translatedName={serie.translatedName}
          value={this.props.formatValue(point.y)}
        />
      );
    });
  }

  render() {
    const {
      events,
      measuresHistory,
      tooltipIdx,
      tooltipPos,
      graph,
      graphWidth,
      selectedDate,
      theme,
    } = this.props;

    const top = 30;
    let left = tooltipPos + TOOLTIP_LEFT_MARGIN;
    let placement = PopupPlacement.RightTop;

    if (left > graphWidth - TOOLTIP_WIDTH - TOOLTIP_LEFT_FLIP_THRESHOLD) {
      left -= TOOLTIP_WIDTH;
      placement = PopupPlacement.LeftTop;
    }

    const tooltipContent = this.renderContent().filter(isDefined);
    const addSeparator = tooltipContent.length > 0;

    return (
      <Popup
        className="disabled-pointer-events"
        placement={placement}
        style={{ top, left, width: TOOLTIP_WIDTH }}
      >
        <div className="activity-graph-tooltip">
          <div
            className="sw-body-md-highlight sw-whitespace-nowrap"
            style={{ color: themeColor('selectionCardHeader')({ theme }) }}
          >
            <DateTimeFormatter date={selectedDate} />
          </div>
          <table
            className="width-100"
            style={{ color: themeColor('dropdownMenuSubTitle')({ theme }) }}
          >
            {addSeparator && (
              <tr>
                <td className="activity-graph-tooltip-separator" colSpan={3}>
                  <hr />
                </td>
              </tr>
            )}
            {events?.length > 0 && (
              <GraphsTooltipsContentEvents addSeparator={addSeparator} events={events} />
            )}
            <tbody>{tooltipContent}</tbody>
            {graph === GraphType.coverage && (
              <GraphsTooltipsContentCoverage
                addSeparator={addSeparator}
                measuresHistory={measuresHistory}
                tooltipIdx={tooltipIdx}
              />
            )}
            {graph === GraphType.duplications && (
              <GraphsTooltipsContentDuplication
                addSeparator={addSeparator}
                measuresHistory={measuresHistory}
                tooltipIdx={tooltipIdx}
              />
            )}
          </table>
        </div>
      </Popup>
    );
  }
}

export const GraphsTooltips = withTheme<PropsWithoutTheme>(GraphsTooltipsClass);
