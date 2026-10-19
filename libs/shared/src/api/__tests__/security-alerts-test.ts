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

import { API_V2_BASE_URL } from '~adapters/helpers/urls';
import { SecurityAlertStatus, SecurityAlertType } from '../../types/security-alert';
import { getNewestSecurityAlert, getSecurityAlert, getSecurityAlerts } from '../security-alerts';

const ENDPOINT = `${API_V2_BASE_URL}/security-alerts/alerts`;
const mockGet = jest.fn<Promise<unknown>, unknown[]>();

jest.mock('~shared/helpers/axios-clients', () => ({
  axiosClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

describe('security alerts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({});
  });

  it('gets a security alert by id', async () => {
    await getSecurityAlert('alert-1');

    expect(mockGet).toHaveBeenCalledWith(`${ENDPOINT}/alert-1`);
  });

  it('serializes alert type and status filters', async () => {
    await getSecurityAlerts({
      alertTypes: [SecurityAlertType.DEPENDENCY_RISK],
      statuses: [SecurityAlertStatus.OPEN, SecurityAlertStatus.RESOLVED],
    });

    expect(mockGet).toHaveBeenCalledWith(ENDPOINT, {
      params: {
        alertTypes: 'DEPENDENCY_RISK',
        statuses: 'OPEN,RESOLVED',
      },
    });
  });

  it('gets newest open security alert for the banner', async () => {
    await getNewestSecurityAlert();

    expect(mockGet).toHaveBeenCalledWith(ENDPOINT, {
      params: {
        sort: 'FIRST_DETECTED_AT',
        direction: 'DESC',
        pageSize: 1,
        pageIndex: 1,
        statuses: 'OPEN',
      },
    });
  });
});
