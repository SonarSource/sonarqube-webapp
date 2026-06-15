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

import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byPlaceholderText, byRole, byTestId } from '../../../helpers/testSelector';
import { AssigneeSelect, userToOption } from '../AssigneeSelect';

const ui = {
  input: byRole('combobox', { name: 'select assignee' }),
};

describe('AssigneeSelect', () => {
  it('should render with placeholder', () => {
    setupWithProps({
      placeholder: 'Select assignee',
    });

    expect(byPlaceholderText('Select assignee').get()).toBeInTheDocument();
  });

  it('should render options with icons', async () => {
    const { user } = setupWithProps({
      data: [
        {
          Icon: <span data-testid="avatar-1">A</span>,
          label: 'Alice',
          value: 'alice',
        },
        {
          Icon: <span data-testid="avatar-2">B</span>,
          label: 'Bob',
          value: 'bob',
        },
      ],
    });

    await user.click(ui.input.get());

    expect(byTestId('avatar-1').get()).toBeInTheDocument();
    expect(byTestId('avatar-2').get()).toBeInTheDocument();
  });

  it('should call onToggleDropdown with false when input is blurred', async () => {
    const onToggleDropdown = jest.fn();
    const { user } = setupWithProps({
      onToggleDropdown,
    });

    await user.click(ui.input.get());
    expect(onToggleDropdown).toHaveBeenCalledWith(true);

    await user.tab();
    expect(onToggleDropdown).toHaveBeenCalledWith(false);
  });

  it('should blur input when Escape key is pressed', async () => {
    const { user } = setupWithProps();

    const input = ui.input.get();
    await user.click(input);
    expect(input).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(input).not.toHaveFocus();
  });

  it('should display selected value', () => {
    setupWithProps({
      value: 'alice',
      data: [
        {
          label: 'Alice',
          value: 'alice',
        },
      ],
    });

    const input = ui.input.get();
    expect(input).toHaveValue('Alice');
  });
});

describe('userToOption', () => {
  it('should convert user with name to option', () => {
    const option = userToOption({
      login: 'alice',
      name: 'Alice Smith',
      avatar: 'avatar-hash',
    });

    expect(option.value).toBe('alice');
    expect(option.label).toBe('Alice Smith');
    expect(option.Icon).toBeDefined();
  });

  it('should use login as label when name is not provided', () => {
    const option = userToOption({
      login: 'alice',
      avatar: 'avatar-hash',
    });

    expect(option.value).toBe('alice');
    expect(option.label).toBe('alice');
    expect(option.Icon).toBeDefined();
  });

  it('should handle missing avatar', () => {
    const option = userToOption({
      login: 'alice',
      name: 'Alice Smith',
    });

    expect(option.value).toBe('alice');
    expect(option.label).toBe('Alice Smith');
    expect(option.Icon).toBeDefined();
  });
});

function setupWithProps(props: Partial<ComponentProps<typeof AssigneeSelect>> = {}) {
  return renderWithContext(
    <AssigneeSelect
      ariaLabel="select assignee"
      data={[]}
      labelNotFound="No results"
      onChange={jest.fn()}
      onSearch={jest.fn()}
      placeholder="Select"
      {...props}
    />,
  );
}
