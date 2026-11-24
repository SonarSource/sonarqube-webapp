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

import { axiosClient } from '~shared/helpers/axios-clients';
import { GROUP_NOTIFICATION_CHANNEL } from '~shared/components/group-notifications/constants';
import {
  addGroupNotificationSubscription,
  removeGroupNotificationSubscription,
} from '../group-notifications';

jest.mock('~shared/helpers/axios-clients', () => ({
  axiosClient: { post: jest.fn().mockResolvedValue(undefined) },
}));

const postMock = jest.spyOn(axiosClient, 'post');

describe('group notification API', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('omits the default Email channel from subscription requests', async () => {
    await addGroupNotificationSubscription({
      channel: GROUP_NOTIFICATION_CHANNEL.Email,
      groupUuid: 'group-1',
      type: 'security-alert-raised',
    });

    expect(postMock).toHaveBeenCalledWith(
      '/api/notifications/add_group',
      new URLSearchParams({ groupUuid: 'group-1', type: 'security-alert-raised' }),
    );
  });

  it('sends non-default channels when adding and removing subscriptions', async () => {
    await addGroupNotificationSubscription({
      channel: GROUP_NOTIFICATION_CHANNEL.Banner,
      groupUuid: 'group-1',
      type: 'security-alert-raised',
    });
    await removeGroupNotificationSubscription({
      channel: GROUP_NOTIFICATION_CHANNEL.Banner,
      groupUuid: 'group-1',
      type: 'security-alert-raised',
    });

    const bannerRequest = new URLSearchParams({
      groupUuid: 'group-1',
      type: 'security-alert-raised',
      channel: GROUP_NOTIFICATION_CHANNEL.Banner,
    });
    const [[addUrl, addData], [removeUrl, removeData]] = postMock.mock.calls;
    expect(addUrl).toBe('/api/notifications/add_group');
    expect((addData as URLSearchParams).toString()).toBe(bannerRequest.toString());
    expect(removeUrl).toBe('/api/notifications/remove_group');
    expect((removeData as URLSearchParams).toString()).toBe(bannerRequest.toString());
  });
});
