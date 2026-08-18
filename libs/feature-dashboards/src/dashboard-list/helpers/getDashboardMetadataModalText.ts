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

import { IntlShape } from 'react-intl';
import { DashboardMode } from '../../types/dashboard-list';

interface DashboardMetadataModalText {
  descriptionLabel: string;
  descriptionPlaceholder: string;
  duplicateModeDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
  shouldShowPermissionAccessMessage: boolean;
  title: string;
}

export function getDashboardMetadataModalText(
  intl: IntlShape,
  mode: DashboardMode,
): DashboardMetadataModalText {
  let primaryButtonLabel = intl.formatMessage({
    id: 'project_dashboard.modal.duplicate_dashboard_button',
  });
  let title = intl.formatMessage({ id: 'project_dashboard.duplicate_dashboard_title' });

  if (mode === DashboardMode.Create) {
    primaryButtonLabel = intl.formatMessage({ id: 'create' });
    title = intl.formatMessage({ id: 'dashboard.create_custom_dashboard' });
  } else if (mode === DashboardMode.Edit) {
    primaryButtonLabel = intl.formatMessage({ id: 'save' });
    title = intl.formatMessage({ id: 'dashboard.edit_dashboard_title' });
  }

  return {
    descriptionLabel: intl.formatMessage({ id: 'project_dashboard.dashboard_description' }),
    descriptionPlaceholder: intl.formatMessage({
      id: 'project_dashboard.modal.dashboard_description_placeholder',
    }),
    duplicateModeDescription: intl.formatMessage({
      id: 'project_dashboard.duplicate_dashboard_description',
    }),
    nameLabel: intl.formatMessage({ id: 'project_dashboard.dashboard_name' }),
    namePlaceholder: intl.formatMessage({
      id: 'project_dashboard.modal.dashboard_name_placeholder',
    }),
    primaryButtonLabel,
    secondaryButtonLabel: intl.formatMessage({ id: 'cancel' }),
    shouldShowPermissionAccessMessage:
      mode === DashboardMode.Create || mode === DashboardMode.Duplicate,
    title,
  };
}
