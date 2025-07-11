/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { act, renderHook } from '@testing-library/react';
import { toast } from 'react-toastify';
import { MessageLevel } from '../toast-utils';
import { useToastMessage } from '../useToast';

jest.mock('react-toastify', () => ({
  toast: jest.fn().mockReturnValue('mock-toast-id'),
  isActive: jest.fn(),
}));

describe('useToastMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle success toast', () => {
    const { result } = renderHook(() => useToastMessage());

    act(() => {
      result.current.pushSuccessToast('Success message');
    });

    expect(toast).toHaveBeenCalled();
  });

  it('should handle error toast', () => {
    const { result } = renderHook(() => useToastMessage());

    act(() => {
      result.current.pushErrorToast('Error message');
    });

    expect(toast).toHaveBeenCalled();
  });

  it('should handle custom options', () => {
    const baseOptions = { position: 'top-right' as const };
    const { result } = renderHook(() => useToastMessage(baseOptions));

    act(() => {
      result.current.pushToast('Custom message', MessageLevel.Success, { autoClose: 5000 });
    });

    expect(toast).toHaveBeenCalled();
  });
});
