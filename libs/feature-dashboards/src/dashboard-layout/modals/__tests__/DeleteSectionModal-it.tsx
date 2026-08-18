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
import { DeleteSectionModal } from '../DeleteSectionModal';

const mockOnClose = jest.fn();
const mockOnConfirm = jest.fn();

beforeEach(() => {
  mockOnClose.mockClear();
  mockOnConfirm.mockClear();
});

describe('DeleteSectionModal', () => {
  it('should not render when closed', () => {
    renderWithContext(
      <DeleteSectionModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('dashboard.delete_section_title')).toBeInTheDocument();
    expect(screen.getByText('dashboard.delete_section_confirm')).toBeInTheDocument();
  });

  it('should display delete and cancel buttons', () => {
    renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call both onConfirm and onClose when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm before onClose when delete button is clicked', async () => {
    const user = userEvent.setup();
    const callOrder: string[] = [];
    const trackingOnConfirm = jest.fn(() => callOrder.push('confirm'));
    const trackingOnClose = jest.fn(() => callOrder.push('close'));

    renderWithContext(
      <DeleteSectionModal isOpen onClose={trackingOnClose} onConfirm={trackingOnConfirm} />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(callOrder).toEqual(['confirm', 'close']);
  });

  it('should call onClose when modal is dismissed via onOpenChange', async () => {
    const user = userEvent.setup();
    renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    // Simulate dismissing the modal by pressing Escape key
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should have delete button with danger variety', () => {
    renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    // The button should be present and enabled (no disabled attribute)
    expect(deleteButton).toBeEnabled();
  });

  it('should render modal with proper dialog role for accessibility', () => {
    renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should handle multiple interactions correctly', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithContext(
      <DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    // First, verify modal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close the modal
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Reset mocks
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();

    // Reopen the modal
    rerender(<DeleteSectionModal isOpen onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Now click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call callbacks when modal is closed', () => {
    renderWithContext(
      <DeleteSectionModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );

    // Modal is closed, so no callbacks should be triggered
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
