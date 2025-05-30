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

import { Select } from '@sonarsource/echoes-react';
import { groupBy, sortBy } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import withMetricsContext from '~sq-server-commons/context/metrics/withMetricsContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  getLocalizedMetricNameNoDiffMetric,
  STANDARD_CONDITIONS_MAP,
} from '~sq-server-commons/helpers/quality-gates';

interface Props {
  metrics: Record<string, Metric>;
  metricsArray: Metric[];
  onMetricChange: (metric: Metric) => void;
  selectedMetric?: Metric;
  similarMetricFromAnotherMode?: string;
}

export function MetricSelect({
  selectedMetric,
  metricsArray,
  metrics,
  onMetricChange,
  similarMetricFromAnotherMode,
}: Readonly<Props>) {
  const intl = useIntl();

  const handleChange = (key: string | null) => {
    if (isDefined(key)) {
      const selectedMetric = metricsArray.find((metric) => metric.key === key);
      if (selectedMetric) {
        onMetricChange(selectedMetric);
      }
    }
  };

  const options = React.useMemo(
    () => groupByDomain(metricsArray, metrics),
    [metricsArray, metrics],
  );

  return (
    <Select
      ariaLabel={intl.formatMessage({ id: 'quality_gates.conditions.fails_when' })}
      data={options}
      isNotClearable
      isSearchable
      messageInvalid={
        Boolean(similarMetricFromAnotherMode) &&
        intl.formatMessage(
          { id: 'quality_gates.add_condition.metric_from_other_mode' },
          {
            isStandardMode: Boolean(
              STANDARD_CONDITIONS_MAP[similarMetricFromAnotherMode as MetricKey],
            ),
            metric: intl.formatMessage({ id: `metric.${similarMetricFromAnotherMode}.name` }),
          },
        )
      }
      onChange={handleChange}
      validation={similarMetricFromAnotherMode ? 'invalid' : 'none'}
      value={selectedMetric?.key}
    />
  );
}

export default withMetricsContext(MetricSelect);

function groupByDomain(metricsArray: Metric[], metrics: Record<string, Metric>) {
  const groups = groupBy(metricsArray, (m) => m.domain);

  return sortBy(
    Object.keys(groups).map((group) => {
      const items = sortBy(
        groups[group].map((m) => ({
          value: m.key,
          label: getLocalizedMetricNameNoDiffMetric(m, metrics),
        })),
        (m) => m.label,
      );

      return { group: translate('metric_domain', group), items };
    }),
    (g) => g.group,
  );
}
