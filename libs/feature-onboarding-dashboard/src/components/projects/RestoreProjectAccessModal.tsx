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

import { Button, ButtonVariety, Modal, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRestoreProjectAccessMutation } from './projectRowActionMutations';
import { PROJECT_ROW_ACTION_LABEL_KEYS, ProjectRowAction } from './projectRowActions';

interface Props {
  onClose: VoidFunction;
  projectKey: string;
}

/**
 * Confirmation modal of the "Restore access" row action: grants the current user back the browse and
 * administer permissions on a project. One shared implementation for both products — the
 * organization the permissions are granted in is resolved by the adapter layer.
 */
export function RestoreProjectAccessModal({ onClose, projectKey }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { isPending, mutate } = useRestoreProjectAccessMutation();

  return (
    <Modal
      description={
        <FormattedMessage
          id="global_permissions.restore_access.message"
          values={{
            administer: (
              <Text isHighlighted>
                <FormattedMessage id="projects_role.admin" />
              </Text>
            ),
            browse: (
              <Text isHighlighted>
                <FormattedMessage id="projects_role.user" />
              </Text>
            ),
          }}
        />
      }
      isOpen
      // The modal is mounted only while it is open, so the only change it can report is a dismissal.
      onOpenChange={onClose}
      primaryButton={
        <Button
          isDisabled={isPending}
          onClick={() => {
            mutate(projectKey, { onSuccess: onClose });
          }}
          variety={ButtonVariety.Primary}
        >
          {formatMessage({ id: PROJECT_ROW_ACTION_LABEL_KEYS[ProjectRowAction.RestoreAccess] })}
        </Button>
      }
      secondaryButton={
        <Button onClick={onClose} variety={ButtonVariety.Default}>
          {formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={formatMessage({ id: 'global_permissions.restore_access' })}
    />
  );
}
