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

import { useLocation } from 'react-router-dom';
import { MetricKey } from '../../types/metrics';
import { mockLocation } from '../mocks/router';
import { getRisksUrlForComponent, useScaBaseUrl } from '../sca-urls';

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const original = jest.requireActual('react-router-dom');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,
    useLocation: jest.fn(),
  };
});

describe('sca-urls', () => {
  describe('useScaBaseUrl', () => {
    it('should return default base URL when no SCA routes found', () => {
      jest.mocked(useLocation).mockReturnValue(mockLocation({ pathname: '/some/other/path' }));

      expect(useScaBaseUrl()).toBe('/');
    });

    it('should return base URL when releases route is found', () => {
      jest
        .mocked(useLocation)
        .mockReturnValue(mockLocation({ pathname: '/sca/dependencies?id=123' }));
      expect(useScaBaseUrl()).toBe('/sca/');
    });
  });

  describe('getRisksUrlForComponent', () => {
    const BASE_PARAMS = {
      componentKey: '1',
      metricKey: MetricKey.sca_count_any_issue,
    };

    it('should handle nothing extra', () => {
      expect(getRisksUrlForComponent(BASE_PARAMS)).toEqual({
        pathname: '/dependency-risks',
        search: '?id=1&riskStatuses=OPEN%2CCONFIRM',
      });
    });

    it('should handle branchLike', () => {
      expect(
        getRisksUrlForComponent({
          ...BASE_PARAMS,
          branchLike: {
            isMain: true,
            name: 'main',
            base: 'main',
            branch: 'other',
            key: 'key',
            target: 'main',
          },
        }),
      ).toEqual({
        pathname: '/dependency-risks',
        search: '?id=1&pullRequest=key&riskStatuses=OPEN%2CCONFIRM',
      });
    });

    it('should handle newly introduced', () => {
      expect(getRisksUrlForComponent({ ...BASE_PARAMS, newlyIntroduced: 'true' })).toEqual({
        pathname: '/dependency-risks',
        search: '?id=1&newlyIntroduced=true&riskStatuses=OPEN%2CCONFIRM',
      });
    });

    it('should handle threshold', () => {
      expect(getRisksUrlForComponent({ ...BASE_PARAMS, threshold: '10' })).toEqual({
        pathname: '/dependency-risks',
        search: '?id=1&severities=LOW%2CMEDIUM%2CHIGH%2CBLOCKER&riskStatuses=OPEN%2CCONFIRM',
      });
    });
  });
});
