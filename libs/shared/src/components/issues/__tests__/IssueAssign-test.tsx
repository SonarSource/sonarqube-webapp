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
import { ComponentProps, useEffect, useRef } from 'react';
import { isInput } from '../../../helpers/keyboard';
import { fireCustomKeyboardEvent, renderWithContext } from '../../../helpers/test-utils';
import { AssigneeSelect } from '../AssigneeSelect';
import { DropdownRenderProps, IssueAssign } from '../IssueAssign';

jest.mock('~shared/helpers/keyboard', () => ({
  ...jest.requireActual('~shared/helpers/keyboard'),
  isInput: jest.fn().mockReturnValue(false),
}));

const mockScrollIntoView = jest.fn();

beforeAll(() => {
  // Mock scrollIntoView on HTMLElement prototype
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: mockScrollIntoView,
    writable: true,
  });
});

const issue = {
  assignee: 'john',
  assigneeActive: true,
  assigneeAvatar: 'gravatarhash',
  assigneeName: 'John Doe',
  key: 'issue-key',
  projectOrganization: 'org',
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('should render without the action when the correct rights are missing', () => {
  setupWithProps({ canAssign: false });
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});

it('should render with the action', async () => {
  const onAssign = jest.fn();
  const { user } = setupWithProps({ onAssign });
  const selectContainer = screen.getByRole('combobox');

  expect(selectContainer).toBeInTheDocument();

  await user.click(selectContainer);
  await user.click(screen.getByRole('option'));
  expect(onAssign).toHaveBeenCalled();
});

it('should assign with keyboard', async () => {
  const onAssign = jest.fn();
  const { user } = setupWithProps({ onAssign });

  const myEvent = fireCustomKeyboardEvent('keyDown', 'a');
  await user.click(screen.getByRole('option'));

  expect(onAssign).toHaveBeenCalled();
  expect(myEvent.defaultPrevented).toBe(true);
});

it('should scroll to issue if selected with keyboard', () => {
  setupWithProps();

  const myEvent = fireCustomKeyboardEvent('keyDown', 'a');
  expect(myEvent.defaultPrevented).toBe(true);
  expect(mockScrollIntoView).toHaveBeenCalled();
});

it('should scroll to top if issue is selected and opened with keyboard', () => {
  setupWithProps();

  const myEvent = fireCustomKeyboardEvent('keyDown', 'a');
  expect(myEvent.defaultPrevented).toBe(true);
  expect(mockScrollIntoView).toHaveBeenCalled();
});

it('should not open using keyboard shortcut if user is trying another shortcut', async () => {
  const { user } = setupWithProps();
  await user.keyboard('{Control>}a{/Control}');
  expect(screen.queryByRole('option')).not.toBeInTheDocument();

  await user.keyboard('{Meta>}a{/Meta}');
  expect(screen.queryByRole('option')).not.toBeInTheDocument();

  await user.keyboard('{Alt>}a{/Alt}');
  expect(screen.queryByRole('option')).not.toBeInTheDocument();
});

it('should not assign with keyboard if in input', () => {
  jest.mocked(isInput).mockReturnValueOnce(true);
  const onAssign = jest.fn();
  setupWithProps({ onAssign });

  const myEvent = fireCustomKeyboardEvent('keyDown', 'a');
  expect(screen.queryByRole('option')).not.toBeInTheDocument();

  expect(onAssign).not.toHaveBeenCalled();
  expect(myEvent.defaultPrevented).toBe(false);
});

it('should not assign with keyboard if initially not selected', () => {
  const onAssign = jest.fn();
  setupWithProps({ onAssign, isSelected: false });

  const myEvent = fireCustomKeyboardEvent('keyDown', 'a');

  expect(screen.queryByRole('option')).not.toBeInTheDocument();
  expect(onAssign).not.toHaveBeenCalled();
  expect(myEvent.defaultPrevented).toBe(false);
});

it('should not assign with keyboard is cannot assign', () => {
  const onAssign = jest.fn();
  setupWithProps({ onAssign, canAssign: false });

  const myEvent = fireCustomKeyboardEvent('keyDown', 'a');

  expect(screen.queryByRole('option')).not.toBeInTheDocument();
  expect(onAssign).not.toHaveBeenCalled();
  expect(myEvent.defaultPrevented).toBe(false);
});

it('should render a fallback assignee display if assignee info are not available', () => {
  setupWithProps({ issue: { key: 'issue-key' } });
  expect(screen.getByText('unassigned')).toBeInTheDocument();
});

it('should properly display inactive assignee', () => {
  setupWithProps({ issue: { ...issue, assigneeActive: false } });
  expect(screen.getByText('user.x_deleted.john')).toBeInTheDocument();
});

describe('add/remove event listener', () => {
  const {
    addEventListener: originalAddEventListener,
    removeEventListener: originalRemoveEventListener,
  } = window;

  beforeEach(() => {
    jest.clearAllMocks();
    window.removeEventListener = jest.fn();
    window.addEventListener = jest.fn();
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it('should add/remove event listener if selected/not selected', () => {
    const { rerender } = setupWithProps({});

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    rerender(createComponent({ isSelected: false }));

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should add/remove event listener if it can assign/cannot assign', () => {
    const { rerender } = setupWithProps();

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    rerender(createComponent({ canAssign: false }));

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

function TestAssigneeDropdown({
  menuIsOpen,
  onMenuClose,
  onSelect,
  value,
  valueRenderer,
}: DropdownRenderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (menuIsOpen) {
      inputRef.current?.focus();
    }
  }, [menuIsOpen]);

  return (
    <>
      {valueRenderer()}
      <AssigneeSelect
        ariaLabel="assignee"
        data={[{ label: 'Jane Doe', value: 'jane' }]}
        labelNotFound="No results"
        onChange={(option) => onSelect({ login: option.value, name: option.label })}
        onSearch={jest.fn()}
        onToggleDropdown={(isOpen) => {
          if (!isOpen) {
            onMenuClose();
          }
        }}
        placeholder="unassigned"
        ref={inputRef}
        value={value}
      />
    </>
  );
}

function renderDropdown(props: DropdownRenderProps) {
  return <TestAssigneeDropdown {...props} />;
}

function setupWithProps(props: Partial<ComponentProps<typeof IssueAssign>> = {}) {
  return renderWithContext(createComponent(props), {
    initialCurrentUser: { isLoggedIn: true },
  });
}

function createComponent(props: Partial<ComponentProps<typeof IssueAssign>> = {}) {
  return (
    <IssueAssign
      canAssign
      isSelected
      issue={issue}
      onAssign={jest.fn()}
      renderDropdown={renderDropdown}
      {...props}
    />
  );
}
