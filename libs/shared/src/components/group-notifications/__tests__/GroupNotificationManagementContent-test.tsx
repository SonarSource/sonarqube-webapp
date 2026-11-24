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

import { toast } from '@sonarsource/echoes-react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byLabelText, byRole, byText } from '../../../helpers/testSelector';
import { GroupNotificationManagementContent } from '../GroupNotificationManagementContent';
import { GroupNotificationSubscriptionsSection } from '../GroupNotificationSubscriptionsSection';
import {
  GROUP_NOTIFICATION_CHANNEL,
  normalizeGroupNotificationTypes,
  NotificationGroupType,
} from '../constants';

const availableTypes = [
  { notificationType: 'security-alert-raised', channelKey: GROUP_NOTIFICATION_CHANNEL.Email },
  { notificationType: 'security-alert-raised', channelKey: GROUP_NOTIFICATION_CHANNEL.Banner },
];
const groups = [
  { id: 'group-1', name: 'Identity-Squad' },
  { id: 'group-2', name: 'QA' },
];

it('normalizes legacy notification type strings to email-only types', () => {
  expect(normalizeGroupNotificationTypes([NotificationGroupType.SecurityAlertRaised])).toEqual([
    {
      notificationType: NotificationGroupType.SecurityAlertRaised,
      channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
    },
  ]);
});

const subscriptions = [
  {
    channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
    groupName: 'Identity-Squad',
    groupUuid: 'group-1',
    notificationType: 'security-alert-raised',
  },
];

afterEach(() => {
  jest.restoreAllMocks();
});

it('shows the unique subscribed group count instead of listing groups in the overview', () => {
  renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[
        ...subscriptions,
        {
          channelKey: GROUP_NOTIFICATION_CHANNEL.Banner,
          groupName: 'Identity-Squad',
          groupUuid: 'group-1',
          notificationType: 'security-alert-raised',
        },
      ]}
    />,
  );

  expect(
    screen.getByRole('heading', { name: 'group_notifications.group_subscriptions' }),
  ).toHaveClass('sw:sr-only');
  expect(screen.queryByText('group_notifications.overview_description')).not.toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'group_notifications.subscriptions' }),
  ).toBeVisible();
  expect(screen.getByText('group_notifications.subscribed_groups_count.1')).toBeVisible();
  expect(screen.queryByText('Identity-Squad')).not.toBeInTheDocument();
  expect(screen.queryByText('QA')).not.toBeInTheDocument();
  expect(screen.getByText('notification.channel.EmailNotificationChannel')).toBeVisible();
  expect(screen.getByRole('link', { name: 'group_notifications.manage' })).toHaveAttribute(
    'href',
    '/admin/group-notifications/security-alert-raised',
  );
});

it('disables Subscribe groups with a tooltip when every group is subscribed', () => {
  renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      hasMoreGroups={false}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[
        ...subscriptions,
        {
          channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
          groupName: 'QA',
          groupUuid: 'group-2',
          notificationType: 'security-alert-raised',
        },
      ]}
    />,
  );

  expect(
    screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }),
  ).toBeDisabled();
  expect(screen.getByText('(2)')).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'group_notifications.all_groups_subscribed' }),
  ).toBeVisible();
});

it('saves delivery-method edits by adding and removing the changed channel', async () => {
  const onAdd = jest.fn().mockResolvedValue(undefined);
  const onRemove = jest.fn().mockResolvedValue(undefined);
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={onRemove}
      subscriptions={subscriptions}
    />,
  );

  await user.click(
    screen.getByRole('button', { name: 'group_notifications.edit_delivery_methods' }),
  );
  await user.click(
    screen.getByRole('checkbox', { name: 'notification.channel.EmailNotificationChannel' }),
  );
  await user.click(screen.getByRole('checkbox', { name: 'notification.channel.BannerChannel' }));
  await user.click(screen.getByRole('button', { name: 'save' }));

  expect(onRemove).toHaveBeenCalledWith(
    'group-1',
    'security-alert-raised',
    GROUP_NOTIFICATION_CHANNEL.Email,
  );
  expect(onAdd).toHaveBeenCalledWith(
    'group-1',
    'security-alert-raised',
    GROUP_NOTIFICATION_CHANNEL.Banner,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('keeps Save enabled when delivery-method edits are unchanged', async () => {
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={subscriptions}
    />,
  );

  await user.click(
    screen.getByRole('button', { name: 'group_notifications.edit_delivery_methods' }),
  );
  expect(screen.queryByText('group_notifications.group_description')).not.toBeInTheDocument();
  const saveButton = screen.getByRole('button', { name: 'save' });
  expect(saveButton).toBeEnabled();
  await user.click(saveButton);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('shows a validation error when saving a new subscription without a delivery method', async () => {
  const onAdd = jest.fn().mockResolvedValue(undefined);
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }));
  const saveButton = screen.getByRole('button', { name: 'save' });
  expect(saveButton).toBeEnabled();
  await user.click(saveButton);

  expect(screen.getByText('group_notifications.validation.delivery_method_required')).toBeVisible();
  expect(onAdd).not.toHaveBeenCalled();
});

