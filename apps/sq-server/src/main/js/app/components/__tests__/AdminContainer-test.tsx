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

import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { IntlProvider } from 'react-intl';
import { Route, useOutletContext } from 'react-router';
import { byLabelText, byRole, byTestId, byText } from '~shared/helpers/testSelector';
import { cancelPendingPlugins, getPendingPlugins } from '~sq-server-commons/api/plugins';
import { getSystemStatus, restart, waitSystemUPStatus } from '~sq-server-commons/api/system';
import AdminContext from '~sq-server-commons/context/AdminContext';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import {
  RenderContext,
  renderAppRoutes,
  renderComponent,
} from '~sq-server-commons/helpers/testReactTestingUtils';
import { defaultMessages } from '~sq-server-commons/l10n/default';
import { AdminPagesContext } from '~sq-server-commons/types/admin';
import { AdminContainer, AdminContainerProps } from '../AdminContainer';
import PendingPluginsActionNotif from '../nav/settings/PendingPluginsActionNotif';


jest.mock('react-intl', () => ({
  ...jest.requireActual<typeof import('react-intl')>('react-intl'),
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }, values = {}) =>
      [id, ...Object.values(values)].join('.'),
  }),
}));

jest.mock('~sq-server-commons/api/navigation', () => ({
  getSettingsNavigation: jest
    .fn()
    .mockResolvedValue({ extensions: [{ key: 'asd', name: 'asdf' }] }),
}));

jest.mock('~sq-server-commons/api/plugins', () => ({
  cancelPendingPlugins: jest.fn().mockResolvedValue(undefined),
  getPendingPlugins: jest.fn().mockResolvedValue({
    installing: [{ key: '1', name: 'installing' }],
    updating: [
      { key: '2', name: 'updating' },
      { key: '2b', name: 'update this too' },
    ],
    removing: [{ key: '3', name: 'removing' }],
  }),
}));

jest.mock('~sq-server-commons/api/system', () => ({
  restart: jest.fn().mockResolvedValue(undefined),
  getSystemStatus: jest.fn().mockResolvedValue({ status: 'DOWN' }),
  waitSystemUPStatus: jest.fn().mockResolvedValue({ status: 'RESTARTING' }),
}));

const originalLocation = window.location;
const reload = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { reload },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

it('should render nav and provide context to children', async () => {
  const user = userEvent.setup();
  renderAdminContainer();

  expect(await ui.nav.find()).toBeInTheDocument();

  expect(await ui.pagesList.byRole('listitem').findAll()).toHaveLength(1);
  expect(ui.pagesList.byText('asdf').get()).toBeInTheDocument();

  expect(ui.pluginsInstallingList.byRole('listitem').getAll()).toHaveLength(1);
  expect(ui.pluginsInstallingList.byText('installing').get()).toBeInTheDocument();

  expect(ui.pluginsUpdatingList.byRole('listitem').getAll()).toHaveLength(2);
  expect(ui.pluginsUpdatingList.byText('updating').get()).toBeInTheDocument();
  expect(ui.pluginsUpdatingList.byText('update this too').get()).toBeInTheDocument();

  expect(ui.pluginsRemovingList.byRole('listitem').getAll()).toHaveLength(1);
  expect(ui.pluginsRemovingList.byText('removing').get()).toBeInTheDocument();

  expect(byText('DOWN').get()).toBeInTheDocument();

  // Trigger a status update
  jest.mocked(getSystemStatus).mockResolvedValueOnce({ id: '', version: '', status: 'RESTARTING' });
  jest.mocked(waitSystemUPStatus).mockResolvedValueOnce({ id: '', version: '', status: 'UP' });
  await user.click(ui.fetchStatusButton.get());

  expect(await byText('UP').find()).toBeInTheDocument();
  expect(reload).toHaveBeenCalled();
});

it.each([
  ['installing', 'install', 1, 'plugin'],
  ['installing', 'install', 2, 'plugins'],
  ['updating', 'update', 1, 'plugin'],
  ['updating', 'update', 2, 'plugins'],
  ['removing', 'uninstall', 1, 'plugin'],
  ['removing', 'uninstall', 2, 'plugins'],
] as const)('pluralizes %s notifications (%s, %i %s)', (action, verb, count, noun) => {
  renderComponent(
    <IntlProvider locale="en" messages={defaultMessages}>
      <PendingPluginsActionNotif
        fetchSystemStatus={jest.fn()}
        pending={{
          installing: [],
          updating: [],
          removing: [],
          [action]: Array.from({ length: count }, (_, index) => ({
            key: String(index),
            name: `Plugin ${index}`,
          })),
        }}
        refreshPending={jest.fn()}
        systemStatus="UP"
      />
    </IntlProvider>,
  );

  const notification = byText(new RegExp(`${verb}.*plugin`)).get();
  expect(notification).toHaveTextContent(`${verb} ${count} ${noun}`);
  expect(notification).toContainHTML(`<strong>${count}</strong>`);
});

