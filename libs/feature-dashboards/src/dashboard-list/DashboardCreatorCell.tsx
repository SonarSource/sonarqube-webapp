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

import { Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import Avatar from '~adapters/components/ui/Avatar';
import { isStringDefined } from '~shared/helpers/types';
import { DashboardType } from '../types/dashboard-list';

export function DashboardCreatorCell({
  dashboard,
  dashboardCreators,
}: Readonly<{
  dashboard: { createdById?: string; type: DashboardType };
  dashboardCreators: Record<string, { avatar?: string; name: string }>;
}>) {
  const { formatMessage } = useIntl();
  const isBuiltIn = dashboard.type === DashboardType.BuiltIn;
  const creator = isStringDefined(dashboard.createdById)
    ? dashboardCreators[dashboard.createdById]
    : undefined;

  let displayName: string | undefined;
  if (isBuiltIn) {
    displayName = formatMessage({ id: 'sonar' });
  } else if (isStringDefined(dashboard.createdById)) {
    displayName = creator?.name ?? formatMessage({ id: 'dashboard.list.removed_user' });
  }

  if (!isStringDefined(displayName)) {
    return null;
  }

  return (
    <div className="sw-flex sw-items-center sw-gap-1">
      {!isBuiltIn && (
        <span aria-hidden="true">
          <Avatar hash={creator?.avatar} name={creator?.name} size="xs" />
        </span>
      )}
      <Text size={TextSize.Small}>{displayName}</Text>
    </div>
  );
}
