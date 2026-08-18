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
  Divider,
  MessageInline,
  MessageVariety,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { ExitWithoutSavingModal } from './ExitWithoutSavingModal';

interface EditToolbarProps {
  hasUnsavedChanges: boolean;
  isUpdatingDashboard: boolean;
  onExitEdit: () => void;
  onSaveChanges: () => void;
  onSetIsAddWidgetModalOpen: (isOpen: boolean) => void;
  onSetIsCreateSectionModalOpen: (isOpen: boolean) => void;
}

export function EditToolbar({
  hasUnsavedChanges,
  isUpdatingDashboard,
  onExitEdit,
  onSaveChanges,
  onSetIsAddWidgetModalOpen,
  onSetIsCreateSectionModalOpen,
}: Readonly<EditToolbarProps>) {
  const { formatMessage } = useIntl();

  return (
    <div>
      <div className="sw-flex sw-gap-2 sw-items-center">
        {hasUnsavedChanges && (
          <MessageInline className="sw-text-nowrap" variety={MessageVariety.Warning}>
            {formatMessage({ id: 'project_dashboard.save_changes_message' })}
          </MessageInline>
        )}
        <ExitWithoutSavingModal hasUnsavedChanges={hasUnsavedChanges} onConfirm={onExitEdit} />
        <Button
          className="sw-min-w-min"
          data-testid="project-dashboard-save-changes-button"
          isDisabled={isUpdatingDashboard}
          isLoading={isUpdatingDashboard}
          onClick={onSaveChanges}
          variety={ButtonVariety.Primary}
        >
          {formatMessage({ id: 'project_dashboard.save_changes' })}
        </Button>
        <Divider className="sw-min-h-[36px]" isVertical />
        <Button
          className="sw-min-w-min"
          data-testid="project-dashboard-add-widget-button"
          onClick={() => {
            onSetIsAddWidgetModalOpen(true);
          }}
        >
          {formatMessage({ id: 'dashboard.add_widget' })}
        </Button>
        <Button
          className="sw-min-w-min"
          data-testid="project-dashboard-new-section-button"
          onClick={() => {
            onSetIsCreateSectionModalOpen(true);
          }}
          variety={ButtonVariety.Default}
        >
          {formatMessage({ id: 'project_dashboard.new_section' })}
        </Button>
      </div>
    </div>
  );
}
