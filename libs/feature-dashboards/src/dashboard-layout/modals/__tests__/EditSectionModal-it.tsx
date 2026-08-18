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
import { EditSectionModal } from '../EditSectionModal';

const defaultProps = {
  initialName: 'Test Section',
  initialDescription: 'Test Description',
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
};

describe('EditSectionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial values and handle complete form interaction workflow', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = jest.fn();
    const mockOnClose = jest.fn();

    renderWithContext(
      <EditSectionModal {...defaultProps} onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    // Verify initial rendering and values
    expect(screen.getByDisplayValue('Test Section')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'save' })).toBeEnabled();

    // Test form editing
    const nameInput = screen.getByDisplayValue('Test Section');
    const descriptionInput = screen.getByDisplayValue('Test Description');

    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Section');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    // Test save functionality
    await user.click(screen.getByRole('button', { name: 'save' }));
    expect(mockOnConfirm).toHaveBeenCalledWith('Updated Section', 'Updated Description');
    expect(mockOnClose).toHaveBeenCalled();

    // Test validation: empty name should disable save button
    mockOnConfirm.mockClear();
    mockOnClose.mockClear();

    // Start fresh with a new render to test validation
    renderWithContext(
      <EditSectionModal {...defaultProps} onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInputForValidation = screen.getByDisplayValue('Test Section');
    await user.clear(nameInputForValidation);
    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();

    // Test cancel functionality and form reset
    await user.type(nameInputForValidation, 'Temporary Name');
    await user.click(screen.getByRole('button', { name: 'cancel' }));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should reset form when modal reopens with new initial values', () => {
    const { rerender } = renderWithContext(<EditSectionModal {...defaultProps} isOpen={false} />);

    // Reopen with new initial values
    rerender(
      <EditSectionModal
        {...defaultProps}
        initialDescription="New Initial Description"
        initialName="New Initial Name"
        isOpen
      />,
    );

    expect(screen.getByDisplayValue('New Initial Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Initial Description')).toBeInTheDocument();
  });

  it('should handle edge cases and whitespace trimming', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = jest.fn();

    renderWithContext(<EditSectionModal {...defaultProps} onConfirm={mockOnConfirm} />);

    // Test whitespace trimming
    const nameInput = screen.getByDisplayValue('Test Section');
    const descriptionInput = screen.getByDisplayValue('Test Description');

    await user.clear(nameInput);
    await user.type(nameInput, '  Trimmed Name  ');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '  Trimmed Description  ');

    await user.click(screen.getByRole('button', { name: 'save' }));
    expect(mockOnConfirm).toHaveBeenCalledWith('Trimmed Name', 'Trimmed Description');

    // Test that whitespace-only name disables save
    await user.clear(nameInput);
    await user.type(nameInput, '   ');
    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });

  it('should not render when modal is closed', () => {
    renderWithContext(<EditSectionModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByDisplayValue('Test Section')).not.toBeInTheDocument();
  });

  it('should close without confirming when the modal is dismissed with Escape', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    renderWithContext(
      <EditSectionModal {...defaultProps} onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const nameInput = screen.getByDisplayValue('Test Section');
    await user.clear(nameInput);
    await user.type(nameInput, 'Draft Name');

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
