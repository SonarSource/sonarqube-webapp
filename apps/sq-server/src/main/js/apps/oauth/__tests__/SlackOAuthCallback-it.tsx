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
import { registerServiceMocks, resetServiceMocks } from '~shared/api/mocks/server';
import { uuidv4 } from '~shared/helpers/crypto';
import { get, save } from '~shared/helpers/storage';
import { byText } from '~shared/helpers/testSelector';
import {
  integrationsServiceDefaultDataset,
  IntegrationsServiceMock,
  INVALID_CODE,
} from '~sq-server-commons/api/mocks/IntegrationsServiceMock';
import { mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { SLACK_OAUTH_STATE_LS_KEY } from '~sq-server-commons/utils/oauth';
import SlackOAuthCallback from '../SlackOAuthCallback';

jest.mock('~shared/helpers/crypto', () => ({
  uuidv4: jest.fn(),
}));

jest.mock('~shared/helpers/storage', () => ({
  get: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
}));

const ui = {
  failureMessage: byText('oauth.slack_binding.error.title'),
  failureNotification: byText('oauth.slack_binding.error.toast.title'),
  nameConfirmation: byText(/^oauth.slack_binding.success.name/),
  successMessage: byText('oauth.slack_binding.success.title'),
  successNotification: byText('oauth.slack_binding.success.toast.title'),
};

let integrationsServiceMock: IntegrationsServiceMock;

beforeEach(() => {
  const { location: originalLocation } = globalThis;
  jest.spyOn(globalThis, 'location', 'get').mockReturnValue({
    ...originalLocation,
  });

  integrationsServiceMock = new IntegrationsServiceMock(integrationsServiceDefaultDataset);
  registerServiceMocks(integrationsServiceMock);
});

afterEach(() => {
  resetServiceMocks();
  jest.clearAllMocks();

  jest.spyOn(globalThis, 'location', 'get').mockRestore();
});

describe('Slack OAuth callback', () => {
  it('should redirect user when a redirect_uri is provided', async () => {
    const uuid = 'abc-123';
    const redirectUri = 'https://slack.com';
    jest.mocked(uuidv4).mockReturnValue(uuid);
    setupSlackOAuthCallback(`/slack?redirect_uri=${redirectUri}`);

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith(SLACK_OAUTH_STATE_LS_KEY, uuid);
    });
    expect(globalThis.location.href).toBe(`${redirectUri}/?state=${uuid}`);
  });

  it('should always redirect user to slack.com even if a different https host is forged', async () => {
    const uuid = 'abc-123';
    jest.mocked(uuidv4).mockReturnValue(uuid);
    setupSlackOAuthCallback('/slack?redirect_uri=https://attacker.example.com/phish');

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith(SLACK_OAUTH_STATE_LS_KEY, uuid);
    });
    expect(globalThis.location.href).toBe(`https://slack.com/phish?state=${uuid}`);
  });

  it('should strip a forged port and credentials before redirecting to slack.com', async () => {
    const uuid = 'abc-123';
    jest.mocked(uuidv4).mockReturnValue(uuid);
    setupSlackOAuthCallback(
      `/slack?redirect_uri=${encodeURIComponent('https://user:pass@attacker.example.com:8443/phish')}`,
    );

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith(SLACK_OAUTH_STATE_LS_KEY, uuid);
    });
    expect(globalThis.location.href).toBe(`https://slack.com/phish?state=${uuid}`);
  });

  it.each([
    ['javascript:alert(document.domain)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['http://attacker.example.com'],
    ['ftp://attacker.example.com'],
    ['not-a-url'],
  ])('should not redirect user when redirect_uri is not a valid https URL (%s)', (redirectUri) => {
    const initialHref = globalThis.location.href;
    setupSlackOAuthCallback(`/slack?redirect_uri=${encodeURIComponent(redirectUri)}`);

    expect(save).not.toHaveBeenCalled();
    expect(globalThis.location.href).toBe(initialHref);
    expect(ui.failureMessage.get()).toBeInTheDocument();
  });

  it('should display success message when API call succeeds', async () => {
    jest.mocked(get).mockReturnValue('123');
    setupSlackOAuthCallback('/slack?code=valid-code&state=123');

    expect(await ui.successMessage.find()).toBeInTheDocument();
    expect(ui.successNotification.get()).toBeInTheDocument();
    expect(ui.failureMessage.query()).not.toBeInTheDocument();
    expect(ui.nameConfirmation.get()).toBeInTheDocument();
  });

  it('should display failure message when saved state is different than the one in the URL', async () => {
    jest.mocked(get).mockReturnValue('123');
    setupSlackOAuthCallback('/slack?code=valid-code&state=456');

    expect(await ui.failureMessage.find()).toBeInTheDocument();
    expect(ui.failureNotification.query()).not.toBeInTheDocument();
    expect(ui.successMessage.query()).not.toBeInTheDocument();
  });

  it('should display failure message when API call fails', async () => {
    jest.mocked(get).mockReturnValue('123');
    setupSlackOAuthCallback(`/slack?code=${INVALID_CODE}&state=123`);

    expect(await ui.failureMessage.find()).toBeInTheDocument();
    expect(await ui.failureNotification.find()).toBeInTheDocument();
    expect(ui.successMessage.query()).not.toBeInTheDocument();
  });

  it('should show correct message when no code is provided', () => {
    jest.mocked(get).mockReturnValue('123');
    setupSlackOAuthCallback('/slack?state=123');

    expect(ui.failureMessage.get()).toBeInTheDocument();
    expect(ui.failureNotification.query()).not.toBeInTheDocument();
    expect(ui.successMessage.query()).not.toBeInTheDocument();
  });
});

function setupSlackOAuthCallback(path: string) {
  return renderComponent(<SlackOAuthCallback />, path, {
    currentUser: mockLoggedInUser(),
  });
}
