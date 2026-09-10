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

import { Button, ButtonVariety, EmptyState, IconProject } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { Permissions } from '~sq-server-commons/types/permissions';
import { isLoggedIn } from '~sq-server-commons/types/users';

export default function EmptyInstance() {
  const { currentUser } = useCurrentUser();
  const showNewProjectButton =
    isLoggedIn(currentUser) && hasGlobalPermission(currentUser, Permissions.ProjectCreation);

  return (
    <div className="sw-flex sw-justify-center sw-py-8">
      <EmptyState
        action={
          showNewProjectButton ? (
            <Button to="/projects/create" variety={ButtonVariety.Primary}>
              <FormattedMessage id="my_account.create_new.TRK" />
            </Button>
          ) : undefined
        }
        graphic={<IconProject />}
        text={
          showNewProjectButton ? (
            <FormattedMessage id="projects.no_projects.empty_instance.how_to_add_projects" />
          ) : undefined
        }
        title={
          <FormattedMessage
            id={
              showNewProjectButton
                ? 'projects.no_projects.empty_instance.new_project'
                : 'projects.no_projects.empty_instance'
            }
          />
        }
        titleSize="medium"
      />
    </div>
  );
}
