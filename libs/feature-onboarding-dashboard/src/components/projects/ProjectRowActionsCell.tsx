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
import { OnboardingProject } from '~shared/types/onboarding';
import { ProjectsTableColumn } from './ProjectsTableCard';
import { getProjectRowActions, PROJECT_ROW_ACTION_LABEL_KEYS } from './projectRowActions';

/**
 * Header of the actions column. The design leaves it blank, so the label is only exposed to
 * assistive technology. Shared by every project table to keep the column width consistent.
 */
export const PROJECT_ROW_ACTIONS_COLUMN: ProjectsTableColumn = {
  isLabelHidden: true,
  justify: TableCellJustify.End,
  labelKey: 'onboarding_dashboard.projects.col.actions',
  width: 'auto',
};

interface Props {
  project: OnboardingProject;
}

/**
 * Trailing cell of a project row: a "more actions" menu whose entries depend on how far along the
 * onboarding of that project is — see {@link getProjectRowActions}.
 *
 * Every entry is disabled for now; the actions themselves are wired up separately.
 */
export function ProjectRowActionsCell({ project }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const actions = getProjectRowActions(project);

  return (
    <DropdownMenu
      align={DropdownMenuAlign.End}
      items={actions.map((action) => (
        <DropdownMenu.ItemButton isDisabled key={action}>
          {formatMessage({ id: PROJECT_ROW_ACTION_LABEL_KEYS[action] })}
        </DropdownMenu.ItemButton>
      ))}
    >
      <Table.CellButtonIcon
        Icon={IconMoreVertical}
        ariaLabel={formatMessage(
          { id: 'onboarding_dashboard.projects.actions.label' },
          { name: project.name },
        )}
      />
    </DropdownMenu>
  );
}
