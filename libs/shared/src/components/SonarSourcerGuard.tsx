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

import { Spinner } from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { useCurrentUser } from '~adapters/helpers/users';
import NotFound from './NotFound';

/**
 * Guard component that restricts access to SonarSource employees only.
 * Shows a loading state while checking user status, and displays a NotFound
 * page for non-SonarSource users.
 *
 * @example
 * <SonarSourcerGuard
 *   isSonarSourcerEmail={isSonarSourcerEmail}
 *   isLoggedIn={isLoggedIn}
 *   userEmail={currentUser?.email}
 * >
 *   <ProtectedContent />
 * </SonarSourcerGuard>
 */
export function SonarSourcerGuard({ children }: Readonly<PropsWithChildren<{}>>) {
  const { currentUser, isLoggedIn } = useCurrentUser();
  const isSonarSourcer = isSonarSourcerEmail(currentUser?.email);

  return (
    <Spinner isLoading={!isLoggedIn}>
      {isSonarSourcer ? (
        children
      ) : (
        <div className="sw-fixed sw-inset-0 sw-flex sw-items-center sw-justify-center sw-left-[240px]">
          <NotFound />
        </div>
      )}
    </Spinner>
  );
}

function isSonarSourcerEmail(email: string | undefined) {
  return email?.includes('@sonarsource.com');
}
