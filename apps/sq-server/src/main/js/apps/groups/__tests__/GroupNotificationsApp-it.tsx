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

import userEvent from '@testing-library/user-event';
import { toast } from '@sonarsource/echoes-react';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router';
import { registerServiceMocks, resetServiceMocks, server } from '~shared/api/mocks/server';
import { GROUP_NOTIFICATION_CHANNEL } from '~shared/components/group-notifications/constants';
import { byRole, byText } from '~shared/helpers/testSelector';
import GroupNotificationsServiceMock from '~sq-server-commons/api/mocks/GroupNotificationsServiceMock';
import GroupsServiceMock from '~sq-server-commons/api/mocks/GroupsServiceMock';
import { renderApp, renderAppRoutes } from '~sq-server-commons/helpers/testReactTestingUtils';
import * as groupsQueries from '~sq-server-commons/queries/groups';
import * as sqsFeatureFlags from '~sq-server-commons/sq-server-adapters/helpers/feature-flags';
import { NotificationGroupType } from '~sq-server-commons/types/notifications';
import { GROUP_NOTIFICATIONS_BASE_PATH } from '../constants';
import GroupNotificationsApp from '../GroupNotificationsApp';

const SECURITY_ALERT_NOTIFICATION_TYPE = NotificationGroupType.SecurityAlertRaised;
const SECURITY_ALERT_NOTIFICATION_ROUTE = `${GROUP_NOTIFICATIONS_BASE_PATH}/${SECURITY_ALERT_NOTIFICATION_TYPE}`;
const LIST_GROUPS_ENDPOINT = '/api/notifications/list_groups';
const groupsHandler = new GroupsServiceMock();
const GROUP_PAGE_FETCH_COUNT = 2;
const TOTAL_GROUP_COUNT_WITH_NEXT_PAGE = 51;
const getDefaultSqsFlag = sqsFeatureFlags.useFlag;

function mockGroupNotificationFlag(enabled: boolean) {
  jest
    .spyOn(sqsFeatureFlags, 'useFlag')
    .mockImplementation((name) =>
      name === 'scaEnableGroupNotificationSubscriptions' ? enabled : getDefaultSqsFlag(name),
    );
}

const notificationsHandler = new GroupNotificationsServiceMock([
  {
    channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
    groupName: 'local-group',
    groupUuid: '2',
    notificationType: SECURITY_ALERT_NOTIFICATION_TYPE,
  },
]);

beforeEach(() => {
  mockGroupNotificationFlag(true);
  resetServiceMocks();
  groupsHandler.reset();
  notificationsHandler.reset();
  registerServiceMocks(notificationsHandler);
});

afterEach(() => {
  jest.restoreAllMocks();
  resetServiceMocks();
});

it('renders the security-alert group subscription overview', async () => {
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('heading', { name: 'group_notifications.page' }).find()).toBeInTheDocument();
  expect(
    await byRole('heading', { name: 'group_notifications.group_subscriptions' }).find(),
  ).toBeInTheDocument();
  expect(await byText('group_notifications.subscribed_groups_count.1').find()).toBeInTheDocument();
  expect(await byText('notification.channel.EmailNotificationChannel').find()).toBeInTheDocument();
  expect(byText('notification.dispatcher.NewAlerts').query()).not.toBeInTheDocument();
  expect(byText('notification.dispatcher.ChangesOnMyIssue').query()).not.toBeInTheDocument();
});

it('offers all channels advertised by the Server API', async () => {
  const user = userEvent.setup();
  renderGroupNotificationDetails();

  const groupNotificationsBreadcrumb = await byRole('link', {
    name: 'group_notifications.page',
  }).find();
  expect(groupNotificationsBreadcrumb).toHaveAttribute('href', GROUP_NOTIFICATIONS_BASE_PATH);
  expect(await byRole('link', { name: 'group_notifications.page' }).findAll()).toHaveLength(1);

  expect(await byText('group_notifications.detail_description.server').find()).toBeInTheDocument();
  await user.click(
    await byRole('button', { name: 'group_notifications.edit_delivery_methods' }).find(),
  );

  expect(
    await byText('group_notifications.delivery_description.server').findAll(),
  ).not.toHaveLength(0);
  expect(
    await byRole('checkbox', { name: 'notification.channel.EmailNotificationChannel' }).find(),
  ).toBeInTheDocument();
  const bannerCheckbox = await byRole('checkbox', {
    name: 'notification.channel.BannerChannel',
  }).find();
  expect(bannerCheckbox).not.toBeChecked();

  await user.click(bannerCheckbox);
  await user.click(await byRole('button', { name: 'save' }).find());

  expect(notificationsHandler.data.subscriptions).toContainEqual(
    expect.objectContaining({
      channelKey: GROUP_NOTIFICATION_CHANNEL.Banner,
      groupUuid: '2',
      notificationType: SECURITY_ALERT_NOTIFICATION_TYPE,
    }),
  );
});