it('shows a validation error when saving without choosing a group', async () => {
  const onAdd = jest.fn().mockResolvedValue(undefined);
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }));
  await user.click(screen.getByRole('checkbox', { name: 'notification.channel.BannerChannel' }));
  await user.click(screen.getByRole('button', { name: 'save' }));

  expect(screen.getByText('group_notifications.validation.group_required')).toBeVisible();
  expect(onAdd).not.toHaveBeenCalled();
});

it('shows a group validation error after clearing the selected group', async () => {
  const ui = {
    bannerCheckbox: byRole('checkbox', { name: 'notification.channel.BannerChannel' }),
    clearGroup: byLabelText('select.clear', { selector: 'button' }),
    groupError: byText('group_notifications.validation.group_required'),
    groupOption: byRole('option', { name: 'Identity-Squad' }),
    groupSelect: byRole('combobox', { name: 'group_notifications.select_group' }),
    saveButton: byRole('button', { name: 'save' }),
    subscribeButton: byRole('button', { name: 'group_notifications.subscribe_groups' }),
  };
  const onAdd = jest.fn().mockResolvedValue(undefined);
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(await ui.subscribeButton.find());
  await user.click(await ui.groupSelect.find());
  await user.click(await ui.groupOption.find());
  await user.click(await ui.clearGroup.find());
  await user.click(await ui.bannerCheckbox.find());
  await user.click(await ui.saveButton.find());

  expect(await ui.groupError.find()).toBeVisible();
  expect(onAdd).not.toHaveBeenCalled();
});

it('renders additional delivery methods without channel-specific help text', async () => {
  const ui = {
    customChannel: byRole('checkbox', { name: 'notification.channel.CustomNotificationChannel' }),
    subscribeButton: byRole('button', { name: 'group_notifications.subscribe_groups' }),
  };
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={[
        ...availableTypes,
        { notificationType: 'security-alert-raised', channelKey: 'CustomNotificationChannel' },
      ]}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(await ui.subscribeButton.find());

  expect(await ui.customChannel.find()).toBeVisible();
});

it('keeps the channel dialog open if it is dismissed during a save', async () => {
  const ui = {
    bannerCheckbox: byRole('checkbox', { name: 'notification.channel.BannerChannel' }),
    dialog: byRole('dialog'),
    groupOption: byRole('option', { name: 'Identity-Squad' }),
    groupSelect: byRole('combobox', { name: 'group_notifications.select_group' }),
    saveButton: byRole('button', { name: 'save' }),
    subscribeButton: byRole('button', { name: 'group_notifications.subscribe_groups' }),
  };
  let finishSave: () => void = () => undefined;
  const onAdd = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finishSave = resolve;
      }),
  );
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(await ui.subscribeButton.find());
  await user.click(await ui.groupSelect.find());
  await user.click(await ui.groupOption.find());
  await user.click(await ui.bannerCheckbox.find());
  await user.click(await ui.saveButton.find());
  await user.keyboard('{Escape}');

  expect(ui.dialog.get()).toBeInTheDocument();
  finishSave();
  await waitFor(() => {
    expect(ui.dialog.query()).not.toBeInTheDocument();
  });
});

it('shows zero subscriptions when a notification type has no subscribers', () => {
  renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  expect(screen.getByText('group_notifications.subscribed_groups_count.0')).toBeVisible();
});

