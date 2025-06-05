/*
 * Copyright (C) 2009-2025 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { startServer, stopServer } from '../../../../libs/shared/src/api/mocks/server';

// Fixes flaky tests timeouts as ITs are slower
configure({ asyncUtilTimeout: 6000 });

// Establish API mocking before all tests.
// We don't want to fail on unhandled requests as we have some that are not important for the tests
beforeAll(() => startServer({ onUnhandledRequest: 'bypass' }));

// Clean up after the tests are finished.
afterAll(() => stopServer());
