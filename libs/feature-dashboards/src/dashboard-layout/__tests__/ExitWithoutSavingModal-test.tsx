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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '~shared/helpers/test-utils';
import { EditToolbar } from '../EditToolbar';
import { ExitWithoutSavingModal } from '../ExitWithoutSavingModal';

const onConfirm = jest.fn();

beforeEach(() => {
  onConfirm.mockClear();
});

describe('ExitWithoutSavingModal', () => {
  it('confirms immediately when there are no unsaved changes', async () => {
    const user = userEvent.setup();

    renderWithContext(<ExitWithoutSavingModal hasUnsavedChanges={false} onConfirm={onConfirm} />);

    await user.click(screen.getByTestId('project-dashboard-cancel-changes-button'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks for confirmation before discarding unsaved changes', async () => {
    const user = userEvent.setup();

    renderWithContext(<ExitWithoutSavingModal hasUnsavedChanges onConfirm={onConfirm} />);

    await user.click(screen.getByTestId('project-dashboard-cancel-changes-button'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('project_dashboard.exit_without_saving_message')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'project_dashboard.go_back_to_editing' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('project-dashboard-cancel-changes-button'));
    await user.click(screen.getByRole('button', { name: 'project_dashboard.exit_without_saving' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('EditToolbar', () => {
  it('wires the dashboard editing actions', async () => {
    const onExitEdit = jest.fn();
    const onSaveChanges = jest.fn();
    const onSetIsAddWidgetModalOpen = jest.fn();
    const onSetIsCreateSectionModalOpen = jest.fn();
    const { user } = renderWithContext(
      <EditToolbar
        hasUnsavedChanges={false}
        isUpdatingDashboard={false}
        onExitEdit={onExitEdit}
        onSaveChanges={onSaveChanges}
        onSetIsAddWidgetModalOpen={onSetIsAddWidgetModalOpen}
        onSetIsCreateSectionModalOpen={onSetIsCreateSectionModalOpen}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'project_dashboard.cancel_changes' }));
    await user.click(screen.getByRole('button', { name: 'project_dashboard.save_changes' }));
    await user.click(screen.getByRole('button', { name: 'dashboard.add_widget' }));
    await user.click(screen.getByRole('button', { name: 'project_dashboard.new_section' }));

    expect(onExitEdit).toHaveBeenCalledTimes(1);
    expect(onSaveChanges).toHaveBeenCalledTimes(1);
    expect(onSetIsAddWidgetModalOpen).toHaveBeenCalledWith(true);
    expect(onSetIsCreateSectionModalOpen).toHaveBeenCalledWith(true);
  });

  it('shows the unsaved state and disables saving while an update is pending', () => {
    renderWithContext(
      <EditToolbar
        hasUnsavedChanges
        isUpdatingDashboard
        onExitEdit={jest.fn()}
        onSaveChanges={jest.fn()}
        onSetIsAddWidgetModalOpen={jest.fn()}
        onSetIsCreateSectionModalOpen={jest.fn()}
      />,
    );

    expect(screen.getByText('project_dashboard.save_changes_message')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'loading project_dashboard.save_changes' }),
    ).toBeDisabled();
  });
});
