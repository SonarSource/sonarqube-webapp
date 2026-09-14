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

import { getGithubClientId } from '~sq-server-commons/api/alm-integrations';
import { mockDopSetting } from '~sq-server-commons/api/mocks/data/dop-translation';
import { GithubProjectImportCallbackState } from '~sq-server-commons/types/state-callback-handler';
import { redirectToGithub } from '../utils';

jest.mock('~sq-server-commons/api/alm-integrations');
jest.mock('~sq-server-commons/helpers/urls', () => ({
  getHostUrl: () => 'https://sonarqube.example.com',
}));

const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { replace: jest.fn() },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getGithubClientId).mockResolvedValue({ clientId: 'client-id' });
});

function getRedirectedUrl() {
  return jest.mocked(window.location.replace).mock.calls[0][0] as string;
}

function getParam(url: string, name: string) {
  return new URL(url).searchParams.get(name);
}

function decodeState(url: string): GithubProjectImportCallbackState | undefined {
  const state = getParam(url, 'state');

  return state === null ? undefined : (JSON.parse(atob(state)) as GithubProjectImportCallbackState);
}

const selectedDopSetting = mockDopSetting({ key: 'conf-github-1', url: 'https://github.com' });

describe('redirectToGithub', () => {
  it('sends a bare redirect_uri with no query string', async () => {
    await redirectToGithub({ isMonorepoSetup: false, selectedDopSetting });

    const url = getRedirectedUrl();
    const redirectUri = getParam(url, 'redirect_uri');

    expect(redirectUri).toBe('https://sonarqube.example.com/projects/create');
  });

  it('carries mode and dopSetting in the state param instead of the query string', async () => {
    await redirectToGithub({ isMonorepoSetup: false, selectedDopSetting });

    const state = decodeState(getRedirectedUrl());

    expect(state).toEqual({
      app: 'github_project_import',
      dopSetting: 'conf-github-1',
      mode: 'github',
    });
  });

  it('adds mono to the state when isMonorepoSetup is true', async () => {
    await redirectToGithub({ isMonorepoSetup: true, selectedDopSetting });

    const state = decodeState(getRedirectedUrl());

    expect(state?.mono).toBe(true);
  });

  it('omits mono from the state when isMonorepoSetup is false', async () => {
    await redirectToGithub({ isMonorepoSetup: false, selectedDopSetting });

    const state = decodeState(getRedirectedUrl());

    expect(state?.mono).toBeUndefined();
  });

  it('adds redirect to the state when provided', async () => {
    await redirectToGithub({
      isMonorepoSetup: false,
      redirect: '/some/page',
      selectedDopSetting,
    });

    const state = decodeState(getRedirectedUrl());

    expect(state?.redirect).toBe('/some/page');
  });

  it('omits redirect from the state when not provided', async () => {
    await redirectToGithub({ isMonorepoSetup: false, selectedDopSetting });

    const state = decodeState(getRedirectedUrl());

    expect(state?.redirect).toBeUndefined();
  });

  it('does not redirect when there is no selected DOP setting', async () => {
    await redirectToGithub({ isMonorepoSetup: false, selectedDopSetting: undefined });

    expect(jest.mocked(window.location.replace)).not.toHaveBeenCalled();
  });
});
