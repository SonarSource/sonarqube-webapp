/*
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import {
  registerDefaultServiceMocks,
  startServer,
  stopServer,
} from '../../../../libs/shared/src/api/mocks/server';
import {
  ModeServiceDefaultDataset,
  ModeServiceMock,
} from '../../../../libs/shared/src/api/mocks/services/ModeServiceMock';
import { PermissionChecksServiceMock } from '../../../../libs/sq-server-commons/src/api/mocks/PermissionChecksServiceMock';

// Establish API mocking before all tests.
// We don't want to fail on unhandled requests as we have some that are not important for the tests
beforeAll(() => {
  startServer({ onUnhandledRequest: 'bypass' });

  // registerDefaultServiceMocks replaces its handler list on every call, so all persistent
  // defaults must be registered together in one call — a second call would silently drop the
  // first's handlers instead of adding to them.
  registerDefaultServiceMocks(
    // The shared page shell (issue/severity components reached via ~adapters) fetches the
    // clean-code-policy mode on SonarQube Server. Seed a persistent default handler so tests
    // that don't care about mode don't hit the network (which would surface as a console.error
    // and hang the query). registerDefaultServiceMocks keeps it alive across the
    // resetServiceMocks() calls tests make, including the mid-test resets some suites perform.
    // Tests can still override it by registering their own mode mock, which takes priority.
    new ModeServiceMock(ModeServiceDefaultDataset),
    // The project settings nav menu (SONAR-31894) fetches DOP permission checks to decide
    // whether the Remediation Agent supports the project's binding. Seed a persistent default
    // (a single SUFFICIENT check) so tests that don't care about this hit neither the network
    // nor an unhandled-request console.error. Tests exercising the unsupported-binding case
    // override it.
    new PermissionChecksServiceMock(),
  );
});

// Clean up after the tests are finished.
afterAll(() => stopServer());

// React 19 processes commit-phase ref callbacks (e.g. Radix UI's setState setters used inside
// Echoes components like Select and RadioButtonGroup) more eagerly than React 18, causing
// nestedUpdateCount to accumulate across sequential tests that share the same React module
// instance. Flush pending React work after each test to reset it before the next test runs.
afterEach(async () => {
  await act(async () => {});
});
