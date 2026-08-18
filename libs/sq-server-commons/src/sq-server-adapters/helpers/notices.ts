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

import { useCallback, useContext } from 'react';
import {
  CurrentUserContext,
  DismissNoticesUpdaterContext,
} from '../../context/current-user/CurrentUserContext';
import { useDismissNoticeMutation } from '../../queries/users';
import { NoticeType } from '../../types/users';

interface DismissNoticeActions {
  dismissNotice: (key: string) => Promise<void>;
}

export function useIsNoticeDismissed(key: string): boolean {
  const { currentUser } = useContext(CurrentUserContext);
  return currentUser.dismissedNotices?.[key as NoticeType] ?? false;
}

export function useDismissNotice(): DismissNoticeActions {
  const { mutateAsync } = useDismissNoticeMutation();
  const { updateDismissedNotices } = useContext(DismissNoticesUpdaterContext);

  const dismissNotice = useCallback(
    async (key: string) => {
      await mutateAsync(key as NoticeType);
      updateDismissedNotices(key as NoticeType, true);
    },
    [mutateAsync, updateDismissedNotices],
  );

  return { dismissNotice };
}