it('falls back to email-only group notifications when the Server API omits available types', async () => {
  const user = userEvent.setup();
  server.use(
    http.get(LIST_GROUPS_ENDPOINT, () =>
      HttpResponse.json({ subscriptions: notificationsHandler.data.subscriptions }),
    ),
  );
  renderGroupNotificationDetails();

  await user.click(
    await byRole('button', { name: 'group_notifications.edit_delivery_methods' }).find(),
  );

  expect(
    await byRole('checkbox', { name: 'notification.channel.EmailNotificationChannel' }).find(),
  ).toBeChecked();
  expect(byRole('checkbox', { name: 'notification.channel.BannerChannel' }).query()).toBeNull();
});

it('removes every subscribed channel from a group', async () => {
  const user = userEvent.setup();
  notificationsHandler.data.subscriptions.push({
    channelKey: GROUP_NOTIFICATION_CHANNEL.Banner,
    groupName: 'local-group',
    groupUuid: '2',
    notificationType: SECURITY_ALERT_NOTIFICATION_TYPE,
  });
  renderGroupNotificationDetails();

  await user.click(await byRole('button', { name: 'group_notifications.remove' }).find());
  await user.click(await byRole('button', { name: 'group_notifications.remove' }).find());

  expect(notificationsHandler.data.subscriptions).toHaveLength(0);
});

it('shows and opens every notification type advertised by the Server API', async () => {
  const user = userEvent.setup();
  notificationsHandler.data.availableTypes.push({
    notificationType: 'NewAlerts',
    channelKey: GROUP_NOTIFICATION_CHANNEL.Email,
  });
  renderGroupNotificationRoutes(GROUP_NOTIFICATIONS_BASE_PATH);

  await user.click(await byRole('link', { name: 'notification.dispatcher.NewAlerts' }).find());

  expect(await byText('group_notifications.detail_description.server').find()).toBeInTheDocument();
});

it('redirects direct visits when group notifications are disabled', async () => {
  mockGroupNotificationFlag(false);
  const searchGroups = jest.spyOn(groupsHandler, 'handleSearchUsersGroups');
  renderGroupNotificationRoutes(SECURITY_ALERT_NOTIFICATION_ROUTE);

  expect(await byText('user_groups.page').find()).toBeInTheDocument();
  expect(searchGroups).not.toHaveBeenCalled();
});

it('redirects unsupported notification types to the overview', async () => {
  renderGroupNotificationRoutes(`${GROUP_NOTIFICATIONS_BASE_PATH}/unsupported`);

  expect(await byRole('heading', { name: 'group_notifications.page' }).find()).toBeInTheDocument();
});

it('shows no available groups when the groups query has no pages', async () => {
  const user = userEvent.setup();
  jest.spyOn(groupsQueries, 'useGroupsQueries').mockReturnValue({
    data: { pages: [], pageParams: [] },
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
  } as unknown as ReturnType<typeof groupsQueries.useGroupsQueries>);
  renderGroupNotificationDetails();

  expect(
    await byRole('button', { name: 'group_notifications.subscribe_groups' }).find(),
  ).toBeDisabled();
  await user.hover(
    await byRole('button', { name: 'group_notifications.no_groups_available' }).find(),
  );
  expect(
    await byRole('tooltip', { name: 'group_notifications.no_groups_available' }).find(),
  ).toBeInTheDocument();
});

