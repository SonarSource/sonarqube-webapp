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

import { useIntl } from 'react-intl';
import { WidgetFilterLine } from '../../dashboard-layout/shared/WidgetFilterLine';
import { WidgetHeaderTitle } from '../../dashboard-layout/shared/WidgetHeaderTitle';
import { PieChartWidgetProps } from '../../types/dashboard-widget';
import { getPieChartFilterLineSegments } from './pieChartFilterLineSegments';
import { getPieChartTitle } from './pieChartHeaderText';

export interface PieChartHeaderProps extends PieChartWidgetProps {
  /**
   * When true, portfolio dashboard title/slice rules apply (replaces optional portfolio widget context).
   */
  isPortfolioDashboardWidget?: boolean;
}

export function PieChartHeader({
  isPortfolioDashboardWidget = false,
  ...props
}: Readonly<PieChartHeaderProps>) {
  const { metric, filter, slice, scope } = props;
  const { formatMessage } = useIntl();

  const filterSegments = getPieChartFilterLineSegments(formatMessage, {
    filter,
    isPortfolioDashboard: isPortfolioDashboardWidget,
    metric,
    scope,
    slice,
  });

  const title = getPieChartTitle(formatMessage, {
    filter,
    isPortfolioDashboard: isPortfolioDashboardWidget,
    metric,
    slice,
  });

  return (
    <div className="sw-flex sw-w-full sw-min-w-0 sw-flex-col sw-gap-1">
      <div className="sw-flex sw-w-full sw-items-center sw-justify-between sw-gap-4">
        <WidgetHeaderTitle title={title} />
      </div>
      <WidgetFilterLine segments={filterSegments} />
    </div>
  );
}
