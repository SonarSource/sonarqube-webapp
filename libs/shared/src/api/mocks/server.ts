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

import { RequestHandler, SharedOptions } from 'msw';
import { setupServer } from 'msw/node';
import { AbstractServiceMock } from './AbstractServiceMock';

export const server = setupServer();

// Handlers that must survive resetServiceMocks(). Runtime handlers registered via server.use()
// (i.e. registerServiceMocks) are dropped by server.resetHandlers(), so a mock seeded once in a
// beforeAll would disappear the first time a test calls resetServiceMocks() mid-run. Anything
// registered here is re-applied on every reset. Empty unless a setup file opts in, so this is a
// no-op for every consumer that doesn't call registerDefaultServiceMocks().
let defaultHandlers: RequestHandler[] = [];

export function startServer(options?: Partial<SharedOptions>) {
  server.listen(options);
}

export function stopServer() {
  server.close();
}

export function resetServiceMocks() {
  server.resetHandlers();
  if (defaultHandlers.length > 0) {
    server.use(...defaultHandlers);
  }
}

export function registerServiceMocks(...mocks: AbstractServiceMock<unknown>[]) {
  server.use(...mocks.flatMap((m) => m.getHandlers()));
}

/**
 * Registers mocks whose handlers persist across resetServiceMocks() calls. Use for cross-cutting
 * endpoints hit by the shared page shell (e.g. the clean-code-policy mode on SonarQube Server) that
 * individual tests don't care about but must not leave unhandled. Tests can still override them by
 * registering their own handler, which takes priority.
 */
export function registerDefaultServiceMocks(...mocks: AbstractServiceMock<unknown>[]) {
  defaultHandlers = mocks.flatMap((m) => m.getHandlers());
  server.use(...defaultHandlers);
}
