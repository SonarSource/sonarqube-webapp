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
import { useIntl } from 'react-intl';

interface Props {
  isOpen: boolean;
  sectionName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteSectionModal(props: Readonly<Props>) {
  const { isOpen, onClose, onConfirm, sectionName } = props;
  const { formatMessage } = useIntl();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      content={
        <div className="sw:space-y-4">
          <Text className="sw:whitespace-pre-line">
            {formatMessage({ id: 'dashboard.delete_section_confirm' }, { name: sectionName })}
          </Text>
        </div>
      }
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      primaryButton={
        <Button onClick={handleConfirm} variety={ButtonVariety.Danger}>
          {formatMessage({ id: 'delete' })}
        </Button>
      }
      secondaryButton={
        <Button onClick={onClose} variety={ButtonVariety.Default}>
          {formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={formatMessage({ id: 'dashboard.delete_section_title' })}
    />
  );
}
