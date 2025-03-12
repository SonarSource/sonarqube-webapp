/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { Navigate, To } from 'react-router-dom';
import withCurrentUserContext from '~sq-server-shared/context/current-user/withCurrentUserContext';
import { getHomePageUrl } from '~sq-server-shared/helpers/urls';
import { CurrentUser, isLoggedIn } from '~sq-server-shared/types/users';

export interface LandingProps {
  currentUser: CurrentUser;
}

export function Landing({ currentUser }: LandingProps) {
  let redirectUrl: To;
  if (isLoggedIn(currentUser) && currentUser.homepage) {
    redirectUrl = getHomePageUrl(currentUser.homepage);
  } else {
    redirectUrl = '/projects';
  }

  return <Navigate replace to={redirectUrl} />;
}

export default withCurrentUserContext(Landing);
