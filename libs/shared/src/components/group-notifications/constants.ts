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

import type {
  GroupNotificationSubscription,
  GroupNotificationType,
} from '../../types/group-notifications';

export const GROUP_NOTIFICATION_CHANNEL = {
  Email: 'EmailNotificationChannel',
  Banner: 'BannerChannel',
} as const;

export const NotificationGroupType = {
  SecurityAlertRaised: 'security-alert-raised',
} as const;

export type GroupNotificationTypeOption = GroupNotificationType;

export type GroupNotificationSubscriptionView = GroupNotificationSubscription;

export function normalizeGroupNotificationTypes(
  availableTypes: Array<GroupNotificationType | string> | undefined,
): GroupNotificationType[] {
  return (
    availableTypes ?? [
      {
        notificationType: NotificationGroupType.SecurityAlertRaised,
        channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
      },
    ]
  ).map((type) =>
    typeof type === 'string'
      ? { notificationType: type, channelKey: GROUP_NOTIFICATION_CHANNEL.Email }
      : type,
  );
}

export interface GroupNotificationGroupOption {
  id: string;
  name: string;
}
