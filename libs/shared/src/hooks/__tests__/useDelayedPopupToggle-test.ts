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

import { act, renderHook } from '@testing-library/react';
import { useDelayedPopupToggle } from '../useDelayedPopupToggle';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDelayedPopupToggle', () => {
  it('closes the currently open popup immediately when it is requested again', () => {
    const togglePopup = jest.fn();
    const { result } = renderHook(() => useDelayedPopupToggle('transition', togglePopup));

    act(() => {
      result.current('transition', true);
    });

    expect(togglePopup).toHaveBeenCalledTimes(1);
    expect(togglePopup).toHaveBeenCalledWith('transition', false);
  });

  it('closes the currently open popup then opens the next one after a delay', () => {
    const togglePopup = jest.fn();
    const { result } = renderHook(() => useDelayedPopupToggle('transition', togglePopup));

    act(() => {
      result.current('edit-tags', true);
    });

    expect(togglePopup).toHaveBeenCalledTimes(1);
    expect(togglePopup).toHaveBeenCalledWith('transition', false);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(togglePopup).toHaveBeenCalledTimes(2);
    expect(togglePopup).toHaveBeenLastCalledWith('edit-tags', true);
  });

  it('opens a popup immediately when none is currently open', () => {
    const togglePopup = jest.fn();
    const { result } = renderHook(() => useDelayedPopupToggle(undefined, togglePopup));

    act(() => {
      result.current('edit-tags', true);
    });

    expect(togglePopup).toHaveBeenCalledTimes(1);
    expect(togglePopup).toHaveBeenCalledWith('edit-tags', true);
  });

  it('closes the requested popup immediately when show is explicitly false', () => {
    const togglePopup = jest.fn();
    const { result } = renderHook(() => useDelayedPopupToggle('edit-tags', togglePopup));

    act(() => {
      result.current('edit-tags', false);
    });

    expect(togglePopup).toHaveBeenCalledTimes(1);
    expect(togglePopup).toHaveBeenCalledWith('edit-tags', false);
  });
});