it('restarts the server after confirming pending plugin changes', async () => {
  jest.mocked(getSystemStatus).mockResolvedValueOnce({ id: '', version: '', status: 'UP' });
  let finishRestart!: (status: Awaited<ReturnType<typeof waitSystemUPStatus>>) => void;
  jest.mocked(waitSystemUPStatus).mockReturnValueOnce(
    new Promise((resolve) => {
      finishRestart = resolve;
    }),
  );
  const user = userEvent.setup();
  renderAdminContainer();

  expect(await ui.revertButton.find()).toBeInTheDocument();
  await user.click(await ui.restartButton.find());
  jest.mocked(getSystemStatus).mockResolvedValueOnce({ id: '', version: '', status: 'RESTARTING' });
  await user.click(await ui.confirmRestartButton.find());

  expect(await ui.restartingMessage.find()).toBeInTheDocument();
  expect(restart).toHaveBeenCalledTimes(1);
  expect(ui.restartButton.query()).not.toBeInTheDocument();
  expect(ui.revertButton.query()).not.toBeInTheDocument();

  finishRestart({ id: '', version: '', status: 'UP' });
  expect(await byText('UP').find()).toBeInTheDocument();
});

it('reverts pending plugin changes and removes the restart notification', async () => {
  jest.mocked(getSystemStatus).mockResolvedValueOnce({ id: '', version: '', status: 'UP' });
  const user = userEvent.setup();
  renderAdminContainer();

  await ui.restartButton.find();
  jest
    .mocked(getPendingPlugins)
    .mockResolvedValueOnce({ installing: [], updating: [], removing: [] });
  const notificationRemoved = waitForElementToBeRemoved(() => ui.restartButton.query());
  await user.click(await ui.revertButton.find());

  await notificationRemoved;
  expect(cancelPendingPlugins).toHaveBeenCalledTimes(1);
  expect(ui.revertButton.query()).not.toBeInTheDocument();
});

it('does not offer restart or revert when there are no pending plugins', async () => {
  jest
    .mocked(getPendingPlugins)
    .mockResolvedValueOnce({ installing: [], updating: [], removing: [] });
  renderAdminContainer();

  expect(await ui.pagesList.byText('asdf').find()).toBeInTheDocument();
  expect(ui.restartButton.query()).not.toBeInTheDocument();
  expect(ui.revertButton.query()).not.toBeInTheDocument();
});


function renderAdminContainer(
  props: Partial<AdminContainerProps> = {},
  context: RenderContext = {},
  outletContent: React.ReactNode = <TestChildComponent />,
) {
  return renderAppRoutes(
    'admin',
    () => (
      <Route
        element={
          <AdminContainer
            appState={mockAppState({
              canAdmin: true,
            })}
            {...props}
          />
        }
        path="admin"
      >
        <Route element={outletContent} index />
      </Route>
    ),
    context,
  );
}


function TestChildComponent() {
  const { adminPages } = useOutletContext<AdminPagesContext>();

  const { fetchPendingPlugins, fetchSystemStatus, pendingPlugins, systemStatus } =
    React.useContext(AdminContext);

  return (
    <div>
      <ul aria-label="pages">
        {adminPages.map((page) => (
          <li key={page.key}>{page.name}</li>
        ))}
      </ul>

      <ul aria-label="plugins - installing">
        {pendingPlugins.installing.map((p) => (
          <li key={p.key}>{p.name}</li>
        ))}
      </ul>
      <ul aria-label="plugins - removing">
        {pendingPlugins.removing.map((p) => (
          <li key={p.key}>{p.name}</li>
        ))}
      </ul>
      <ul aria-label="plugins - updating">
        {pendingPlugins.updating.map((p) => (
          <li key={p.key}>{p.name}</li>
        ))}
      </ul>
      <button onClick={fetchPendingPlugins} type="button">
        fetch plugins
      </button>

      {systemStatus}
      <button onClick={fetchSystemStatus} type="button">
        fetch status
      </button>
    </div>
  );
}

const ui = {
  nav: byTestId('sidebar-navigation-wrapper'),
  restartButton: byRole('button', { name: 'system.restart_server' }),
  confirmRestartButton: byRole('button', { name: 'restart' }),
  revertButton: byRole('button', { name: 'marketplace.revert' }),
  restartingMessage: byText(/system.instance_restarting/),
  pagesList: byLabelText('pages'),
  pluginsInstallingList: byLabelText('plugins - installing'),
  pluginsUpdatingList: byLabelText('plugins - updating'),
  pluginsRemovingList: byLabelText('plugins - removing'),

  fetchPluginsButton: byRole('button', { name: 'fetch plugins' }),
  fetchStatusButton: byRole('button', { name: 'fetch status' }),
  architectureAccessStatus: byText(/^canAdministrate:/),
};