it('shows an error when the initial groups query fails', async () => {
  jest.spyOn(groupsQueries, 'useGroupsQueries').mockReturnValue({
    data: undefined,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
    isLoadingError: true,
  } as unknown as ReturnType<typeof groupsQueries.useGroupsQueries>);
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it('shows an error when the groups query returns null', async () => {
  jest.spyOn(groupsQueries, 'useGroupsQueries').mockReturnValue({
    data: null,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
  } as unknown as ReturnType<typeof groupsQueries.useGroupsQueries>);
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it('shows an error when a returned group page is malformed', async () => {
  jest.spyOn(groupsQueries, 'useGroupsQueries').mockReturnValue({
    data: { pages: [{ page: { pageIndex: 1, pageSize: 50, total: 0 } }], pageParams: [1] },
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
  } as unknown as ReturnType<typeof groupsQueries.useGroupsQueries>);
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it('shows an error when a group page contains a null group', async () => {
  jest.spyOn(groupsQueries, 'useGroupsQueries').mockReturnValue({
    data: {
      pages: [{ groups: [null], page: { pageIndex: 1, pageSize: 50, total: 1 } }],
      pageParams: [1],
    },
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
  } as unknown as ReturnType<typeof groupsQueries.useGroupsQueries>);
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it('shows an error when the subscriptions query fails', async () => {
  server.use(http.get(LIST_GROUPS_ENDPOINT, () => HttpResponse.json({}, { status: 500 })));
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it('shows an error when the subscriptions response omits its list', async () => {
  server.use(http.get(LIST_GROUPS_ENDPOINT, () => HttpResponse.json({ availableTypes: [] })));
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it('shows an error when the subscriptions response is null', async () => {
  server.use(http.get(LIST_GROUPS_ENDPOINT, () => HttpResponse.json(null)));
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it.each([
  {
    caseName: 'available types are null',
    response: { availableTypes: null, subscriptions: [] },
  },
  {
    caseName: 'an available type entry is null',
    response: { availableTypes: [null], subscriptions: [] },
  },
  {
    caseName: 'a subscription entry is null',
    response: { availableTypes: [], subscriptions: [null] },
  },
])('shows an error when $caseName', async ({ response }) => {
  server.use(http.get(LIST_GROUPS_ENDPOINT, () => HttpResponse.json(response)));
  renderApp(GROUP_NOTIFICATIONS_BASE_PATH, <GroupNotificationsApp />);

  expect(await byRole('alert').find()).toHaveTextContent('group_notifications.load_error');
});

it('shows an error when loading another group page fails', async () => {
  const user = userEvent.setup();
  groupsHandler.groups = [
    ...groupsHandler.readOnlyGroups,
    ...Array.from(
      { length: TOTAL_GROUP_COUNT_WITH_NEXT_PAGE - groupsHandler.readOnlyGroups.length },
      (_, index) => ({
        ...groupsHandler.readOnlyGroups[0],
        id: `generated-group-${index}`,
        name: `generated-group-${index}`,
      }),
    ),
  ];
  const searchGroups = groupsHandler.handleSearchUsersGroups;
  jest
    .spyOn(groupsHandler, 'handleSearchUsersGroups')
    .mockImplementationOnce(searchGroups)
    .mockRejectedValueOnce(new Error('request failed'));
  const toastError = jest.spyOn(toast, 'error');
  renderGroupNotificationDetails();

  await user.click(await byRole('button', { name: 'group_notifications.subscribe_groups' }).find());
  await user.click(await byRole('button', { name: 'group_notifications.load_more_groups' }).find());

  expect(groupsHandler.handleSearchUsersGroups).toHaveBeenCalledTimes(GROUP_PAGE_FETCH_COUNT);
  expect(toastError).toHaveBeenCalledWith({ description: 'group_notifications.load_more_error' });
});

function renderGroupNotificationDetails() {
  return renderGroupNotificationRoutes(SECURITY_ALERT_NOTIFICATION_ROUTE);
}

function renderGroupNotificationRoutes(indexPath: string) {
  return renderAppRoutes(indexPath, () => (
    <>
      <Route path={GROUP_NOTIFICATIONS_BASE_PATH}>
        <Route element={<GroupNotificationsApp />} index />
        <Route element={<GroupNotificationsApp />} path=":notificationType" />
      </Route>
      <Route element={<p>user_groups.page</p>} path="admin/groups" />
    </>
  ));
}
