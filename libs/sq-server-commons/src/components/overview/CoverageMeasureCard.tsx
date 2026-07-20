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

import * as React from 'react';
import { NoCoverageCard } from '~shared/components/overview/NoCoverageCard';
import { NotEnoughLinesCoverageCard } from '~shared/components/overview/NotEnoughLinesCoverageCard';
import { MeasurementType, getMeasurementMetricKey } from '~shared/helpers/overview';
import { isDefined } from '~shared/helpers/types';
import { MetricKey } from '~shared/types/metrics';
import { DocLink } from '../../helpers/doc-links';
import { useDocUrl } from '../../helpers/docs';
import { findMeasure } from '../../helpers/measures';
import { getLeakValue } from '../measure/utils';
import MeasuresCardPercent from './MeasuresCardPercent';

type Props = Omit<React.ComponentProps<typeof MeasuresCardPercent>, 'measurementType'>;

export function CoverageMeasureCard(props: Readonly<Props>) {
  const { measures, useDiffMetric = false } = props;
  const coverageDocUrl = useDocUrl(DocLink.TestCoverage);

  const metricKey = getMeasurementMetricKey(MeasurementType.Coverage, useDiffMetric);
  const value = useDiffMetric
    ? getLeakValue(findMeasure(measures, metricKey))
    : findMeasure(measures, metricKey)?.value;

  if (!isDefined(value)) {
    const overallCoverage = findMeasure(measures, MetricKey.coverage);
    const newCoverage = getLeakValue(findMeasure(measures, MetricKey.new_coverage));

    if (!overallCoverage && !newCoverage) {
      return <NoCoverageCard docUrl={coverageDocUrl} />;
    }

    return <NotEnoughLinesCoverageCard />;
  }

  return <MeasuresCardPercent {...props} measurementType={MeasurementType.Coverage} />;
}
