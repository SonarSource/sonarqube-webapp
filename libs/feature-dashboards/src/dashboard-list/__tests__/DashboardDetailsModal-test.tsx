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

import { fireEvent, screen } from '@testing-library/react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { DashboardMode } from '../../types/dashboard-list';
import { DashboardDetailsModal } from '../DashboardDetailsModal';

jest.unmock('react-intl');

const dashboard = { id: 'source-dashboard', name: 'Test', description: 'Source description' };

function setup(mode = DashboardMode.Duplicate, name = dashboard.name, prefillDuplicateName = true) {
  const onSave = jest.fn();
  const onClose = jest.fn();
  const props = {
    dashboard: { ...dashboard, name },
    isOpen: true,
    isSaving: false,
    mode,
    prefillDuplicateName,
    onClose,
    onOpenChange: jest.fn(),
    onSave,
  };
  return {
    ...renderWithRouter(<DashboardDetailsModal {...props} />, { messages: 'real' }),
    onSave,
    onClose,
    props,
  };
}

function nameField() {
  return screen.getByRole('textbox', { name: /name/i });
}

function duplicateButton() {
  return screen.getByRole('button', { name: /^(Duplicate|Create duplicate)$/ });
}

describe('DashboardDetailsModal duplicate naming', () => {
  it('keeps the duplicate name blank when prefilling has not been enabled', () => {
    setup(DashboardMode.Duplicate, dashboard.name, false);
    expect(nameField()).toHaveValue('');
    expect(duplicateButton()).toBeDisabled();
  });

  it.each(['Test', 'Test - copy'])(
    'prefills and submits a fresh copy name for %s',
    async (sourceName) => {
      const { user, onSave, props } = setup(DashboardMode.Duplicate, sourceName);
      expect(nameField()).toHaveValue(`${sourceName} - copy`);
      await user.click(duplicateButton());
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ id: dashboard.id, name: `${sourceName} - copy` }),
      );
      expect(props.dashboard.name).toBe(sourceName);
    },
  );

  it('lets the user replace the suggested name', async () => {
    const { user, onSave } = setup();
    await user.clear(nameField());
    await user.type(nameField(), 'Release readiness');
    await user.click(duplicateButton());
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Release readiness' }));
  });

  it('restores the suggestion when duplication is canceled and reopened', async () => {
    const { user, rerender, props, onClose, onSave } = setup();
    await user.clear(nameField());
    await user.type(nameField(), 'Discard this name');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
    rerender(<DashboardDetailsModal {...props} isOpen={false} />);
    rerender(<DashboardDetailsModal {...props} />);
    expect(nameField()).toHaveValue('Test - copy');
  });

  it('uses the current source when another dashboard is duplicated', () => {
    const { rerender, props } = setup();
    rerender(<DashboardDetailsModal {...props} isOpen={false} />);
    rerender(
      <DashboardDetailsModal {...props} dashboard={{ ...dashboard, name: 'Another dashboard' }} />,
    );
    expect(nameField()).toHaveValue('Another dashboard - copy');
  });

  it('preserves the typed suggestion on an unrelated rerender', async () => {
    const { user, rerender, props } = setup();
    await user.clear(nameField());
    await user.type(nameField(), 'My copy');
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'My description');
    const button = duplicateButton();
    rerender(<DashboardDetailsModal {...props} isSaving />);
    expect(nameField()).toHaveValue('My copy');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('My description');
    expect(button).toBeDisabled();
  });

  it('keeps creation blank and metadata editing prefilled from the source', () => {
    const { rerender, props } = setup(DashboardMode.Create);
    expect(nameField()).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('');
    rerender(<DashboardDetailsModal {...props} mode={DashboardMode.Edit} />);
    expect(nameField()).toHaveValue(dashboard.name);
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(dashboard.description);
  });

  it('explains overlong edit names when duplicate prefilling is disabled', () => {
    setup(DashboardMode.Edit, 'x'.repeat(301), false);
    expect(nameField()).toHaveAttribute('aria-invalid', 'true');
    expect(nameField()).toHaveAccessibleDescription(/Use 300 characters or fewer[.]/);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('preserves a long source name and asks the user to shorten the suggestion', async () => {
    const { user, onSave } = setup(DashboardMode.Duplicate, 'x'.repeat(300));
    expect(nameField()).toHaveValue(`${'x'.repeat(300)} - copy`);
    expect(nameField()).toHaveAttribute('aria-invalid', 'true');
    expect(nameField()).toHaveAccessibleDescription(/Use 300 characters or fewer[.]/);
    expect(duplicateButton()).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
    await user.clear(nameField());
    await user.type(nameField(), 'A valid copy name');
    expect(duplicateButton()).toBeEnabled();
    expect(screen.queryByText('Use 300 characters or fewer.')).not.toBeInTheDocument();
  });

  it.each([DashboardMode.Create, DashboardMode.Edit, DashboardMode.Duplicate])(
    'submits once with Enter from the name field in %s mode',
    async (mode) => {
      const { user, onSave } = setup(mode);
      await user.clear(nameField());
      await user.type(nameField(), 'Keyboard dashboard{Enter}');
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Keyboard dashboard' }));
    },
  );

  it.each(['', '   ', 'x'.repeat(301)])(
    'does not submit an invalid name through the form',
    async (invalidName) => {
      const { user, onSave } = setup(DashboardMode.Edit, invalidName);
      await user.click(nameField());
      await user.keyboard('{Enter}');
      fireEvent.submit(screen.getByRole('form'));
      expect(onSave).not.toHaveBeenCalled();
    },
  );

  it('does not submit or close while a save is pending', async () => {
    const { user, onSave, onClose, props, rerender } = setup();
    rerender(<DashboardDetailsModal {...props} isSaving />);
    await user.click(nameField());
    await user.keyboard('{Enter}');
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps Enter in the description as a newline instead of submitting', async () => {
    const { user, onSave } = setup();
    const description = screen.getByRole('textbox', { name: 'Description' });
    await user.type(description, 'First line{Enter}Second line');
    expect(description).toHaveValue('First line\nSecond line');
    expect(onSave).not.toHaveBeenCalled();
  });

  it.each([
    { mode: DashboardMode.Create, expectedName: '', expectedDescription: '' },
    {
      mode: DashboardMode.Edit,
      expectedName: dashboard.name,
      expectedDescription: dashboard.description,
    },
    { mode: DashboardMode.Duplicate, expectedName: 'Test - copy', expectedDescription: '' },
  ])(
    'reinitializes both fields when reopening $mode mode',
    async ({ mode, expectedName, expectedDescription }) => {
      const { user, onSave, props, rerender } = setup(mode);
      await user.clear(nameField());
      await user.type(nameField(), 'Discarded name');
      const description = screen.getByRole('textbox', { name: 'Description' });
      await user.clear(description);
      await user.type(description, 'Discarded description');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      rerender(<DashboardDetailsModal {...props} isOpen={false} />);
      rerender(<DashboardDetailsModal {...props} />);
      expect(nameField()).toHaveValue(expectedName);
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(expectedDescription);
      expect(onSave).not.toHaveBeenCalled();
    },
  );
});
