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

import { worker } from '../../api/mocks-v2/browser';
import { initMockApi } from '../system';

jest.mock('../../api/mocks-v2/browser', () => ({
  worker: {
    start: jest.fn().mockResolvedValue({}),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
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

  it('should throw error if unhandled request is made', async () => {
    process.env.NODE_ENV = 'development';
    process.env.WITH_MOCK_API = 'true';

    jest.mocked(worker.start).mockImplementationOnce(() => {
      throw new Error('Unhandled request');
    });

    await expect(initMockApi()).rejects.toThrow('Unhandled request');
  });
});
