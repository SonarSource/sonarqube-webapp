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

import { RatingBadgeSize } from '@sonarsource/echoes-react';
import { render, screen } from '@testing-library/react';
import { MetricKey, MetricType } from '~shared/types/metrics';
import Measure from '../Measure';

const mockRatingComponent = jest.fn();

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

jest.mock('~sq-server-commons/sonar-aligned/helpers/measures', () => ({
  formatMeasure: (value: unknown, type: string) => `fmt:${type}:${String(value)}`,
}));

jest.mock('~sq-server-commons/components/measure/RatingTooltipContent', () => ({
  __esModule: true,
  default: ({ metricKey, value }: { metricKey: string; value: string }) => (
    <span>{`tooltip:${metricKey}:${value}`}</span>
  ),
}));

jest.mock('~sq-server-commons/context/metrics/RatingComponent', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockRatingComponent(props);
    return <span>rating-component</span>;
  },
}));

jest.mock('~sq-server-commons/design-system', () => ({
  QualityGateIndicator: ({ status }: { status: string }) => <span>{`qg:${status}`}</span>,
  TrendUpCircleIcon: () => <span>sca-risk-icon</span>,
}));

describe('SQS adapter Measure', () => {
  beforeEach(() => {
    mockRatingComponent.mockClear();
  });

  it('renders placeholder when value is undefined', () => {
    render(
      <Measure metricKey={MetricKey.bugs} metricType={MetricType.Integer} value={undefined} />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders quality gate indicator for level metrics', () => {
    render(<Measure metricKey={MetricKey.alert_status} metricType={MetricType.Level} value="OK" />);
    expect(screen.getByText('qg:OK')).toBeInTheDocument();
    expect(screen.getByText(`fmt:${MetricType.Level}:OK`)).toBeInTheDocument();
  });

  it('renders SCA icon for sca risk metrics', () => {
    render(
      <Measure
        metricKey={MetricKey.sca_rating_any_issue}
        metricType={MetricType.ScaRisk}
        value="1"
      />,
    );
    expect(screen.getByText('sca-risk-icon')).toBeInTheDocument();
  });

  it('renders formatted value for non-rating metrics', () => {
    render(
      <Measure
        decimals={1}
        metricKey={MetricKey.coverage}
        metricType={MetricType.Percent}
        value="86.2"
      />,
    );
    expect(screen.getByText(`fmt:${MetricType.Percent}:86.2`)).toBeInTheDocument();
  });

  it('renders rating component and normalizes badge size', () => {
    render(
      <Measure
        badgeSize={RatingBadgeSize.ExtraLarge}
        metricKey={MetricKey.reliability_rating}
        metricType={MetricType.Rating}
        value="2"
      />,
    );

    expect(screen.getByText('rating-component')).toBeInTheDocument();
    expect(mockRatingComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        componentKey: '',
        ratingMetric: MetricKey.reliability_rating,
        size: RatingBadgeSize.Medium,
      }),
    );
  });
});
