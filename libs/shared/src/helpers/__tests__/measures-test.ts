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

import { scaRiskFormatter } from '../measures';
import { SCA_RISK_SEVERITY_METRIC_THRESHOLD_KEYS } from '../sca';

describe('scaRiskFormatter', () => {
  it('should format a found risk threshold', () => {
    const formatMessage = jest.fn();

    scaRiskFormatter(formatMessage, '4');

    expect(formatMessage).toHaveBeenCalledWith({ id: 'severity_impact.INFO' });
  });

  it('should throw an error if the risk level is not found', () => {
    const formatMessage = jest.fn();

    expect(() => {
      scaRiskFormatter(formatMessage, '3' as SCA_RISK_SEVERITY_METRIC_THRESHOLD_KEYS);
    }).toThrow(/Threshold '3' not valid/);

    expect(formatMessage).not.toHaveBeenCalled();
  });
});
