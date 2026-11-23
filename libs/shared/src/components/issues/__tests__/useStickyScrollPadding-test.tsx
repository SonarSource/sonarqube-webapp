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

import { act, render } from '@testing-library/react';
import {
  STICKY_PAGE_HEADER_HEIGHT_VAR,
  useStickyElementScrollPadding,
  useStickyScrollPadding,
} from '../useStickyScrollPadding';

function readProperty() {
  return document.documentElement.style.getPropertyValue(STICKY_PAGE_HEADER_HEIGHT_VAR);
}

function Example({ height }: Readonly<{ height: number }>) {
  useStickyScrollPadding(STICKY_PAGE_HEADER_HEIGHT_VAR, height);

  return null;
}

function ElementExample({ element }: Readonly<{ element: HTMLElement | null }>) {
  useStickyElementScrollPadding(STICKY_PAGE_HEADER_HEIGHT_VAR, element);

  return null;
}

it('should publish the height on the root element and remove it on unmount', () => {
  const { rerender, unmount } = render(<Example height={184} />);

  expect(readProperty()).toBe('184px');

  rerender(<Example height={256} />);

  expect(readProperty()).toBe('256px');

  unmount();

  expect(readProperty()).toBe('');
});

it('should not publish a height without an element', () => {
  const { unmount } = render(<ElementExample element={null} />);

  expect(readProperty()).toBe('0px');

  unmount();

  expect(readProperty()).toBe('');
});

it('should follow the height of the element', () => {
  let notifyResize: () => void = jest.fn();
  const originalResizeObserver = global.ResizeObserver;
  global.ResizeObserver = class {
    constructor(callback: () => void) {
      notifyResize = callback;
    }

    observe = jest.fn();
    disconnect = jest.fn();
  } as unknown as typeof ResizeObserver;

  const element = document.createElement('div');
  jest.spyOn(element, 'offsetHeight', 'get').mockReturnValue(61);

  const { unmount } = render(<ElementExample element={element} />);
  act(() => {
    notifyResize();
  });

  expect(readProperty()).toBe('61px');

  unmount();
  global.ResizeObserver = originalResizeObserver;
});
