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

import { http, HttpHandler } from 'msw';
import { worker } from '../../api/mocks-v2/browser';
import { initMockApi } from '../system';

const mockLocalMocks: { localHandlers: HttpHandler[]; replaceDevHandlers: boolean } = {
  localHandlers: [],
  replaceDevHandlers: false,
};

jest.mock('../../api/mocks-v2/browser', () => ({
  worker: {
    start: jest.fn().mockResolvedValue({}),
    use: jest.fn(),
  },
  get localHandlers() {
    return mockLocalMocks.localHandlers;
  },
  get replaceDevHandlers() {
    return mockLocalMocks.replaceDevHandlers;
  },
}));

afterEach(() => {
  jest.clearAllMocks();
  mockLocalMocks.localHandlers = [];
  mockLocalMocks.replaceDevHandlers = false;
});

describe('initMockApi', () => {
  it('should not init mock api if WITH_MOCK_API is not true in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.WITH_MOCK_API = 'false';

    await initMockApi();

    expect(worker.start).not.toHaveBeenCalled();
  });

  it('should init mock api if WITH_MOCK_API is true in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.WITH_MOCK_API = 'true';

    await initMockApi();

    expect(worker.start).toHaveBeenCalled();
  });

  it('should not init mock api if WITH_MOCK_API is not true in production mode', async () => {
    process.env.NODE_ENV = 'production';
    process.env.WITH_MOCK_API = 'false';

    await initMockApi();

    expect(worker.start).not.toHaveBeenCalled();
  });

  it('should not init mock api if WITH_MOCK_API is true in production mode', async () => {
    process.env.NODE_ENV = 'production';
    process.env.WITH_MOCK_API = 'true';

    await initMockApi();

    expect(worker.start).not.toHaveBeenCalled();
  });

  it('should register local mocks after the extra handlers so they take precedence', async () => {
    process.env.NODE_ENV = 'development';
    process.env.WITH_MOCK_API = 'true';
    const extraHandler = http.get('/api/extra', () => undefined);
    const localHandler = http.get('/api/local', () => undefined);
    mockLocalMocks.localHandlers = [localHandler];

    await initMockApi([extraHandler]);

    expect(worker.use).toHaveBeenNthCalledWith(1, extraHandler);
    expect(worker.use).toHaveBeenNthCalledWith(2, localHandler);
  });

  it('should skip the extra handlers when local mocks replace the dev handlers', async () => {
    process.env.NODE_ENV = 'development';
    process.env.WITH_MOCK_API = 'true';
    const localHandler = http.get('/api/local', () => undefined);
    mockLocalMocks.localHandlers = [localHandler];
    mockLocalMocks.replaceDevHandlers = true;

    await initMockApi([http.get('/api/extra', () => undefined)]);

    expect(worker.use).toHaveBeenCalledTimes(1);
    expect(worker.use).toHaveBeenCalledWith(localHandler);
  });

  it('should throw error if unhandled request is made', async () => {
    process.env.NODE_ENV = 'development';
    process.env.WITH_MOCK_API = 'true';

    jest.mocked(worker.start).mockImplementationOnce(() => {
      throw new Error('Unhandled request');
    });

    await expect(initMockApi()).rejects.toThrow('Unhandled request');
  });
});
