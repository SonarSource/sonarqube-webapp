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
import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { WorkspaceHeader } from '../WorkspaceHeader';

describe('WorkspaceHeader', () => {
  it('renders children', () => {
    setupWithProps();
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });

  it('calls onCollapse when the minimize button is clicked', async () => {
    const onCollapse = jest.fn();
    const { user } = setupWithProps({ onCollapse });

    await user.click(screen.getByRole('button', { name: 'workspace.minimize' }));
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    const { user } = setupWithProps({ onClose });

    await user.click(screen.getByRole('button', { name: 'workspace.close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('maximize / minimize toggle', () => {
    it('shows the expand button when not maximized', () => {
      setupWithProps({ maximized: false });
      expect(screen.getByRole('button', { name: 'workspace.full_window' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'workspace.normal_size' }),
      ).not.toBeInTheDocument();
    });

    it('shows the collapse button when maximized', () => {
      setupWithProps({ maximized: true });
      expect(screen.getByRole('button', { name: 'workspace.normal_size' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'workspace.full_window' }),
      ).not.toBeInTheDocument();
    });

    it('calls onMaximize when expand button is clicked', async () => {
      const onMaximize = jest.fn();
      const { user } = setupWithProps({ maximized: false, onMaximize });

      await user.click(screen.getByRole('button', { name: 'workspace.full_window' }));
      expect(onMaximize).toHaveBeenCalledTimes(1);
    });

    it('calls onMinimize when collapse button is clicked', async () => {
      const onMinimize = jest.fn();
      const { user } = setupWithProps({ maximized: true, onMinimize });

      await user.click(screen.getByRole('button', { name: 'workspace.normal_size' }));
      expect(onMinimize).toHaveBeenCalledTimes(1);
    });
  });

  describe('resize drag handle', () => {
    it('calls onResize with the delta when dragging', () => {
      const onResize = jest.fn();
      setupWithProps({ onResize });

      const resizer = getResizer();
      firePointer(resizer, 'pointerdown', 100);
      firePointer(resizer, 'pointermove', 120);

      expect(onResize).toHaveBeenCalledWith(20);
    });

    it('calls onResize with accumulated deltas across multiple moves', () => {
      const onResize = jest.fn();
      setupWithProps({ onResize });

      const resizer = getResizer();
      firePointer(resizer, 'pointerdown', 50);
      firePointer(resizer, 'pointermove', 60); // delta = 10
      firePointer(resizer, 'pointermove', 75); // delta = 15

      expect(onResize).toHaveBeenNthCalledWith(1, 10);
      expect(onResize).toHaveBeenNthCalledWith(2, 15);
    });

    it('does not call onResize on pointermove without a prior pointerdown', () => {
      const onResize = jest.fn();
      setupWithProps({ onResize });

      firePointer(getResizer(), 'pointermove', 100);

      expect(onResize).not.toHaveBeenCalled();
    });

    it('stops calling onResize after pointerup', () => {
      const onResize = jest.fn();
      setupWithProps({ onResize });

      const resizer = getResizer();
      firePointer(resizer, 'pointerdown', 100);
      firePointer(resizer, 'pointermove', 110); // delta = 10
      firePointer(resizer, 'pointerup', 110);
      firePointer(resizer, 'pointermove', 130); // should be ignored

      expect(onResize).toHaveBeenCalledTimes(1);
      expect(onResize).toHaveBeenCalledWith(10);
    });
  });
});

const defaultProps: ComponentProps<typeof WorkspaceHeader> = {
  children: <span>My Component</span>,
  onClose: jest.fn(),
  onCollapse: jest.fn(),
  onMaximize: jest.fn(),
  onMinimize: jest.fn(),
  onResize: jest.fn(),
};

function setupWithProps(props: Partial<ComponentProps<typeof WorkspaceHeader>> = {}) {
  return renderWithContext(<WorkspaceHeader {...defaultProps} {...props} />);
}

// The resizer is the second child of the header — a non-semantic styled div
function getResizer() {
  // eslint-disable-next-line testing-library/no-node-access
  const resizer = document.querySelector('header')?.children[1];
  if (!resizer) {
    throw new Error('Resizer element not found');
  }
  return resizer;
}

// jsdom doesn't implement pointer capture — stub it on every element we fire on
function stubPointerCapture(element: Element) {
  if (!element.setPointerCapture) {
    element.setPointerCapture = jest.fn();
  }
  if (!element.releasePointerCapture) {
    element.releasePointerCapture = jest.fn();
  }
}

function firePointer(
  element: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  clientY: number,
) {
  stubPointerCapture(element);
  // Use MouseEvent directly — jsdom doesn't implement PointerEvent but correctly
  // passes clientY through MouseEvent, which is all the component reads.
  fireEvent(element, new MouseEvent(type, { clientY, bubbles: true, cancelable: true }));
}
