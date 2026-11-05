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

const React = require('react');

// Temporary compatibility shim.
// It keeps the existing `jest-launchdarkly-mock` testing pattern working for now,
// even though the app now uses `@launchdarkly/react-sdk`.
// Remove it once the test suite has been updated to the supported v4 testing approach.

let mockedFlagSet = {};
const changeListeners = new Set();

const getFlagValue = (flagKey, defaultValue) => {
  return Object.prototype.hasOwnProperty.call(mockedFlagSet, flagKey)
    ? mockedFlagSet[flagKey]
    : defaultValue;
};

const {
  createClient,
  createLDReactProvider,
  createLDReactProviderWithClient,
  useFlags,
  useInitializationStatus,
  useLDClient,
} = require('@launchdarkly/react-sdk');

const { camelCase, kebabCase, snakeCase } = require('lodash');

jest.mock('@launchdarkly/react-sdk', () => ({
  LDReactContext: React.createContext({
    client: {
      allFlags: () => mockedFlagSet,
      off: (eventName, listener) => {
        if (eventName === 'change') {
          changeListeners.delete(listener);
        }
      },
      on: (eventName, listener) => {
        if (eventName === 'change') {
          changeListeners.add(listener);
        }
      },
      variation: (flagKey, defaultValue) => getFlagValue(flagKey, defaultValue),
    },
    context: undefined,
    initializedState: 'complete',
  }),
  createClient: jest.fn(),
  createLDReactProvider: jest.fn(),
  createLDReactProviderWithClient: jest.fn(),
  useFlags: jest.fn(() => ({})),
  useInitializationStatus: jest.fn(() => ({ status: 'complete' })),
  useLDClient: jest.fn(),
}));

const defaultInitializationStatus = () => ({ status: 'complete' });

const ldClientMock = {
  addHook: jest.fn(),
  allFlags: jest.fn(),
  close: jest.fn(),
  flush: jest.fn(),
  getContext: jest.fn(),
  getInitializationError: jest.fn(),
  getInitializationState: jest.fn(() => 'complete'),
  identify: jest.fn(),
  isReady: jest.fn(() => true),
  off: jest.fn(),
  on: jest.fn(),
  onContextChange: jest.fn(),
  onInitializationStatusChange: jest.fn(),
  setStreaming: jest.fn(),
  start: jest.fn().mockResolvedValue(defaultInitializationStatus()),
  track: jest.fn(),
  variation: jest.fn(),
  variationDetail: jest.fn(),
  waitForInitialization: jest.fn(),
  waitUntilGoalsReady: jest.fn(),
  waitUntilReady: jest.fn(),
};

const mockCreateClient = jest.mocked(createClient);
const mockCreateLDReactProvider = jest.mocked(createLDReactProvider);
const mockCreateLDReactProviderWithClient = jest.mocked(createLDReactProviderWithClient);
const mockUseFlags = jest.mocked(useFlags);
const mockUseInitializationStatus = jest.mocked(useInitializationStatus);
const mockUseLDClient = jest.mocked(useLDClient);

ldClientMock.allFlags.mockImplementation(() => mockedFlagSet);

ldClientMock.off.mockImplementation((eventName, listener) => {
  if (eventName === 'change') {
    changeListeners.delete(listener);
  }
});

ldClientMock.on.mockImplementation((eventName, listener) => {
  if (eventName === 'change') {
    changeListeners.add(listener);
  }
});

ldClientMock.variation.mockImplementation((flagKey, defaultValue) =>
  getFlagValue(flagKey, defaultValue),
);

mockCreateClient.mockImplementation(() => ldClientMock);
mockCreateLDReactProvider.mockImplementation(() => (props) => props.children);
mockCreateLDReactProviderWithClient.mockImplementation(() => (props) => props.children);
mockUseLDClient.mockImplementation(() => ldClientMock);

const mockFlags = (flags) => {
  const result = {};

  Object.keys(flags).forEach((key) => {
    const kebab = kebabCase(key);
    const camel = camelCase(key);
    const snake = snakeCase(key);

    result[kebab] = flags[key];
    result[camel] = flags[key];
    result[snake] = flags[key];
    result[key] = flags[key];
  });

  mockedFlagSet = result;
  mockUseFlags.mockImplementation(() => result);
};

const emitFlagChange = () => {
  Array.from(changeListeners).forEach((listener) => listener());
};

const resetLDMocks = () => {
  mockedFlagSet = {};
  changeListeners.clear();
  mockCreateClient.mockImplementation(() => ldClientMock);
  mockCreateLDReactProvider.mockImplementation(() => (props) => props.children);
  mockCreateLDReactProviderWithClient.mockImplementation(() => (props) => props.children);
  mockUseFlags.mockImplementation(() => mockedFlagSet);
  mockUseInitializationStatus.mockImplementation(defaultInitializationStatus);
  mockUseLDClient.mockImplementation(() => ldClientMock);

  Object.values(ldClientMock).forEach((value) => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset();
    }
  });

  ldClientMock.getInitializationState.mockReturnValue('complete');
  ldClientMock.isReady.mockReturnValue(true);
  ldClientMock.allFlags.mockImplementation(() => mockedFlagSet);

  ldClientMock.off.mockImplementation((eventName, listener) => {
    if (eventName === 'change') {
      changeListeners.delete(listener);
    }
  });

  ldClientMock.on.mockImplementation((eventName, listener) => {
    if (eventName === 'change') {
      changeListeners.add(listener);
    }
  });

  ldClientMock.start.mockResolvedValue(defaultInitializationStatus());

  ldClientMock.variation.mockImplementation((flagKey, defaultValue) =>
    getFlagValue(flagKey, defaultValue),
  );
};

module.exports = {
  emitFlagChange,
  ldClientMock,
  mockFlags,
  resetLDMocks,
};
