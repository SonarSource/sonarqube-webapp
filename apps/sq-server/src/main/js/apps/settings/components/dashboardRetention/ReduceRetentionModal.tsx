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

import { Button, ButtonVariety, Modal } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
  days: number;
  isOpen: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ReduceRetentionModal({
  days,
  isOpen,
  isPending,
  onCancel,
  onConfirm,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <Modal
      content={
        <FormattedMessage
          id="settings.dashboard.retention.reduce_modal.description"
          values={{ days, bold: (text) => <strong>{text}</strong> }}
        />
      }
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
      primaryButton={
        <Button
          isDisabled={isPending}
          isLoading={isPending}
          onClick={onConfirm}
          variety={ButtonVariety.Danger}
        >
          {formatMessage({ id: 'settings.dashboard.retention.reduce_modal.confirm' })}
        </Button>
      }
      secondaryButton={
        <Button isDisabled={isPending} onClick={onCancel}>
          {formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={formatMessage({ id: 'settings.dashboard.retention.reduce_modal.title' })}
    />
  );
}
