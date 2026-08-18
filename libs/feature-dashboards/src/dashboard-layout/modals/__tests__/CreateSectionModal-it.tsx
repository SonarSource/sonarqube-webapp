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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '~shared/helpers/test-utils';
import { CreateSectionModal } from '../CreateSectionModal';

const mockOnClose = jest.fn();
const mockOnConfirm = jest.fn();

beforeEach(() => {
  mockOnClose.mockClear();
  mockOnConfirm.mockClear();
});

describe('CreateSectionModal', () => {
  it('should not render when closed', () => {
    renderWithContext(
      <CreateSectionModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'dashboard.section_name' })).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'dashboard.section_description' }),
    ).toBeInTheDocument();
  });

  it('should disable create button when name is empty', () => {
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const createButton = screen.getByRole('button', { name: 'project_dashboard.create_section' });
    expect(createButton).toBeDisabled();
  });

  it('should enable create button when name is provided', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInput = screen.getByRole('textbox', { name: 'dashboard.section_name' });
    await user.type(nameInput, 'Test Section');

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: 'project_dashboard.create_section' });
      expect(createButton).toBeEnabled();
    });
  });

  it('should call onConfirm with trimmed values when create button is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInput = screen.getByRole('textbox', { name: 'dashboard.section_name' });
    const descriptionInput = screen.getByRole('textbox', {
      name: 'dashboard.section_description',
    });

    await user.type(nameInput, '  Test Section  ');
    await user.type(descriptionInput, '  Test Description  ');

    const createButton = screen.getByRole('button', { name: 'project_dashboard.create_section' });
    await user.click(createButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('Test Section', 'Test Description');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should clear form when closed', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInput = screen.getByRole('textbox', { name: 'dashboard.section_name' });
    const descriptionInput = screen.getByRole('textbox', {
      name: 'dashboard.section_description',
    });
    await user.type(nameInput, 'Test Section');
    await user.type(descriptionInput, 'Test Description');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    rerender(
      <CreateSectionModal isOpen key="reopened" onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    expect(screen.getByRole('textbox', { name: 'dashboard.section_name' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'dashboard.section_description' })).toHaveValue('');
  });

  it('should handle description as optional', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInput = screen.getByRole('textbox', { name: 'dashboard.section_name' });
    await user.type(nameInput, 'Test Section');

    const createButton = screen.getByRole('button', { name: 'project_dashboard.create_section' });
    await user.click(createButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('Test Section', '');
  });

  it('should not create section with only whitespace name', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInput = screen.getByRole('textbox', { name: 'dashboard.section_name' });
    await user.type(nameInput, '   ');

    const createButton = screen.getByRole('button', { name: 'project_dashboard.create_section' });
    expect(createButton).toBeDisabled();
  });

  it('should call onClose when the modal is dismissed with Escape', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <CreateSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInput = screen.getByRole('textbox', { name: 'dashboard.section_name' });
    await user.type(nameInput, 'Section A');
    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
