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

import { MetricKey } from '~shared/types/metrics';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import RatingComponent from '../RatingComponent';

const mockUseMeasureQuery = jest.fn();

jest.mock('~sq-server-commons/queries/measures', () => ({
  useMeasureQuery: (...args: unknown[]) => mockUseMeasureQuery(...args),
}));

jest.mock('~sq-server-commons/queries/mode', () => ({
  useStandardExperienceModeQuery: () => ({ data: true, isLoading: false }),
}));

describe('RatingComponent', () => {
  beforeEach(() => {
    mockUseMeasureQuery.mockReturnValue({ data: null, isLoading: false });
  });

  it('does not fetch measures when a rating value is provided', () => {
    renderComponent(
      <RatingComponent
        componentKey=""
        providedValue="2"
        ratingMetric={MetricKey.reliability_rating}
      />,
    );

    expect(mockUseMeasureQuery).toHaveBeenCalledTimes(2);
    expect(mockUseMeasureQuery).toHaveBeenNthCalledWith(1, expect.anything(), { enabled: false });
    expect(mockUseMeasureQuery).toHaveBeenNthCalledWith(2, expect.anything(), { enabled: false });
  });
});
