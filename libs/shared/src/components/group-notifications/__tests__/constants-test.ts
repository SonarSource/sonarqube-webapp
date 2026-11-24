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

import { GROUP_NOTIFICATION_CHANNEL, normalizeGroupNotificationTypes } from '../constants';

describe('normalizeGroupNotificationTypes', () => {
  it('normalizes legacy notification type strings to the Email channel', () => {
    expect(normalizeGroupNotificationTypes(['security-alert-raised'])).toEqual([
      {
        notificationType: 'security-alert-raised',
        channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
      },
    ]);
  });

  it('provides the Email security-alert type when a backend omits available types', () => {
    expect(normalizeGroupNotificationTypes(undefined)).toEqual([
      {
        notificationType: 'security-alert-raised',
        channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
      },
    ]);
  });
});
