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

import { useIntl } from 'react-intl';
import { DashboardMode } from '../types/dashboard-list';
import { DashboardDetailsFormModal } from './DashboardDetailsFormModal';
import { getDashboardMetadataModalText } from './helpers/getDashboardMetadataModalText';

export interface DashboardDetailsModalProps<T extends { description: string; name: string }> {
  children?: React.ReactNode;
  dashboard: T;
  isOpen: boolean;
  isSaving: boolean;
  mode: DashboardMode;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: (dashboard: T) => Promise<void> | void;
  showDuplicateModeDescription?: boolean;
  trailingContent?: React.ReactNode;
}

export function DashboardDetailsModal<T extends { description: string; name: string }>({
  children,
  dashboard,
  isOpen,
  mode,
  onClose,
  onOpenChange,
  onSave,
  isSaving,
  showDuplicateModeDescription = true,
  trailingContent,
}: Readonly<DashboardDetailsModalProps<T>>) {
  const intl = useIntl();
  const modalText = getDashboardMetadataModalText(intl, mode);

  return (
    <DashboardDetailsFormModal
      dashboard={{ name: dashboard.name, description: dashboard.description }}
      descriptionLabel={modalText.descriptionLabel}
      descriptionPlaceholder={modalText.descriptionPlaceholder}
      duplicateModeDescription={
        showDuplicateModeDescription ? modalText.duplicateModeDescription : undefined
      }
      isOpen={isOpen}
      isSaving={isSaving}
      mode={mode}
      nameLabel={modalText.nameLabel}
      namePlaceholder={modalText.namePlaceholder}
      onClose={onClose}
      onOpenChange={onOpenChange}
      onSave={({ name, description }) => onSave({ ...dashboard, name, description })}
      primaryButtonLabel={modalText.primaryButtonLabel}
      secondaryButtonLabel={modalText.secondaryButtonLabel}
      title={modalText.title}
      trailingContent={modalText.shouldShowPermissionAccessMessage ? trailingContent : undefined}
    >
      {children}
    </DashboardDetailsFormModal>
  );
}
