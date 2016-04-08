/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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
import React from 'react';

import Measure from '../components/Measure';
import { isDiffMetric } from '../utils';
import { formatMeasure } from '../../../helpers/measures';

const MeasureListValue = ({ measure }) => {
  const { metric } = measure;

  if (isDiffMetric(metric)) {
    return (
        <div id={`measure-${measure.metric.key}-leak`} className="domain-measures-value domain-measures-leak">
          {formatMeasure(measure.leak, measure.metric.type)}
        </div>
    );
  }

  return (
      <div id={`measure-${measure.metric.key}-value`} className="domain-measures-value">
        <Measure measure={measure}/>
      </div>
  );
};

export default MeasureListValue;
