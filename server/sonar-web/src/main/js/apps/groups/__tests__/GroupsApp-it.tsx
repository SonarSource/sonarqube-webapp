/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { byRole, byText } from 'testing-library-selector';
import GroupsServiceMock from '../../../api/mocks/GroupsServiceMock';
import { renderApp } from '../../../helpers/testReactTestingUtils';
import App from '../GroupsApp';

const handler = new GroupsServiceMock();

const ui = {
  createGroupButton: byRole('button', { name: 'groups.create_group' }),
  infoManageMode: byText(/groups\.page\.managed_description/),
  description: byText('user_groups.page.description'),
  allFilter: byRole('button', { name: 'all' }),
  selectedFilter: byRole('button', { name: 'selected' }),
  unselectedFilter: byRole('button', { name: 'unselected' }),
  managedFilter: byRole('button', { name: 'managed' }),
  localFilter: byRole('button', { name: 'local' }),
  searchInput: byRole('searchbox', { name: 'search.search_by_name' }),
  updateButton: byRole('button', { name: 'update_details' }),
  updateDialog: byRole('dialog', { name: 'groups.update_group' }),
  updateDialogButton: byRole('button', { name: 'update_verb' }),
  deleteButton: byRole('button', { name: 'delete' }),
  deleteDialog: byRole('dialog', { name: 'groups.delete_group' }),
  deleteDialogButton: byRole('button', { name: 'delete' }),
  showMore: byRole('button', { name: 'show_more' }),
  nameInput: byRole('textbox', { name: 'name field_required' }),
  descriptionInput: byRole('textbox', { name: 'description' }),
  createGroupDialogButton: byRole('button', { name: 'create' }),
  editGroupDialogButton: byRole('button', { name: 'groups.create_group' }),
  reloadButton: byRole('button', { name: 'reload' }),
  doneButton: byRole('button', { name: 'done' }),

  createGroupDialog: byRole('dialog', { name: 'groups.create_group' }),
  membersViewDialog: byRole('dialog', { name: 'users.list' }),
  membersDialog: byRole('dialog', { name: 'users.update' }),
  getMembers: () => within(ui.membersDialog.get()).getAllByRole('checkbox'),

  managedGroupRow: byRole('row', { name: 'managed-group 1' }),
  managedGroupEditMembersButton: byRole('button', { name: 'groups.users.edit.managed-group' }),
  managedGroupViewMembersButton: byRole('button', { name: 'groups.users.view.managed-group' }),

  memberAliceUser: byText('alice'),
  memberBobUser: byText('bob'),
  memberSearchInput: byRole('searchbox', { name: 'search_verb' }),

  managedEditButton: byRole('button', { name: 'groups.edit.managed-group' }),

  localGroupRow: byRole('row', { name: 'local-group 1' }),
  localGroupEditMembersButton: byRole('button', { name: 'groups.users.edit.local-group' }),
  localGroupRow2: byRole('row', { name: 'local-group 2 1 group 2 is loco!' }),
  editedLocalGroupRow: byRole('row', { name: 'local-group 3 1 group 3 rocks!' }),
  localEditButton: byRole('button', { name: 'groups.edit.local-group' }),
  localGroupRowWithLocalBadge: byRole('row', {
    name: 'local-group local 1',
  }),
};

beforeEach(() => {
  handler.reset();
});

