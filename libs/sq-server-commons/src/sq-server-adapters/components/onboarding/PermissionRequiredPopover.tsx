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

import { Button, ButtonVariety, Popover } from '@sonarsource/echoes-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEditPermissionsUrl } from '~adapters/helpers/useEditPermissionsUrl';

interface Props {
  children: ReactElement;
}

/**
 * Wraps a trigger button and replaces its action with a popover explaining the "Create projects"
 * permission requirement and linking to the permissions settings page. Use PermissionGate to
 * conditionally render this based on the user's permission.
 *
 * The trigger must not carry interactive props (onClick, to), strip them before passing.
 */
export function PermissionRequiredPopover({ children }: Readonly<Props>) {
  const url = useEditPermissionsUrl();
  return (
    <Popover
      description={
        <FormattedMessage id="onboarding_dashboard.journey.permission_required.description" />
      }
      footer={
        url === undefined ? undefined : (
          <Button to={url} variety={ButtonVariety.Default}>
            <FormattedMessage id="onboarding_dashboard.journey.permission_required.cta" />
          </Button>
        )
      }
    >
      {children}
    </Popover>
  );
}
