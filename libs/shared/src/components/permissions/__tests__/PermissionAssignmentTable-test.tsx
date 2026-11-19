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

import { useState } from 'react';
import { render } from '../../../helpers/test-utils';
import { byRole } from '../../../helpers/testSelector';
import {
  PermissionAssignment,
  PermissionAssignmentTable,
  PermissionPrincipal,
} from '../PermissionAssignmentTable';

const principals: PermissionPrincipal[] = [
  { id: 'same-id', name: 'Developers', description: 'Development team', type: 'group' },
  { id: 'same-id', name: 'Alice', type: 'user' },
];
const hiddenAssignment: PermissionAssignment = {
  principalId: 'another-page',
  principalType: 'group',
  permissions: ['codeviewer'],
};
const ui = {
  all: byRole('checkbox', { name: 'Select all shown' }),
  browse: byRole('checkbox', { name: 'Browse for all shown' }),
  source: byRole('checkbox', { name: 'See Source Code for all shown' }),
  developers: byRole('checkbox', { name: 'Select Developers' }),
  alice: byRole('checkbox', { name: 'Select Alice' }),
  developersBrowse: byRole('checkbox', { name: 'Developers: Browse' }),
  developersSource: byRole('checkbox', { name: 'Developers: See Source Code' }),
  aliceBrowse: byRole('checkbox', { name: 'Alice: Browse' }),
  aliceSource: byRole('checkbox', { name: 'Alice: See Source Code' }),
};

it('updates individual permissions and removes assignments when their last permission is cleared', async () => {
  const { user, onChange } = setup();

  expect(ui.all.get()).not.toBeChecked();
  await user.click(ui.developersSource.get());
  expect(ui.developers.get()).toBeChecked();
  expect(ui.alice.get()).not.toBeChecked();
  await user.click(ui.developersBrowse.get());
  await user.click(ui.developersSource.get());
  expect(onChange).toHaveBeenLastCalledWith([
    { principalId: 'same-id', principalType: 'group', permissions: ['user'] },
  ]);
  await user.click(ui.developersBrowse.get());
  expect(onChange).toHaveBeenLastCalledWith([]);
  expect(ui.developers.get()).not.toBeChecked();
});

it('selects unassigned rows with Browse and clears shown rows without affecting other pages', async () => {
  const { user, onChange } = setup([
    hiddenAssignment,
    { principalId: 'same-id', principalType: 'user', permissions: ['codeviewer'] },
  ]);

  expect(ui.all.get()).toBePartiallyChecked();
  await user.click(ui.all.get());
  expect(ui.all.get()).toBeChecked();
  expect(ui.developersBrowse.get()).toBeChecked();
  expect(ui.aliceBrowse.get()).not.toBeChecked();
  expect(ui.aliceSource.get()).toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith([
    hiddenAssignment,
    { principalId: 'same-id', principalType: 'user', permissions: ['codeviewer'] },
    { principalId: 'same-id', principalType: 'group', permissions: ['user'] },
  ]);

  await user.click(ui.all.get());
  expect(ui.all.get()).not.toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith([hiddenAssignment]);
});

it('selects and clears a permission column while preserving other permissions and pages', async () => {
  const { user, onChange } = setup([
    hiddenAssignment,
    { principalId: 'same-id', principalType: 'user', permissions: ['codeviewer'] },
  ]);

  expect(ui.browse.get()).not.toBeChecked();
  expect(ui.source.get()).toBePartiallyChecked();
  await user.click(ui.developersBrowse.get());
  expect(ui.browse.get()).toBePartiallyChecked();
  await user.click(ui.browse.get());
  expect(ui.browse.get()).toBeChecked();
  expect(ui.developersBrowse.get()).toBeChecked();
  expect(ui.aliceBrowse.get()).toBeChecked();

  await user.click(ui.browse.get());
  expect(ui.browse.get()).not.toBeChecked();
  expect(ui.aliceSource.get()).toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith([
    hiddenAssignment,
    { principalId: 'same-id', principalType: 'user', permissions: ['codeviewer'] },
  ]);
});

it('clears every permission in a row and grants Browse when selecting it again', async () => {
  const { user, onChange } = setup([
    { principalId: 'same-id', principalType: 'group', permissions: ['user', 'codeviewer'] },
    { principalId: 'same-id', principalType: 'user', permissions: ['codeviewer'] },
  ]);

  await user.click(ui.developers.get());
  expect(ui.developersBrowse.get()).not.toBeChecked();
  expect(ui.developersSource.get()).not.toBeChecked();
  expect(ui.aliceSource.get()).toBeChecked();
  await user.click(ui.developers.get());
  expect(onChange).toHaveBeenLastCalledWith([
    { principalId: 'same-id', principalType: 'user', permissions: ['codeviewer'] },
    { principalId: 'same-id', principalType: 'group', permissions: ['user'] },
  ]);
});

it('disables bulk selection when no principals are shown', () => {
  setup([], []);

  expect(ui.all.get()).toHaveAttribute('aria-disabled', 'true');
  expect(ui.browse.get()).toHaveAttribute('aria-disabled', 'true');
  expect(ui.source.get()).toHaveAttribute('aria-disabled', 'true');
  expect(ui.all.get()).not.toBeChecked();
});

function setup(initialValue: PermissionAssignment[] = [], shownPrincipals = principals) {
  const onChange = jest.fn();

  function ControlledTable() {
    const [value, setValue] = useState(initialValue);
    return (
      <PermissionAssignmentTable
        ariaLabel="Assign permissions"
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
        permissions={[
          { key: 'user', name: 'Browse', selectAllLabel: 'Browse for all shown' },
          {
            key: 'codeviewer',
            name: 'See Source Code',
            selectAllLabel: 'See Source Code for all shown',
          },
        ]}
        principalColumnLabel="Groups and members"
        principals={shownPrincipals}
        selection={{
          permission: 'user',
          allLabel: 'Select all shown',
          principalLabel: (principal) => `Select ${principal.name}`,
        }}
        value={value}
      />
    );
  }

  return { ...render(<ControlledTable />), onChange };
}