it('hides delivery-method and action headers when no groups are subscribed', () => {
  renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  expect(screen.getByRole('columnheader', { name: 'group_notifications.group' })).toBeVisible();
  expect(
    screen.queryByRole('columnheader', { name: 'group_notifications.delivery_methods' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('columnheader', { name: 'group_notifications.actions' }),
  ).not.toBeInTheDocument();
});

it('subscribes a group and loads another page of groups', async () => {
  const onAdd = jest.fn().mockResolvedValue(undefined);
  const loadMoreGroups = jest.fn();
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      hasMoreGroups
      isLoading={false}
      isLoadingMoreGroups={false}
      loadMoreGroups={loadMoreGroups}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  expect(screen.getByText('group_notifications.none_subscribed')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }));
  await user.click(screen.getByRole('button', { name: 'group_notifications.load_more_groups' }));
  await user.click(screen.getByRole('combobox', { name: 'group_notifications.select_group' }));
  await user.click(await screen.findByRole('option', { name: 'Identity-Squad' }));
  await user.click(screen.getByRole('checkbox', { name: 'notification.channel.BannerChannel' }));
  await user.click(screen.getByRole('button', { name: 'save' }));

  expect(loadMoreGroups).toHaveBeenCalledTimes(1);
  expect(onAdd).toHaveBeenCalledWith(
    'group-1',
    'security-alert-raised',
    GROUP_NOTIFICATION_CHANNEL.Banner,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('explains when no groups are available and disables loading while a page is pending', async () => {
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={[]}
      hasMoreGroups
      isLoading={false}
      isLoadingMoreGroups
      loadMoreGroups={jest.fn()}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }));

  expect(screen.getByText('group_notifications.no_groups_available')).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'group_notifications.load_more_groups' }),
  ).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'cancel' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('subscribes the selected group to a delivery method', async () => {
  const onAdd = jest.fn().mockResolvedValue(undefined);
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }));
  await user.click(screen.getByRole('combobox', { name: 'group_notifications.select_group' }));
  await user.click(await screen.findByRole('option', { name: 'QA' }));
  await user.click(screen.getByRole('checkbox', { name: 'notification.channel.BannerChannel' }));
  await user.click(screen.getByRole('button', { name: 'save' }));

  expect(onAdd).toHaveBeenCalledWith(
    'group-2',
    'security-alert-raised',
    GROUP_NOTIFICATION_CHANNEL.Banner,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('dismisses a subscription dialog with Escape', async () => {
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }));
  await user.keyboard('{Escape}');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  await user.keyboard('{Escape}');

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('shows a save error when adding a subscription fails', async () => {
  const onAdd = jest.fn().mockRejectedValue(new Error('request failed'));
  jest.spyOn(toast, 'error').mockReturnValue('save-error');
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={onAdd}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={[]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.subscribe_groups' }));
  await user.click(screen.getByRole('combobox', { name: 'group_notifications.select_group' }));
  await user.click(await screen.findByRole('option', { name: 'Identity-Squad' }));
  await user.click(screen.getByRole('checkbox', { name: 'notification.channel.BannerChannel' }));
  await user.click(screen.getByRole('button', { name: 'save' }));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith({
      description: 'group_notifications.save_error',
    });
  });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('removes all delivery methods when removing a subscribed group', async () => {
  const onRemove = jest.fn().mockResolvedValue(undefined);
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={onRemove}
      subscriptions={subscriptions}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.remove' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(onRemove).not.toHaveBeenCalled();
  expect(screen.getByText('group_notifications.remove_subscription.confirmation')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'group_notifications.remove' }));

  expect(onRemove).toHaveBeenCalledWith(
    'group-1',
    'security-alert-raised',
    GROUP_NOTIFICATION_CHANNEL.Email,
  );
});

it('closes the group removal confirmation from cancel or Escape', async () => {
  const ui = {
    cancelButton: byRole('button', { name: 'cancel' }),
    dialog: byRole('dialog'),
    removeButton: byRole('button', { name: 'group_notifications.remove' }),
  };
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={jest.fn().mockResolvedValue(undefined)}
      subscriptions={subscriptions}
    />,
  );

  await user.click(await ui.removeButton.find());
  await user.click(await ui.cancelButton.find());
  expect(ui.dialog.query()).not.toBeInTheDocument();

  await user.click(await ui.removeButton.find());
  await user.keyboard('{Escape}');
  expect(ui.dialog.query()).not.toBeInTheDocument();
});

