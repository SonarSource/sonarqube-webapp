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

import { Button, ModalAlert, toast } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { setDefaultPermissionTemplate } from '~sq-server-commons/api/permissions';
import { PermissionTemplate } from '~sq-server-commons/types/types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  permissionTemplate: PermissionTemplate;
  qualifier: string;
}

export function SetDefaultConfirmationModal({
  onClose,
  onSuccess,
  permissionTemplate,
  qualifier,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      // eslint-disable-next-line local-rules/no-api-imports -- No Server permission-template mutation hook exists; reuse the existing API.
      await setDefaultPermissionTemplate(permissionTemplate.id, qualifier);
    } catch {
      setSubmitting(false);
      toast.error({ description: formatMessage({ id: 'default_error_message' }) });
      return;
    }
    onSuccess();
    onClose();
  }

  return (
    <ModalAlert
      description={
        <FormattedMessage
          id="permission_templates.set_default_confirmation_description"
          values={{
            template: permissionTemplate.name,
            qualifier: formatMessage({ id: `qualifiers.${qualifier}` }),
          }}
        />
      }
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen && !submitting) {
          onClose();
        }
      }}
      primaryButton={
        <Button
          isDisabled={submitting}
          isLoading={submitting}
          onClick={handleConfirm}
          variety="primary"
        >
          <FormattedMessage id="permission_templates.set_default" />
        </Button>
      }
      secondaryButton={
        <Button isDisabled={submitting} onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
      }
      title={formatMessage({ id: 'permission_templates.set_default_confirmation_title' })}
    />
  );
}
