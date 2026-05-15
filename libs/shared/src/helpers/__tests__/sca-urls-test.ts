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

import { useLocation } from 'react-router-dom';
import { MetricKey } from '../../types/metrics';
import { mockLocation } from '../mocks/router';
import {
  getReleaseDetailsUrl,
  getRiskDetailsTabUrl,
  getRiskDetailsUrl,
  getRisksUrlForComponent,
  RiskDetailsTab,
  useScaBaseUrl,
} from '../sca-urls';

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

    it('should handle standard without standardCategory', () => {
      expect(getRisksUrlForComponent({ ...BASE_PARAMS, standard: 'owaspTop10' })).toEqual({
        pathname: '/dependency-risks',
        search: '?id=1&standard=owaspTop10&riskStatuses=OPEN%2CCONFIRM',
      });
    });

    it('should handle standardCategory without standard (else-if branch)', () => {
      expect(getRisksUrlForComponent({ ...BASE_PARAMS, standardCategory: 'A6' })).toEqual({
        pathname: '/dependency-risks',
        search: '?id=1&standardCategory=A6&riskStatuses=OPEN%2CCONFIRM',
      });
    });

    it('should normalize standardCategory with standard for OWASP Top 10 2025', () => {
      expect(
        getRisksUrlForComponent({
          ...BASE_PARAMS,
          standard: 'owaspTop10',
          standardVersion: '2025',
          standardCategory: 'a6',
        }),
      ).toEqual({
        pathname: '/dependency-risks',
        search:
          '?id=1&standard=owaspTop10&standardCategory=A06&standardVersion=2025&riskStatuses=OPEN%2CCONFIRM',
      });
    });

    it('should handle standard and standardVersion and standardCategory together', () => {
      expect(
        getRisksUrlForComponent({
          ...BASE_PARAMS,
          standard: 'pciDss',
          standardVersion: '4.0',
          standardCategory: '1',
        }),
      ).toEqual({
        pathname: '/dependency-risks',
        search:
          '?id=1&standard=pciDss&standardCategory=1&standardVersion=4.0&riskStatuses=OPEN%2CCONFIRM',
      });
    });

    it('should include standardLevel in URL when provided', () => {
      const result = getRisksUrlForComponent({
        ...BASE_PARAMS,
        standard: 'owaspAsvs',
        standardVersion: '4.0',
        standardCategory: '1',
        standardLevel: 'Level 1',
      });
      expect(result.pathname).toBe('/dependency-risks');
      const params = new URLSearchParams(result.search!);
      expect(params.get('standardLevel')).toBe('Level 1');
    });
  });

  describe('getReleaseDetailsUrl', () => {
    it('should build a release details URL', () => {
      expect(getReleaseDetailsUrl({ key: 'release-123' }, '', '/sca/')).toEqual({
        pathname: '/sca/dependencies/release-123',
        search: undefined,
      });
    });
  });

  describe('getRiskDetailsUrl', () => {
    it('should build a risk details URL', () => {
      expect(getRiskDetailsUrl({ riskId: 'risk-456' }, '', '/')).toEqual({
        pathname: '/dependency-risks/risk-456',
        search: undefined,
      });
    });
  });

  describe('getRiskDetailsTabUrl', () => {
    it('should build a risk details tab URL without showRiskSelector', () => {
      expect(
        getRiskDetailsTabUrl({ riskId: 'risk-456', tab: RiskDetailsTab.WHAT }, '', '/'),
      ).toEqual({
        pathname: '/dependency-risks/risk-456/what',
        search: undefined,
      });
    });

    it('should build a risk details tab URL with showRiskSelector', () => {
      expect(
        getRiskDetailsTabUrl(
          { riskId: 'risk-456', tab: RiskDetailsTab.WHERE, showRiskSelector: true },
          '',
          '/',
        ),
      ).toEqual({
        pathname: '/dependency-risks/risk-456/where',
        search: '?showRiskSelector=true',
      });
    });

    it.each([
      [MetricKey.sca_count_vulnerability, 'VULNERABILITY'],
      [MetricKey.sca_count_licensing, 'PROHIBITED_LICENSE'],
      [MetricKey.sca_count_malware, 'MALWARE'],
      [MetricKey.sca_rating_vulnerability, 'VULNERABILITY'],
      [MetricKey.sca_severity_licensing, 'PROHIBITED_LICENSE'],
    ])('should set types filter for metric %s', (metricKey, expectedType) => {
      const result = getRisksUrlForComponent({ componentKey: '1', metricKey });
      expect(result.pathname).toBe('/dependency-risks');
      const params = new URLSearchParams(result.search!);
      expect(params.get('types')).toBe(expectedType);
      expect(params.get('qualities')).toBeNull();
      expect(params.get('id')).toBe('1');
      expect(params.get('riskStatuses')).toBe('OPEN,CONFIRM');
    });

    it.each([MetricKey.sca_count_any_security, MetricKey.sca_rating_any_security])(
      'should set qualities=SECURITY filter for metric %s',
      (metricKey) => {
        const result = getRisksUrlForComponent({ componentKey: '1', metricKey });
        expect(result.pathname).toBe('/dependency-risks');
        const params = new URLSearchParams(result.search!);
        expect(params.get('qualities')).toBe('SECURITY');
        expect(params.get('types')).toBeNull();
        expect(params.get('id')).toBe('1');
        expect(params.get('riskStatuses')).toBe('OPEN,CONFIRM');
      },
    );
  });
});
