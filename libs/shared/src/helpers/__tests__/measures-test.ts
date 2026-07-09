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

import { issueSeverityFormatter, scaRiskFormatter } from '../measures';

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
