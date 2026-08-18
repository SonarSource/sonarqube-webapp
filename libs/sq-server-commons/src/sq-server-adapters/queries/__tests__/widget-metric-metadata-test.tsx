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

import { byRole, byText } from '~shared/helpers/testSelector';
import { MetricKey } from '~shared/types/metrics';
import { getAllMetrics } from '../../../api/metrics';
import { mockMetric } from '../../../helpers/testMocks';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import {
  isKnownUnsupportedDashboardHistoryMetric,
  useWidgetMetricMetadataQuery,
} from '../widget-metric-metadata';

jest.mock('../../../api/metrics', () => ({
  getAllMetrics: jest.fn(),
}));

describe('useWidgetMetricMetadataQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches metrics and indexes them by key', async () => {
    const metrics = [
      mockMetric({ key: MetricKey.bugs, name: 'Bugs' }),
      mockMetric({ key: MetricKey.coverage, name: 'Coverage' }),
    ];
    jest.mocked(getAllMetrics).mockResolvedValue(metrics);

    renderComponent(<WidgetMetricMetadata />);

    expect(await byRole('listitem').findAll()).toHaveLength(2);
    expect(await byText('Bugs').find()).toBeInTheDocument();
    expect(await byText('Coverage').find()).toBeInTheDocument();
    expect(getAllMetrics).toHaveBeenCalledTimes(1);
  });
});

describe('isKnownUnsupportedDashboardHistoryMetric', () => {
  const muleMetricKey = ['mule', MetricKey.coverage].join('_');

  it.each([
    [MetricKey.coverage, false],
    [MetricKey.releasability_rating, true],
    [MetricKey.security_rating_with_aica, true],
    [MetricKey.new_security_rating_without_aica, true],
    [muleMetricKey, true],
  ])('identifies metrics known to be rejected by the history API', (metricKey, expected) => {
    expect(isKnownUnsupportedDashboardHistoryMetric(metricKey)).toBe(expected);
  });
});

function WidgetMetricMetadata() {
  const { data } = useWidgetMetricMetadataQuery();

  return (
    <ul>
      {Object.values(data ?? {}).map((metric) => (
        <li key={metric.key}>{metric.name}</li>
      ))}
    </ul>
  );
}
