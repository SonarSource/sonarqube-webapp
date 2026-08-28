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
  DropdownMenu,
  DropdownMenuAlign,
  IconMoreVertical,
  Table,
  TableCellJustify,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { JourneyStep, RowActionKind } from '../../../types/types';
import { ProjectsTableColumn } from '../../projects/ProjectsTable';
import { DEVOPS_CONFIGURATION_ROW_ACTION_LABEL_KEYS } from './devopsConfigurationRowActions';
import { DevopsConfigurationRow } from './devopsConfigurationRows';
import { useDevopsConfigurationRowActionItems } from './useDevopsConfigurationRowActionItems';

// The design leaves this header blank, so its label is only exposed to assistive technology.
export const DEVOPS_CONFIGURATION_ROW_ACTIONS_COLUMN: ProjectsTableColumn = {
  isLabelHidden: true,
  justify: TableCellJustify.End,
  labelKey: 'onboarding_dashboard.projects.col.actions',
  width: 'auto',
};

interface Props {
  onGoToStep: (step: JourneyStep) => void;
  row: DevopsConfigurationRow;
}

export function DevopsConfigurationRowActionsCell({ onGoToStep, row }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const items = useDevopsConfigurationRowActionItems(row, { onGoToStep });

  return (
    <DropdownMenu
      align={DropdownMenuAlign.End}
      items={items.map((item) => {
        const label = formatMessage(
          { id: DEVOPS_CONFIGURATION_ROW_ACTION_LABEL_KEYS[item.action] },
          item.labelValues,
        );

        return item.kind === RowActionKind.Link ? (
          <DropdownMenu.ItemLink
            enableOpenInNewTab={item.isExternal}
            hasExternalIcon={item.isExternal}
            key={item.action}
            to={item.to}
          >
            {label}
          </DropdownMenu.ItemLink>
        ) : (
          <DropdownMenu.ItemButton key={item.action} onClick={item.onClick}>
            {label}
          </DropdownMenu.ItemButton>
        );
      })}
    >
      <Table.CellButtonIcon
        Icon={IconMoreVertical}
        ariaLabel={formatMessage(
          { id: 'onboarding_dashboard.projects.actions.label' },
          { name: row.key },
        )}
      />
    </DropdownMenu>
  );
}
