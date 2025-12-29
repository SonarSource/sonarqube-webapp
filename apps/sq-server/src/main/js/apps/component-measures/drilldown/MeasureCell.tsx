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

import { NumericalCell } from '~design-system';
import { MeasureEnhanced, Metric } from '~shared/types/measures';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import Measure from '~sq-server-commons/sonar-aligned/components/measure/Measure';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { ComponentMeasureEnhanced } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  componentKey: string;
  measure?: MeasureEnhanced | ComponentMeasureEnhanced;
  metric: Metric;
}

export default function MeasureCell({
  componentKey,
  measure,
  metric,
  branchLike,
}: Readonly<Props>) {
  const getValue = (item: { leak?: string; value?: string } = {}) =>
    isDiffMetric(metric.key) ? item.leak : item.value;

  const value = getValue(measure);

  return (
    <NumericalCell className="sw-py-3">
      <Measure
        branchLike={branchLike}
        componentKey={componentKey}
        metricKey={metric.key}
        metricType={metric.type}
        small
        value={value}
      />
    </NumericalCell>
  );
}
