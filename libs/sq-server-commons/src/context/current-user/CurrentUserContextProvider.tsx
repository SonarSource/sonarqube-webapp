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

import { useCallback, useMemo, useState } from 'react';
import { CurrentUser, HomePage, NoticeType } from '../../types/users';
import { CurrentUserContext, DismissNoticesUpdaterContext } from './CurrentUserContext';

interface Props {
  currentUser?: CurrentUser;
}

export default function CurrentUserContextProvider({
  currentUser: initialCurrentUser,
  children,
}: React.PropsWithChildren<Props>) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(
    initialCurrentUser ?? {
      isLoggedIn: false,
      dismissedNotices: {},
    },
  );

  const updateCurrentUserHomepage = useCallback((homepage: HomePage) => {
    setCurrentUser((prev) => ({ ...prev, homepage }));
  }, []);

  const updateDismissedNotices = useCallback((key: NoticeType, value: boolean) => {
    setCurrentUser((prev) => ({
      ...prev,
      dismissedNotices: {
        ...prev.dismissedNotices,
        [key]: value,
      },
    }));
  }, []);

  const contextValue = useMemo(
    () => ({ currentUser, updateCurrentUserHomepage }),
    [currentUser, updateCurrentUserHomepage],
  );

  const dismissContextValue = useMemo(() => ({ updateDismissedNotices }), [updateDismissedNotices]);

  return (
    <CurrentUserContext.Provider value={contextValue}>
      <DismissNoticesUpdaterContext.Provider value={dismissContextValue}>
        {children}
      </DismissNoticesUpdaterContext.Provider>
    </CurrentUserContext.Provider>
  );
}