describe('in non managed mode', () => {
  beforeEach(() => {
    handler.setIsManaged(false);
  });

  it('should render all groups', async () => {
    renderGroupsApp();

    await act(async () => expect(await ui.localGroupRow.find()).toBeInTheDocument());
    expect(ui.managedGroupRow.get()).toBeInTheDocument();
    expect(ui.localGroupRowWithLocalBadge.query()).not.toBeInTheDocument();
  });

  it('should be able to create a group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => expect(await ui.description.find()).toBeInTheDocument());
    await act(async () => {
      await user.click(ui.createGroupButton.get());
    });

    expect(await ui.createGroupDialog.find()).toBeInTheDocument();

    await act(async () => {
      await user.type(ui.nameInput.get(), 'local-group 2');
      await user.type(ui.descriptionInput.get(), 'group 2 is loco!');
      await user.click(ui.createGroupDialogButton.get());
    });

    expect(await ui.localGroupRow2.find()).toBeInTheDocument();
  });

  it('should be able to delete a group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => {
      await user.click(await ui.localEditButton.find());
      await user.click(await ui.deleteButton.find());
    });

    expect(await ui.deleteDialog.find()).toBeInTheDocument();
    await act(async () => {
      await user.click(ui.deleteDialogButton.get());
    });

    expect(await ui.managedGroupRow.find()).toBeInTheDocument();
    expect(ui.localGroupRow.query()).not.toBeInTheDocument();
  });

  it('should be able to edit a group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => {
      await user.click(await ui.localEditButton.find());
      await user.click(await ui.updateButton.find());
    });

    expect(ui.updateDialog.get()).toBeInTheDocument();

    await act(async () => {
      await user.clear(ui.nameInput.get());
      await user.type(ui.nameInput.get(), 'local-group 3');
      await user.clear(ui.descriptionInput.get());
      await user.type(ui.descriptionInput.get(), 'group 3 rocks!');
    });

    expect(ui.updateDialog.get()).toBeInTheDocument();

    await act(async () => {
      await user.click(ui.updateDialogButton.get());
    });

    expect(await ui.managedGroupRow.find()).toBeInTheDocument();
    expect(await ui.editedLocalGroupRow.find()).toBeInTheDocument();
  });

  it('should be able to edit the members of a group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => expect(await ui.localGroupRow.find()).toBeInTheDocument());
    expect(await ui.localGroupEditMembersButton.find()).toBeInTheDocument();

    await act(async () => {
      await user.click(ui.localGroupEditMembersButton.get());
    });

    expect(await ui.membersDialog.find()).toBeInTheDocument();

    expect(ui.getMembers()).toHaveLength(2);

    await user.click(ui.allFilter.get());
    expect(ui.getMembers()).toHaveLength(3);

    await user.click(ui.unselectedFilter.get());
    expect(ui.reloadButton.query()).not.toBeInTheDocument();
    await user.click(ui.getMembers()[0]);
    expect(await ui.reloadButton.find()).toBeInTheDocument();

    await user.click(ui.selectedFilter.get());
    expect(ui.getMembers()).toHaveLength(3);
    expect(ui.reloadButton.query()).not.toBeInTheDocument();
    await user.click(ui.getMembers()[0]);
    expect(await ui.reloadButton.find()).toBeInTheDocument();
    await user.click(ui.reloadButton.get());
    expect(ui.getMembers()).toHaveLength(2);

    await act(() => user.click(ui.doneButton.get()));
    expect(ui.membersDialog.query()).not.toBeInTheDocument();
  });

  it('should be able search a group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => expect(await ui.localGroupRow.find()).toBeInTheDocument());
    expect(ui.managedGroupRow.get()).toBeInTheDocument();

    await act(async () => {
      await user.type(await ui.searchInput.find(), 'local');
    });

    expect(await ui.localGroupRow.find()).toBeInTheDocument();
    expect(ui.managedGroupRow.query()).not.toBeInTheDocument();
  });

  it('should be able load more group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => expect(await ui.localGroupRow.find()).toBeInTheDocument());
    expect(await screen.findAllByRole('row')).toHaveLength(3);

    await act(async () => {
      await user.click(await ui.showMore.find());
    });

    expect(await screen.findAllByRole('row')).toHaveLength(5);
  });
});

describe('in manage mode', () => {
  beforeEach(() => {
    handler.setIsManaged(true);
  });

  it('should not be able to create a group', async () => {
    renderGroupsApp();
    await act(async () => expect(await ui.createGroupButton.find()).toBeDisabled());
    expect(ui.infoManageMode.get()).toBeInTheDocument();
  });

  it('should ONLY be able to delete a local group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => expect(await ui.localGroupRowWithLocalBadge.find()).toBeInTheDocument());

    await act(async () => {
      await user.click(await ui.localFilter.find());
      await user.click(await ui.localEditButton.find());
    });
    expect(ui.updateButton.query()).not.toBeInTheDocument();

    await act(async () => {
      await user.click(await ui.deleteButton.find());
    });

    expect(await ui.deleteDialog.find()).toBeInTheDocument();
    await act(async () => {
      await user.click(ui.deleteDialogButton.get());
    });
    expect(ui.localGroupRowWithLocalBadge.query()).not.toBeInTheDocument();
  });

  it('should not be able to delete or edit a managed group', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => expect(await ui.managedGroupRow.find()).toBeInTheDocument());
    expect(ui.managedEditButton.query()).not.toBeInTheDocument();

    expect(ui.managedGroupEditMembersButton.query()).not.toBeInTheDocument();

    await act(() => user.click(ui.managedGroupViewMembersButton.get()));
    expect(await ui.membersViewDialog.find()).toBeInTheDocument();

    expect(ui.memberAliceUser.get()).toBeInTheDocument();
    expect(ui.memberBobUser.get()).toBeInTheDocument();

    await act(() => user.type(ui.memberSearchInput.get(), 'b'));

    expect(await ui.memberBobUser.find()).toBeInTheDocument();
    expect(ui.memberAliceUser.query()).not.toBeInTheDocument();
  });

  it('should render list of all groups', async () => {
    renderGroupsApp();

    await act(async () => expect(await ui.allFilter.find()).toBeInTheDocument());

    expect(ui.localGroupRowWithLocalBadge.get()).toBeInTheDocument();
    expect(ui.managedGroupRow.get()).toBeInTheDocument();
  });

  it('should render list of managed groups', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => {
      await user.click(await ui.managedFilter.find());
    });

    expect(ui.localGroupRow.query()).not.toBeInTheDocument();
    expect(ui.managedGroupRow.get()).toBeInTheDocument();
  });

  it('should render list of local groups', async () => {
    const user = userEvent.setup();
    renderGroupsApp();

    await act(async () => {
      await user.click(await ui.localFilter.find());
    });

    expect(ui.localGroupRowWithLocalBadge.get()).toBeInTheDocument();
    expect(ui.managedGroupRow.query()).not.toBeInTheDocument();
  });
});

function renderGroupsApp() {
  return renderApp('admin/groups', <App />);
}
