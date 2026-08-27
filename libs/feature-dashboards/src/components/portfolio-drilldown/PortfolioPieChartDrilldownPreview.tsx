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

import { Card } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { WidgetFilterLine } from '../../dashboard-layout/shared/WidgetFilterLine';
import type { PieChartWidgetProps } from '../../types/dashboard-widget';
import type { PieChartSegment } from '../../types/visualization';
import { buildPieChartAriaLabel } from '../pie-chart/pieChartAriaLabel';
import { getPieChartFilterLineSegments } from '../pie-chart/pieChartFilterLineSegments';
import { InteractivePieChart } from '../visualizations/pie-chart/InteractivePieChart';
import { PortfolioDrilldownEmptyStateContent } from './PortfolioDrilldownEmptyStateContent';

interface Props {
  onSegmentSelect: (segment: PieChartSegment) => void;
  segments: PieChartSegment[];
  selectedSegmentValue?: string;
  title: string;
  widget: PieChartWidgetProps;
}

export function PortfolioPieChartDrilldownPreview(props: Readonly<Props>) {
  const { onSegmentSelect, segments, selectedSegmentValue, title, widget } = props;
  const { formatMessage } = useIntl();
  const description = (
    <WidgetFilterLine
      segments={getPieChartFilterLineSegments(formatMessage, {
        ...widget,
        isPortfolioDashboard: true,
      })}
    />
  );

  if (segments.length === 0) {
    return (
      <Card>
        <Card.Header description={description} title={title} />
        <Card.Body className="sw-pb-16">
          <div className="sw-flex sw-h-full sw-items-center sw-justify-center">
            <PortfolioDrilldownEmptyStateContent
              title={formatMessage({
                id: 'portfolio_dashboard.breakdown.empty_state.no_data.title',
              })}
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header description={description} title={title} />
      <Card.Body className="sw-pb-16">
        <InteractivePieChart
          ariaLabel={buildPieChartAriaLabel(formatMessage, { segments, title })}
          getSegmentUrl={() => undefined}
          onSegmentClick={onSegmentSelect}
          pastry={widget.pastry}
          segments={segments}
          selectedSegmentLabel={selectedSegmentValue}
          showLegend
        />
      </Card.Body>
    </Card>
  );
}
