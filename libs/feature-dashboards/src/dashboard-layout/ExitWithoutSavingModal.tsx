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
import { useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
  hasUnsavedChanges: boolean;
  onConfirm: () => void;
}

export function ExitWithoutSavingModal(props: Readonly<Props>) {
  const { hasUnsavedChanges, onConfirm } = props;
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open && !hasUnsavedChanges) {
      return;
    }
    setIsOpen(open);
  };

  const handleClick = () => {
    if (hasUnsavedChanges) {
      setIsOpen(true);
    } else {
      onConfirm();
    }
  };

  return (
    <Modal
      content={
        <Text>{formatMessage({ id: 'project_dashboard.exit_without_saving_message' })}</Text>
      }
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      primaryButton={
        <Button onClick={handleConfirm} variety={ButtonVariety.Danger}>
          {formatMessage({ id: 'project_dashboard.exit_without_saving' })}
        </Button>
      }
      secondaryButton={
        <Button
          onClick={() => {
            handleOpenChange(false);
          }}
          variety={ButtonVariety.Default}
        >
          {formatMessage({ id: 'project_dashboard.go_back_to_editing' })}
        </Button>
      }
      title={formatMessage({ id: 'project_dashboard.exit_without_saving_title' })}
    >
      <Button
        data-testid="project-dashboard-cancel-changes-button"
        onClick={handleClick}
        variety={ButtonVariety.Default}
      >
        {formatMessage({ id: 'project_dashboard.cancel_changes' })}
      </Button>
    </Modal>
  );
}
