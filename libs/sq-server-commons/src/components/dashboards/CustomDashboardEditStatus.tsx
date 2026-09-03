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

import { Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { boldFormatter } from '~shared/helpers/intl';
import { isStringDefined } from '~shared/helpers/types';
import { useUsersByIdsQuery } from '../../queries/users';

export function CustomDashboardEditStatus({
  canShowEditor,
  isEditing,
  showSonarWhenEditorMissing = false,
  updatedAt,
  updatedById,
}: Readonly<{
  canShowEditor: boolean;
  isEditing: boolean;
  showSonarWhenEditorMissing?: boolean;
  updatedAt: number;
  updatedById?: string;
}>) {
  const { formatMessage } = useIntl();
  const shouldShowEditor = canShowEditor && isStringDefined(updatedById);
  const { data: editors } = useUsersByIdsQuery(shouldShowEditor ? [updatedById] : []);
  let updatedByUser: string | undefined;
  if (shouldShowEditor) {
    updatedByUser =
      editors[updatedById]?.name ?? formatMessage({ id: 'dashboard.list.removed_user' });
  } else if (showSonarWhenEditorMissing && !isStringDefined(updatedById)) {
    updatedByUser = formatMessage({ id: 'sonar' });
  }

  return (
    <Text isSubtle>
      {isEditing ? (
        formatMessage({ id: 'project_dashboard.edit_mode_message' })
      ) : (
        <DateFromNow date={updatedAt}>
          {(date) =>
            formatMessage(
              {
                id: isStringDefined(updatedByUser)
                  ? 'project_dashboard.last_edited_by'
                  : 'project_dashboard.last_edited',
              },
              { b: boldFormatter, lastUpdatedAt: date, user: updatedByUser },
            )
          }
        </DateFromNow>
      )}
    </Text>
  );
}
