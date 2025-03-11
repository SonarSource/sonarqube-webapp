/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { AppVariablesElement } from '../../types/browser';
import { InstanceType } from '../../types/system';
import { initAppVariables, initMockApi } from '../system';

// Faking window so we don't pollute real window set in /config/jest/SetupTestEnvironment
const fakeWindow = {};
jest.mock('../browser', () => ({
  getEnhancedWindow: jest.fn(() => fakeWindow),
}));

jest.mock('../../api/mocks-v2/browser', () => ({
  worker: {
    start: jest.fn().mockResolvedValue({}),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('initAppVariables', () => {
  it('should correctly init app variables', () => {
    const dataset: AppVariablesElement['dataset'] = {
      baseUrl: 'test/base-url',
      serverStatus: 'DOWN',
      instance: InstanceType.SonarQube,
      official: 'false',
    };

    const appVariablesElement = document.querySelector('#content') as AppVariablesElement;
    Object.assign(appVariablesElement.dataset, dataset);

    initAppVariables();

    expect(fakeWindow).toEqual({
      ...dataset,
      official: Boolean(dataset.official),
    });
  });

  it('should throw error if app variables element is not found', () => {
    const querySelector = jest.spyOn(document, 'querySelector');
    querySelector.mockReturnValue(null);

    expect(initAppVariables).toThrow();
  });
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
