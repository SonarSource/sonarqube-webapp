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
import userEvent from '@testing-library/user-event';
import UserTokensMock from '~sq-server-commons/api/mocks/UserTokensMock';
import handleRequiredAuthentication from '~sq-server-commons/helpers/handleRequiredAuthentication';
import { sendUserToken } from '~sq-server-commons/helpers/sonarlint';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { CurrentUser } from '~sq-server-commons/types/users';
import ExternalProductConnection from '../ExternalProductConnection';

jest.mock('~sq-server-commons/helpers/handleRequiredAuthentication', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('~sq-server-commons/helpers/sonarlint', () => {
  const original = jest.requireActual<typeof import('~sq-server-commons/helpers/sonarlint')>(
    '~sq-server-commons/helpers/sonarlint',
  );
  return { ...original, sendUserToken: jest.fn() };
});

let tokenMock: UserTokensMock;

beforeAll(() => {
  tokenMock = new UserTokensMock();
});

afterEach(() => {
  tokenMock.reset();
});

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('~sq-server-commons/api/settings', () => {
  const { SettingsKey } = jest.requireActual<typeof import('~sq-server-commons/types/settings')>(
    '~sq-server-commons/types/settings',
  );
  return {
    ...jest.requireActual<typeof import('~sq-server-commons/api/settings')>(
      '~sq-server-commons/api/settings',
    ),
    getAllValues: jest.fn().mockResolvedValue([
      {
        key: SettingsKey.TokenMaxAllowedLifetime,
        value: 'No expiration',
      },
    ]),
  };
});

it('should allow the user to accept the binding request', async () => {
  jest.mocked(sendUserToken).mockResolvedValueOnce(undefined);

  const user = userEvent.setup();
  renderExternalProductConnection();

  expect(
    await screen.findByRole('heading', { name: /external-product-connection\.request\.title/ }),
  ).toBeInTheDocument();

  await user.click(
    screen.getByRole('button', { name: 'external-product-connection.request.action' }),
  );

  expect(
    await screen.findByText('external-product-connection.success.description', { exact: false }),
  ).toBeInTheDocument();
});

it('should handle token generation errors', async () => {
  tokenMock.failNextTokenGeneration();

  const user = userEvent.setup();
  renderExternalProductConnection();

  await user.click(
    await screen.findByRole('button', { name: 'external-product-connection.request.action' }),
  );

  expect(
    await screen.findByText('external-product-connection.token-error.description'),
  ).toBeInTheDocument();
});

it('should handle connection errors', async () => {
  jest.mocked(sendUserToken).mockRejectedValueOnce(new Error(''));

  const user = userEvent.setup();
  renderExternalProductConnection();

  await user.click(
    await screen.findByRole('button', { name: 'external-product-connection.request.action' }),
  );

  expect(
    await screen.findByText('external-product-connection.connection-error.description'),
  ).toBeInTheDocument();

  const lastToken = tokenMock.getLastToken();
  expect(lastToken).toBeDefined();
  expect(await screen.findByRole('textbox')).toHaveValue(lastToken!.token);
});

it('should require authentication if user is not logged in', () => {
  renderExternalProductConnection({ currentUser: mockCurrentUser() });

  expect(handleRequiredAuthentication).toHaveBeenCalled();
});

it('should let the user copy the token if the port is not valid', async () => {
  jest.mocked(sendUserToken).mockRejectedValueOnce(new Error(''));

  const user = userEvent.setup();

  renderExternalProductConnection({ port: '' });

  await user.click(
    await screen.findByRole('button', { name: 'external-product-connection.request.action' }),
  );

  expect(
    await screen.findByText('external-product-connection.connection-error.description'),
  ).toBeInTheDocument();
});

it('should use IDE configuration when ideName is provided', async () => {
  jest.mocked(sendUserToken).mockResolvedValueOnce(undefined);

  const user = userEvent.setup();
  renderExternalProductConnection({ ideName: 'My IDE', product: null });

  await user.click(
    await screen.findByRole('button', { name: 'external-product-connection.request.action' }),
  );

  expect(
    await screen.findByText('external-product-connection.success.description.IDE'),
  ).toBeInTheDocument();
});

it('should use unknown product configuration when no product or ideName is provided', async () => {
  jest.mocked(sendUserToken).mockResolvedValueOnce(undefined);

  const user = userEvent.setup();
  renderExternalProductConnection({ product: null });

  await user.click(
    await screen.findByRole('button', { name: 'external-product-connection.request.action' }),
  );

  expect(
    await screen.findByText('external-product-connection.success.description.external product'),
  ).toBeInTheDocument();
});

function renderExternalProductConnection(
  overrides: {
    currentUser?: CurrentUser;
    ideName?: string;
    port?: string;
    product?: string | null;
  } = {},
) {
  const { currentUser, ideName, port, product } = {
    currentUser: mockLoggedInUser(),
    port: '64120',
    product: 'cli' as string | null,
    ...overrides,
  };

  const searchParams = new URLSearchParams();

  if (port) {
    searchParams.set('port', port);
  }

  if (product) {
    searchParams.set('product', product);
  }

  if (ideName) {
    searchParams.set('ideName', ideName);
  }

  renderApp('auth', <ExternalProductConnection />, {
    currentUser,
    navigateTo: `auth?${searchParams.toString()}`,
  });
}
