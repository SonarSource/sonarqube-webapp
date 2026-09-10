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

import { MetricKey } from '../../types/metrics';
import {
  getLanguagesSortedByNCLOC,
  issueSeverityFormatter,
  parseDistributionCounts,
  scaRiskFormatter,
} from '../measures';

describe('scaRiskFormatter', () => {
  it('should format a valid risk threshold', () => {
    const formatMessage = jest.fn();

    scaRiskFormatter(formatMessage, '4');

    expect(formatMessage).toHaveBeenCalledWith({ id: 'severity_impact.INFO' });
  });

  it.each([
    ['0', 'severity_impact.INFO'],
    ['3', 'severity_impact.INFO'],
    ['5', 'severity_impact.LOW'],
    ['20', 'severity_impact.BLOCKER'],
  ])(
    'should map an out-of-range threshold (%s) up to the nearest severity',
    (value, expectedLabel) => {
      const formatMessage = jest.fn();

      scaRiskFormatter(formatMessage, value);

      expect(formatMessage).toHaveBeenCalledWith({ id: expectedLabel });
    },
  );

  it.each(['25', '100', 'not-a-number', '', '   '])(
    'should fall back to the raw value when the threshold cannot be mapped (%s)',
    (value) => {
      const formatMessage = jest.fn();

      expect(scaRiskFormatter(formatMessage, value)).toBe(value);
      expect(formatMessage).not.toHaveBeenCalled();
    },
  );
});

describe('issueSeverityFormatter', () => {
  it('should format a valid severity threshold', () => {
    const formatMessage = jest.fn();

    issueSeverityFormatter(formatMessage, '4');

    expect(formatMessage).toHaveBeenCalledWith({ id: 'severity.INFO' });
  });

  it('should map an out-of-range threshold up to the nearest severity', () => {
    const formatMessage = jest.fn();

    issueSeverityFormatter(formatMessage, '0');

    expect(formatMessage).toHaveBeenCalledWith({ id: 'severity.INFO' });
  });

  it.each(['25', ''])(
    'should fall back to the raw value when the threshold cannot be mapped (%s)',
    (value) => {
      const formatMessage = jest.fn();

      expect(issueSeverityFormatter(formatMessage, value)).toBe(value);
      expect(formatMessage).not.toHaveBeenCalled();
    },
  );
});

describe('distribution counts', () => {
  it('rounds positive numeric prefixes and ignores unavailable counts', () => {
    expect(
      parseDistributionCounts(
        'java=12 lines;ts=70.6;css=0;broken;negative=-2;inf=Infinity;nan=NaN;=3',
      ),
    ).toEqual({ java: 12, ts: 71 });
    expect(parseDistributionCounts('')).toEqual({});
  });

  it('preserves arbitrary distribution keys and the last value for repeated keys', () => {
    expect(parseDistributionCounts('1=4;4=1;java=2;java=3;__proto__=5')).toEqual(
      JSON.parse('{"1":4,"4":1,"java":3,"__proto__":5}'),
    );
  });

  it('orders available languages using the same rounded counts as the charts', () => {
    expect(
      getLanguagesSortedByNCLOC([
        {
          metric: MetricKey.ncloc_language_distribution,
          value: 'java=12 lines;ts=70.6;css=0;broken',
        },
        { metric: MetricKey.ncloc_language_distribution },
      ]),
    ).toEqual([
      { language: 'ts', count: 71 },
      { language: 'java', count: 12 },
    ]);
  });
});
