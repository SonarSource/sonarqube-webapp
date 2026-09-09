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

import { getSecurityAlertsUrl } from '../security-alerts-urls';

describe('getSecurityAlertsUrl', () => {
  it('preserves filter params for an alert detail URL', () => {
    const search = '?alertTypes=VULNERABILITY&statuses=OPEN&sort=LAST_DETECTED_AT&direction=DESC';
    const result = getSecurityAlertsUrl('alert-123', search);
    expect(result.search).toContain('alertTypes=VULNERABILITY');
    expect(result.search).toContain('statuses=OPEN');
    expect(result.search).toContain('sort=LAST_DETECTED_AT');
    expect(result.search).toContain('direction=DESC');
  });

  it('strips unrecognized params from an alert detail URL', () => {
    const result = getSecurityAlertsUrl('alert-123', '?unknown=value&branch=main');
    expect(result.search).not.toContain('unknown');
    expect(result.search).not.toContain('branch');
  });

  it('preserves filter params for the alerts list URL', () => {
    const search =
      '?alertTypes=VULNERABILITY&statuses=RESOLVED&sort=LAST_DETECTED_AT&direction=ASC';
    const result = getSecurityAlertsUrl(undefined, search);
    expect(result.search).toContain('alertTypes=VULNERABILITY');
    expect(result.search).toContain('statuses=RESOLVED');
    expect(result.search).toContain('sort=LAST_DETECTED_AT');
    expect(result.search).toContain('direction=ASC');
  });

  it('strips unrecognized params from the alerts list URL', () => {
    const result = getSecurityAlertsUrl(undefined, '?unknown=value&branch=main');
    expect(result.search).not.toContain('unknown');
    expect(result.search).not.toContain('branch');
  });
});
