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

import { act, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { isInput } from '../../../helpers/keyboard';
import { renderWithContext } from '../../../helpers/test-utils';
import { byTestId, byText } from '../../../helpers/testSelector';
import { IssueTags } from '../IssueTags';

jest.mock('../../../helpers/keyboard', () => ({
  ...jest.requireActual('../../../helpers/keyboard'),
  isInput: jest.fn().mockReturnValue(false),
}));

const mockScrollIntoView = jest.fn();

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: mockScrollIntoView,
    writable: true,
  });
});

const issue = { key: 'issue-key', tags: ['mytag', 'test'] };
const overlay = <div data-testid="mock-overlay">option</div>;

beforeEach(() => {
  jest.clearAllMocks();
});

function fireKeyDown(key: string, options: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

it('should render with the action', () => {
  setupWithProps();
  expect(byText('+').get()).toBeVisible();
});

it('should render without the action when canSetTags is false', () => {
  setupWithProps({ canSetTags: false });
  expect(byText('+').query()).not.toBeInTheDocument();
});

it('should open popup when + is clicked', async () => {
  const { user } = setupWithProps();

  await user.click(byText('+').get());
  expect(byTestId('mock-overlay').get()).toBeVisible();
});

it('should open popup using keyboard shortcut t', () => {
  setupWithProps();

  const event = fireKeyDown('t');
  expect(byTestId('mock-overlay').get()).toBeVisible();
  expect(event.defaultPrevented).toBe(true);
});

it('should scroll into view when opened via keyboard', async () => {
  setupWithProps();

  const event = fireKeyDown('t');
  expect(await byTestId('mock-overlay').find()).toBeVisible();

  expect(event.defaultPrevented).toBe(true);
  expect(mockScrollIntoView).toHaveBeenCalled();
});

it('should not open using keyboard shortcut if user is trying another shortcut', async () => {
  const { user } = setupWithProps();

  await user.keyboard('{Control>}t{/Control}');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();

  await user.keyboard('{Meta>}t{/Meta}');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();

  await user.keyboard('{Alt>}t{/Alt}');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

it('should not open popup via keyboard if isInput returns true', () => {
  jest.mocked(isInput).mockReturnValueOnce(true);
  setupWithProps();

  const event = fireKeyDown('t');

  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(event.defaultPrevented).toBe(false);
});

it('should not open popup via keyboard when deselected', () => {
  const { rerender } = setupWithProps();

  const event1 = fireKeyDown('t');
  expect(byTestId('mock-overlay').get()).toBeVisible();
  expect(event1.defaultPrevented).toBe(true);

  rerender(createComponent({ selectedIssueKey: undefined }));
  const event2 = fireKeyDown('t');

  expect(byTestId('mock-overlay').query()).not.toBeInTheDocument();
  expect(event2.defaultPrevented).toBe(false);
});

it('should not open popup via keyboard if issue is not selected', () => {
  setupWithProps({ selectedIssueKey: undefined });

  const event = fireKeyDown('t');

  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(event.defaultPrevented).toBe(false);
});

it('should not open popup via keyboard if canSetTags is false', () => {
  setupWithProps({ canSetTags: false });

  const event = fireKeyDown('t');

  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(event.defaultPrevented).toBe(false);
});

describe('add/remove event listener', () => {
  const {
    addEventListener: originalAddEventListener,
    removeEventListener: originalRemoveEventListener,
  } = window;

  beforeEach(() => {
    window.removeEventListener = jest.fn();
    window.addEventListener = jest.fn();
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    jest.clearAllMocks();
  });

  it('should add/remove event listener when issue is selected/unselected', () => {
    const { rerender } = setupWithProps();

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    rerender(createComponent({ selectedIssueKey: undefined }));

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should add/remove event listener when canSetTags changes', () => {
    const { rerender } = setupWithProps();

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    rerender(createComponent({ canSetTags: false }));

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

it('should delegate popup state to togglePopup when provided', async () => {
  const togglePopup = jest.fn();
  const { user } = setupWithProps({ togglePopup, isOpen: false });

  await user.click(byText('+').get());
  expect(togglePopup).toHaveBeenCalledWith('edit-tags', true);
});

function setupWithProps(props: Partial<ComponentProps<typeof IssueTags>> = {}) {
  return renderWithContext(createComponent(props));
}

function createComponent(props: Partial<ComponentProps<typeof IssueTags>> = {}) {
  return (
    <IssueTags canSetTags issue={issue} overlay={overlay} selectedIssueKey={issue.key} {...props} />
  );
}
