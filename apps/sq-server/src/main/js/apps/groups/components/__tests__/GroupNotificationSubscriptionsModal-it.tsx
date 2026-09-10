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

import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { registerServiceMocks, resetServiceMocks } from '~shared/api/mocks/server';
import { byRole, byText } from '~shared/helpers/testSelector';
import GroupNotificationsServiceMock from '~sq-server-commons/api/mocks/GroupNotificationsServiceMock';
import NotificationsServiceMock from '~sq-server-commons/api/mocks/NotificationsServiceMock';
import { mockGroup } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { GroupNotificationSubscriptionsModal } from '../GroupNotificationSubscriptionsModal';

const groupNotificationsHandler = new GroupNotificationsServiceMock();
const notificationsHandler = new NotificationsServiceMock();

const group = mockGroup({ id: 'test-group', name: 'Test Group' });

const ui = {
  testGroupDialog: byRole('dialog', { name: 'Test Group' }),
  notificationCombobox: byRole('combobox'),
  newAlertsOption: byRole('option', { name: 'notification.dispatcher.NewAlerts' }),
  changesOnMyIssueOption: byRole('option', {
    name: 'notification.dispatcher.ChangesOnMyIssue',
  }),
  addNotificationGroup: byRole('button', { name: 'group_notifications.add' }),
  newAlertsLabel: byText('notification.dispatcher.NewAlerts'),
  changesOnMyIssueLabel: byText('notification.dispatcher.ChangesOnMyIssue'),
  removeNewAlertsButton: byRole('button', {
    name: 'group_notifications.remove_subscription.notification.dispatcher.NewAlerts',
  }),
  closeButton: byRole('button', { name: 'close' }),
};

beforeEach(() => {
  resetServiceMocks();
  groupNotificationsHandler.reset();
  notificationsHandler.reset();
  registerServiceMocks(groupNotificationsHandler, notificationsHandler);
});

describe('GroupNotificationSubscriptionsModal', () => {
  it('should add a subscription', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderComponent(<GroupNotificationSubscriptionsModal group={group} onClose={onClose} />);

    await ui.testGroupDialog.find();

    const select = await ui.notificationCombobox.find();
    await user.click(select);
    await user.click(await ui.newAlertsOption.find());
    await user.click(ui.addNotificationGroup.get());

    expect(await ui.newAlertsLabel.find()).toBeInTheDocument();

    // already-subscribed type is excluded from the dropdown; the other remains
    await user.click(await ui.notificationCombobox.find());
    expect(await ui.changesOnMyIssueOption.find()).toBeInTheDocument();
    expect(ui.newAlertsOption.query()).not.toBeInTheDocument();
  });

  it('should remove a subscription', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderComponent(<GroupNotificationSubscriptionsModal group={group} onClose={onClose} />);

    // Add a subscription first, then remove it
    const select = await ui.notificationCombobox.find();
    await user.click(select);
    await user.click(await ui.newAlertsOption.find());
    await user.click(ui.addNotificationGroup.get());

    await ui.newAlertsLabel.find();

    await user.click(ui.removeNewAlertsButton.get());

    await waitFor(() => {
      expect(ui.removeNewAlertsButton.query()).not.toBeInTheDocument();
    });
  });

  it('should close modal when Close button is clicked', async () => {
    const onClose = jest.fn();
    renderComponent(<GroupNotificationSubscriptionsModal group={group} onClose={onClose} />);

    const user = userEvent.setup();
    await user.click(ui.closeButton.get());

    expect(onClose).toHaveBeenCalled();
  });
});