it('keeps the removal confirmation open while removal is in progress', async () => {
  const ui = {
    confirmRemovalButton: byRole('dialog').byRole('button', {
      name: 'group_notifications.remove',
    }),
    dialog: byRole('dialog'),
    removeButton: byRole('button', { name: 'group_notifications.remove' }),
  };
  let finishRemoval: () => void = () => undefined;
  const onRemove = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finishRemoval = resolve;
      }),
  );
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={onRemove}
      subscriptions={subscriptions}
    />,
  );

  await user.click(await ui.removeButton.find());
  await user.click(await ui.confirmRemovalButton.find());
  await user.keyboard('{Escape}');

  expect(ui.dialog.get()).toBeInTheDocument();
  finishRemoval();
  await waitFor(() => {
    expect(ui.dialog.query()).not.toBeInTheDocument();
  });
});

it('shows unsubscribe information and saves without confirmation when all methods are unchecked', async () => {
  const onRemove = jest.fn().mockResolvedValue(undefined);
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={onRemove}
      subscriptions={subscriptions}
    />,
  );

  await user.click(
    screen.getByRole('button', { name: 'group_notifications.edit_delivery_methods' }),
  );
  await user.click(
    screen.getByRole('checkbox', { name: 'notification.channel.EmailNotificationChannel' }),
  );

  expect(screen.getByText('group_notifications.unsubscribe_info')).toBeVisible();
  expect(screen.getByRole('button', { name: 'save' })).toBeEnabled();
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'save' }));

  expect(onRemove).toHaveBeenCalledWith(
    'group-1',
    'security-alert-raised',
    GROUP_NOTIFICATION_CHANNEL.Email,
  );
});

it('shows an error when removing a subscribed group fails', async () => {
  const onRemove = jest.fn().mockRejectedValue(new Error('request failed'));
  const { user } = renderWithContext(
    <GroupNotificationManagementContent
      availableTypes={availableTypes}
      basePath="/admin/group-notifications"
      groups={groups}
      isLoading={false}
      notificationType="security-alert-raised"
      onAdd={jest.fn().mockResolvedValue(undefined)}
      onRemove={onRemove}
      subscriptions={subscriptions}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'group_notifications.remove' }));
  await user.click(screen.getByRole('button', { name: 'group_notifications.remove' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('group_notifications.remove_error');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('shows when the account has no group notification subscriptions', () => {
  renderWithContext(<GroupNotificationSubscriptionsSection isLoading={false} subscriptions={[]} />);

  expect(screen.getByText('group_notifications.account_description')).toBeVisible();
  expect(screen.getByText('group_notifications.no_memberships')).toBeVisible();
});

it('does not show the empty state while group subscriptions are loading', () => {
  renderWithContext(<GroupNotificationSubscriptionsSection isLoading subscriptions={[]} />);

  expect(screen.queryByText('group_notifications.no_memberships')).not.toBeInTheDocument();
});

it('lists each notification type once without showing groups or delivery methods', () => {
  renderWithContext(
    <GroupNotificationSubscriptionsSection
      isLoading={false}
      subscriptions={[
        {
          channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
          groupName: 'Zeta',
          groupUuid: 'group-z',
          notificationType: 'security-alert-raised',
        },
        {
          channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
          groupName: 'Beta',
          groupUuid: 'group-b',
          notificationType: 'security-alert-raised',
        },
        {
          channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
          groupName: 'Alpha',
          groupUuid: 'group-a',
          notificationType: 'security-alert-raised',
        },
        {
          channelKey: GROUP_NOTIFICATION_CHANNEL.Banner,
          groupName: 'Alpha',
          groupUuid: 'group-a',
          notificationType: 'security-alert-raised',
        },
        {
          channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
          groupName: 'Another group',
          groupUuid: 'group-c',
          notificationType: 'another-notification',
        },
      ]}
    />,
  );

  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getAllByText('notification.dispatcher.security-alert-raised')).toHaveLength(1);
  expect(screen.getByText('notification.dispatcher.another-notification')).toBeVisible();
  expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  expect(screen.queryByText('Zeta')).not.toBeInTheDocument();
  expect(
    screen.queryByText('notification.channel.EmailNotificationChannel'),
  ).not.toBeInTheDocument();
  expect(screen.queryByText('notification.channel.BannerChannel')).not.toBeInTheDocument();
});
