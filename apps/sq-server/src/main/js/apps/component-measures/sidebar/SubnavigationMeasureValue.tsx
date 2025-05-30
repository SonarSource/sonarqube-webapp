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

import { RatingBadgeSize } from '@sonarsource/echoes-react';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { Note } from '~design-system';
import { MeasureEnhanced } from '~shared/types/measures';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import Measure from '~sq-server-commons/sonar-aligned/components/measure/Measure';

interface Props {
  componentKey: string;
  measure: MeasureEnhanced;
}

export default function SubnavigationMeasureValue({ measure, componentKey }: Readonly<Props>) {
  const { component } = useComponent();

  const isDiff = isDiffMetric(measure.metric.key);
  const { data: branchLike } = useCurrentBranchQuery(component);
  const value = isDiff ? measure.leak : measure.value;

  return (
    <Note
      className="sw-flex sw-items-center sw-mr-1"
      id={`measure-${measure.metric.key}-${isDiff ? 'leak' : 'value'}`}
    >
      <Measure
        badgeSize={RatingBadgeSize.ExtraSmall}
        branchLike={branchLike}
        componentKey={componentKey}
        metricKey={measure.metric.key}
        metricType={measure.metric.type}
        small
        value={value}
      />
    </Note>
  );
}
