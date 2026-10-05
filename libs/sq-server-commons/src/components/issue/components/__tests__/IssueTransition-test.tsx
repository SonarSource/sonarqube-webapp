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

import { act } from '@testing-library/react';
import { ComponentProps } from 'react';
import { IssueTransition as IssueTransitionEnum } from '~shared/types/issues';
import { getKeyboardShortcutEnabled } from '../../../../helpers/preferences';
import { mockIssue } from '../../../../helpers/testMocks';
import { renderComponent } from '../../../../helpers/testReactTestingUtils';
import IssueTransition from '../IssueTransition';

jest.mock('../../../../helpers/preferences', () => ({
  ...jest.requireActual<typeof import('../../../../helpers/preferences')>(
    '../../../../helpers/preferences',
  ),
  getKeyboardShortcutEnabled: jest.fn().mockReturnValue(true),
}));

beforeEach(() => {
  jest.mocked(getKeyboardShortcutEnabled).mockReturnValue(true);
});

function fireKeyDown(key: string, options: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  act(() => {
    document.dispatchEvent(event);
  });
  return event;
}

it('toggles the transition popup on the F shortcut', () => {
  const togglePopup = jest.fn();
  renderIssueTransition({ togglePopup });

  const event = fireKeyDown('f');

  expect(togglePopup).toHaveBeenCalledWith('transition');
  expect(event.defaultPrevented).toBe(true);
});

it('does not toggle the transition popup when the user has no visible transition', () => {
  const togglePopup = jest.fn();
  renderIssueTransition({
    issue: mockIssue(false, { transitions: [IssueTransitionEnum.Resolve] }),
    togglePopup,
  });

  const event = fireKeyDown('f');

  expect(togglePopup).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
});

it('does not toggle the transition popup when the issue is not selected', () => {
  const togglePopup = jest.fn();
  renderIssueTransition({ isSelected: false, togglePopup });

  const event = fireKeyDown('f');

  expect(togglePopup).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
});

it('does not toggle the transition popup when keyboard shortcuts are disabled', () => {
  jest.mocked(getKeyboardShortcutEnabled).mockReturnValue(false);
  const togglePopup = jest.fn();
  renderIssueTransition({ togglePopup });

  const event = fireKeyDown('f');

  expect(togglePopup).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
});

it('does not toggle the transition popup when the user is pressing another shortcut', () => {
  const togglePopup = jest.fn();
  renderIssueTransition({ togglePopup });

  const event = fireKeyDown('f', { ctrlKey: true });

  expect(togglePopup).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
});

it('does not toggle the transition popup when the event targets an input', () => {
  const togglePopup = jest.fn();
  renderIssueTransition({ togglePopup });
  const input = document.createElement('input');
  document.body.appendChild(input);

  const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true });
  Object.defineProperty(event, 'target', { value: input });
  act(() => {
    document.dispatchEvent(event);
  });

  expect(togglePopup).not.toHaveBeenCalled();
  document.body.removeChild(input);
});

it('removes the keydown listener on unmount', () => {
  const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
  const { unmount } = renderIssueTransition();

  unmount();

  expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), {
    capture: true,
  });
});

function renderIssueTransition(props: Partial<ComponentProps<typeof IssueTransition>> = {}) {
  return renderComponent(
    <IssueTransition
      isOpen={false}
      issue={mockIssue(false, { transitions: [IssueTransitionEnum.Confirm] })}
      onChange={jest.fn()}
      togglePopup={jest.fn()}
      {...props}
    />,
  );
}
