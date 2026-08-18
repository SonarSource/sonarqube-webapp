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
  ButtonIcon,
  ButtonVariety,
  DropdownMenu,
  DropdownMenuAlign,
  IconMoreVertical,
  ModalAlert,
} from '@sonarsource/echoes-react';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';

interface DashboardKebabMenuProps {
  ariaLabel: string;
  id: string;
  isVisible?: boolean;
  items: ReactNode;
}

interface DashboardKebabMenuItemsProps {
  dashboardName: string;
  isBuiltIn: boolean;
  isDeleting?: boolean;
  isFetching?: boolean;
  onDelete?: (controls: { close: () => void }) => void;
  onDownloadSchema?: () => void;
  onDuplicate?: () => void;
  onEditDashboard?: () => void;
  onEditNameDescription?: () => void;
}

export function DashboardKebabMenu(props: Readonly<DashboardKebabMenuProps>) {
  const { ariaLabel, id, isVisible = true, items } = props;

  if (!isVisible) {
    return null;
  }

  return (
    <DropdownMenu align={DropdownMenuAlign.End} id={id} items={items}>
      <ButtonIcon Icon={IconMoreVertical} ariaLabel={ariaLabel} variety={ButtonVariety.Default} />
    </DropdownMenu>
  );
}

export function DashboardKebabMenuItems(props: Readonly<DashboardKebabMenuItemsProps>) {
  const {
    dashboardName,
    isBuiltIn,
    isDeleting = false,
    onDelete,
    onDownloadSchema,
    onDuplicate,
    onEditDashboard,
    onEditNameDescription,
  } = props;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const intl = useIntl();

  return (
    <>
      {onEditNameDescription && (
        <DropdownMenu.ItemButton
          isDisabled={isBuiltIn}
          onClick={() => {
            onEditNameDescription();
          }}
        >
          {intl.formatMessage({ id: 'dashboard.edit_dashboard_title' })}
        </DropdownMenu.ItemButton>
      )}
      {onEditDashboard && (
        <DropdownMenu.ItemButton
          isDisabled={isBuiltIn}
          onClick={() => {
            onEditDashboard();
          }}
        >
          {intl.formatMessage({ id: 'dashboard.edit_dashboard' })}
        </DropdownMenu.ItemButton>
      )}
      {onDuplicate && (
        <DropdownMenu.ItemButton
          onClick={() => {
            onDuplicate();
          }}
        >
          {intl.formatMessage({ id: 'dashboard.list.actions.duplicate' })}
        </DropdownMenu.ItemButton>
      )}
      {onDownloadSchema && (
        <DropdownMenu.ItemButton
          onClick={() => {
            onDownloadSchema();
          }}
        >
          {intl.formatMessage({ id: 'dashboard.download_schema' })}
        </DropdownMenu.ItemButton>
      )}
      {onDelete && (
        <ModalAlert
          description={intl.formatMessage(
            {
              id: 'dashboard.modal.delete_dashboard.description',
            },
            { dashboardName },
          )}
          isOpen={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          primaryButton={
            <Button
              isDisabled={isDeleting}
              isLoading={isDeleting}
              onClick={() => {
                const close = () => {
                  setIsDeleteModalOpen(false);
                };
                onDelete({ close });
              }}
              variety={ButtonVariety.Danger}
            >
              {intl.formatMessage({ id: 'delete' })}
            </Button>
          }
          secondaryButton={
            <Button
              isDisabled={isDeleting}
              onClick={() => {
                setIsDeleteModalOpen(false);
              }}
            >
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
          }
          title={intl.formatMessage({ id: 'dashboard.modal.delete_dashboard.title' })}
        >
          <DropdownMenu.ItemButtonDestructive
            isDisabled={isBuiltIn}
            onClick={() => {
              setIsDeleteModalOpen(true);
            }}
          >
            {intl.formatMessage({ id: 'dashboard.list.actions.delete' })}
          </DropdownMenu.ItemButtonDestructive>
        </ModalAlert>
      )}
    </>
  );
}
