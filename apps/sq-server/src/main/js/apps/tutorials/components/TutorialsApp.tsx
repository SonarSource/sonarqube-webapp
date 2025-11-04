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

import { LargeCenteredLayout } from '~design-system';
import TutorialSelection from '~sq-server-commons/components/tutorials/TutorialSelection';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import handleRequiredAuthentication from '~sq-server-commons/helpers/handleRequiredAuthentication';
import { Component } from '~sq-server-commons/types/types';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';

export interface TutorialsAppProps {
  component: Component;
  currentUser: CurrentUser;
}

export function TutorialsApp(props: TutorialsAppProps) {
  const { component, currentUser } = props;

  if (!isLoggedIn(currentUser)) {
    handleRequiredAuthentication();
    return null;
  }

  return (
    <LargeCenteredLayout className="sw-pt-8">
      <TutorialSelection component={component} currentUser={currentUser} />
    </LargeCenteredLayout>
  );
}

export default withComponentContext(withCurrentUserContext(TutorialsApp));
