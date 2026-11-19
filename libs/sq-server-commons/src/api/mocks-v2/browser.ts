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

import { RequestHandler } from 'msw';
import { setupWorker } from 'msw/browser';
import handlersDev from './handlersDev';

interface LocalMocks {
  default: RequestHandler[];
  replaceDevHandlers?: boolean;
}

// Optional, git-ignored short-lived mocks for demos and manual checks: create handlers.local.ts here.
const [localMocks] = Object.values(
  import.meta.glob<LocalMocks>('./handlers.local.ts', { eager: true }),
);

export const localHandlers = localMocks?.default ?? [];
export const replaceDevHandlers = localMocks?.replaceDevHandlers ?? false;

export const worker = setupWorker(...(replaceDevHandlers ? [] : handlersDev));
