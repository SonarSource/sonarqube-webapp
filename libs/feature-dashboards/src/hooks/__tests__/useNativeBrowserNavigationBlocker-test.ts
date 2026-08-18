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
import { useNativeBrowserNavigationBlocker } from '../useNativeBrowserNavigationBlocker';

let beforeUnloadCallback: ((event: BeforeUnloadEvent) => void) | undefined;
let documentClickHandler: EventListener | undefined;

function dispatchDocumentClick(event: MouseEvent) {
  if (!documentClickHandler) {
    throw new Error('Document click handler was not registered');
  }
  documentClickHandler(event);
}

jest.mock('react-router-dom', () => ({
  useBeforeUnload: jest.fn((callback: (event: BeforeUnloadEvent) => void) => {
    beforeUnloadCallback = callback;
  }),
}));

describe('useNativeBrowserNavigationBlocker', () => {
  let addDocumentEventListenerSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;
  let historyBackSpy: jest.SpyInstance;
  let originalLocation: Location;
  let pushStateSpy: jest.SpyInstance;

  beforeEach(() => {
    beforeUnloadCallback = undefined;
    documentClickHandler = undefined;
    addDocumentEventListenerSpy = jest
      .spyOn(document, 'addEventListener')
      .mockImplementation((eventName, listener) => {
        if (eventName === 'click') {
          documentClickHandler = listener as EventListener;
        }
      });
    confirmSpy = jest.spyOn(globalThis, 'confirm').mockReturnValue(false);
    historyBackSpy = jest.spyOn(globalThis.history, 'back').mockImplementation();
    originalLocation = globalThis.location;
    pushStateSpy = jest.spyOn(globalThis.history, 'pushState').mockImplementation();

    Object.defineProperty(globalThis.history, 'state', {
      configurable: true,
      value: {},
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: originalLocation,
    });
    jest.restoreAllMocks();
  });

  it('blocks page unloads and cross-page links when enabled', () => {
    renderHook(() => {
      useNativeBrowserNavigationBlocker(true);
    });

    const preventUnload = jest.fn();
    const unloadEvent = { preventDefault: preventUnload } as unknown as BeforeUnloadEvent;
    beforeUnloadCallback?.(unloadEvent);

    expect(preventUnload).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ navigationBlocked: true }),
      '',
    );

    const link = document.createElement('a');
    link.href = `${globalThis.location.origin}/different-path`;
    const preventClick = jest.fn();
    const stopClickPropagation = jest.fn();
    const clickEvent = {
      preventDefault: preventClick,
      stopPropagation: stopClickPropagation,
      target: link,
    } as unknown as MouseEvent;

    act(() => {
      dispatchDocumentClick(clickEvent);
    });

    expect(preventClick).toHaveBeenCalledTimes(1);
    expect(stopClickPropagation).toHaveBeenCalledTimes(1);
    expect(confirmSpy).toHaveBeenCalledWith(
      'hook.use_native_browser_navigation_blocker.exit_without_saving_message',
    );
  });

  it('does not block navigation when disabled', () => {
    renderHook(() => {
      useNativeBrowserNavigationBlocker(false);
    });

    const preventUnload = jest.fn();
    const unloadEvent = { preventDefault: preventUnload } as unknown as BeforeUnloadEvent;
    beforeUnloadCallback?.(unloadEvent);

    expect(preventUnload).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(addDocumentEventListenerSpy).not.toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      true,
    );
  });

  it('allows confirmed link navigation', () => {
    confirmSpy.mockReturnValue(true);
    const mockLocation = { href: originalLocation.href };
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: mockLocation,
    });

    renderHook(() => {
      useNativeBrowserNavigationBlocker(true);
    });

    const link = document.createElement('a');
    link.href = 'http://localhost/different-path';

    act(() => {
      dispatchDocumentClick({
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: link,
      } as unknown as MouseEvent);
    });

    expect(mockLocation.href).toBe(link.href);
  });

  it('guards browser history navigation and removes the guard on cleanup', () => {
    const { unmount } = renderHook(() => {
      useNativeBrowserNavigationBlocker(true);
    });

    pushStateSpy.mockClear();
    act(() => {
      globalThis.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ navigationBlocked: true }),
      '',
    );
    expect(confirmSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(globalThis.history, 'state', {
      configurable: true,
      value: { navigationBlocked: true },
    });
    unmount();

    expect(historyBackSpy).toHaveBeenCalledTimes(1);
  });

  it('continues browser history navigation after confirmation', () => {
    confirmSpy.mockReturnValue(true);
    renderHook(() => {
      useNativeBrowserNavigationBlocker(true);
    });

    act(() => {
      globalThis.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(historyBackSpy).toHaveBeenCalledTimes(1);
  });
});
