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

import {
  Button,
  ButtonVariety,
  Modal,
  Text,
  TextArea,
  TextInput,
  TextSize,
} from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { DashboardMode } from '../types/dashboard-list';

const MAX_DASHBOARD_DESCRIPTION_LENGTH = 500;

interface DashboardDetails {
  description: string;
  name: string;
}

interface DashboardDetailsFormModalProps {
  children?: React.ReactNode;
  dashboard: DashboardDetails;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  duplicateModeDescription?: string;
  isOpen: boolean;
  isSaving?: boolean;
  mode: DashboardMode;
  nameLabel: string;
  namePlaceholder: string;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: (dashboard: DashboardDetails) => Promise<void> | void;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
  title: string;
  trailingContent?: React.ReactNode;
}

export function DashboardDetailsFormModal({
  dashboard,
  isOpen,
  onOpenChange,
  onClose,
  onSave,
  isSaving = false,
  mode,
  children,
  descriptionLabel,
  descriptionPlaceholder,
  duplicateModeDescription,
  nameLabel,
  namePlaceholder,
  primaryButtonLabel,
  secondaryButtonLabel,
  title,
  trailingContent,
}: Readonly<DashboardDetailsFormModalProps>) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && mode === DashboardMode.Edit) {
      setName(dashboard.name);
      setDescription(dashboard.description);
    }
  }, [isOpen, mode, dashboard.name, dashboard.description]);

  const handleSave = async () => {
    await onSave({ name, description });
  };

  const handleCancel = () => {
    setName(dashboard.name);
    setDescription(dashboard.description);
    onClose();
  };

  return (
    <Modal
      content={
        <div className="sw-space-y-6">
          <TextInput
            id="dashboard-name"
            isRequired
            label={nameLabel}
            maxLength={300}
            onChange={(e) => {
              setName(e.target.value);
            }}
            placeholder={namePlaceholder}
            value={name}
          />
          <TextArea
            helpText={
              <Text as="div" className="sw-text-right" isSubtle size={TextSize.Small}>
                {`${description.length}/${MAX_DASHBOARD_DESCRIPTION_LENGTH}`}
              </Text>
            }
            id="dashboard-description"
            isResizable
            label={descriptionLabel}
            maxLength={MAX_DASHBOARD_DESCRIPTION_LENGTH}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            placeholder={descriptionPlaceholder}
            rows={6}
            value={description}
          />
          {trailingContent}
        </div>
      }
      description={mode === DashboardMode.Duplicate ? duplicateModeDescription : undefined}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && isSaving) {
          return;
        }
        onOpenChange(open);
        if (!open) {
          onClose();
        }
      }}
      primaryButton={
        <Button
          isDisabled={!name.trim() || isSaving}
          isLoading={isSaving}
          onClick={() => {
            void handleSave();
          }}
          variety={ButtonVariety.Primary}
        >
          {primaryButtonLabel}
        </Button>
      }
      secondaryButton={
        <Button isDisabled={isSaving} onClick={handleCancel} variety={ButtonVariety.Default}>
          {secondaryButtonLabel}
        </Button>
      }
      title={title}
    >
      {children}
    </Modal>
  );
}
