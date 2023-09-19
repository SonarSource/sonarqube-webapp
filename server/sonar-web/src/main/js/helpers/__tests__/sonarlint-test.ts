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

import { TokenType } from '../../types/token';
import { HttpStatus } from '../request';
import {
  buildPortRange,
  openHotspot,
  openIssue,
  portIsValid,
  probeSonarLintServers,
  sendUserToken,
  SONARLINT_PORT_RANGE,
  SONARLINT_PORT_START,
} from '../sonarlint';

const PROJECT_KEY = 'my-project:key';

describe('buildPortRange', () => {
  it('should build a port range of size <size> starting at port <port>', () => {
    expect(buildPortRange(SONARLINT_PORT_START, 5)).toStrictEqual([
      SONARLINT_PORT_START,
      SONARLINT_PORT_START + 1,
      SONARLINT_PORT_START + 2,
      SONARLINT_PORT_START + 3,
      SONARLINT_PORT_START + 4,
    ]);
  });
});

describe('probeSonarLintServers', () => {
  const sonarLintResponse = { ideName: 'BlueJ IDE', description: 'Hello World' };

  window.fetch = jest.fn((input: string) => {
    const calledPort = new URL(input).port;

    if (calledPort === SONARLINT_PORT_START.toString()) {
      const resp = new Response();

      resp.json = () => Promise.resolve(sonarLintResponse);

      return Promise.resolve(resp);
    }

    return Promise.reject(new Error('oops'));
  });

  it('should probe all ports in range', async () => {
    const results = await probeSonarLintServers();

    expect(results).toStrictEqual([{ port: SONARLINT_PORT_START, ...sonarLintResponse }]);
  });
});

describe('openHotspot', () => {
  it('should send the correct request to the IDE to open a hotspot', async () => {
    const resp = new Response();

    window.fetch = jest.fn((input: string) => {
      const calledUrl = new URL(input);

      try {
        expect(calledUrl.searchParams.get('server')).toStrictEqual('http://localhost');
        expect(calledUrl.searchParams.get('project')).toStrictEqual(PROJECT_KEY);
        expect(calledUrl.searchParams.get('hotspot')).toStrictEqual('my-hotspot-key');
      } catch (error) {
        return Promise.reject(error);
      }

      return Promise.resolve(resp);
    });

    const result = await openHotspot(SONARLINT_PORT_START, PROJECT_KEY, 'my-hotspot-key');

    expect(result).toBe(resp);
  });
});

describe('openIssue', () => {
  it('should send the correct request to the IDE to open an issue', async () => {
    const resp = new Response();

    window.fetch = jest.fn((input: RequestInfo) => {
      const calledUrl = new URL(input.toString());

      try {
        expect(calledUrl.searchParams.get('server')).toStrictEqual('http://localhost');
        expect(calledUrl.searchParams.get('project')).toStrictEqual(PROJECT_KEY);
        expect(calledUrl.searchParams.get('issue')).toStrictEqual('my-issue-key');
      } catch (error) {
        return Promise.reject(error);
      }

      return Promise.resolve(resp);
    });

    const result = await openIssue(SONARLINT_PORT_START, PROJECT_KEY, 'my-issue-key');

    expect(result).toBe(resp);
  });
});

describe('portIsValid', () => {
  it.each([
    [SONARLINT_PORT_START - 1, false],
    [SONARLINT_PORT_START, true],
    [SONARLINT_PORT_START + SONARLINT_PORT_RANGE - 1, true],
    [SONARLINT_PORT_START + SONARLINT_PORT_RANGE, false],
    [SONARLINT_PORT_START + SONARLINT_PORT_RANGE + 1, false],
  ])('should validate port %s is within the expected range', (port, expectation) => {
    expect(portIsValid(port)).toBe(expectation);
  });
});

describe('sendUserToken', () => {
  it('should send the token the right port', async () => {
    const token = {
      createdAt: '12-12-2018',
      expirationDate: '17-02-2019',
      login: 'Takeshi',
      name: 'sonarlint-vscode-1',
      token: '78gfh78d6gf8h',
      type: TokenType.User,
    };

    const resp = new Response();

    window.fetch = jest.fn((_url, { body }: RequestInit) => {
      try {
        const data = JSON.parse((body as BodyInit).toString());

        expect(data).toEqual(token);
      } catch (error) {
        return Promise.reject(error);
      }

      return Promise.resolve(resp);
    });

    const result = await sendUserToken(SONARLINT_PORT_START, { ...token, isExpired: false });

    expect(result).toBeUndefined();
  });

  it('should handle errors', async () => {
    const token = {
      createdAt: '12-12-2018',
      expirationDate: '17-02-2019',
      login: 'Takeshi',
      name: 'sonarlint-vscode-1',
      token: '78gfh78d6gf8h',
      type: TokenType.User,
    };

    const resp = new Response('Meh', { status: HttpStatus.BadRequest, statusText: 'I no likez' });

    window.fetch = jest.fn(() => {
      return Promise.resolve(resp);
    });

    await expect(async () => {
      await sendUserToken(SONARLINT_PORT_START, { ...token, isExpired: false });
    }).rejects.toThrow('400 I no likez. Meh');
  });
});
