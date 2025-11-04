/*
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

import '@testing-library/jest-dom';
import { startServer, stopServer } from '../../../../libs/shared/src/api/mocks/server';

// Establish API mocking before all tests.
// We don't want to fail on unhandled requests as we have some that are not important for the tests
beforeAll(() => startServer({ onUnhandledRequest: 'bypass' }));

// Clean up after the tests are finished.
afterAll(() => stopServer());
