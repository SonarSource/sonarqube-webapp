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

import { isAfter } from 'date-fns';
import { AppVariablesElement } from '../types/browser';
import { getEnhancedWindow } from './browser';
import { parseDate } from './dates';

export { getBaseUrl } from '~adapters/helpers/system';

export function getSystemStatus() {
  return getEnhancedWindow().serverStatus;
}

export function getInstance() {
  return getEnhancedWindow().instance;
}

export function isOfficial() {
  return getEnhancedWindow().official;
}

export function getReactDomContainerSelector() {
  return '#content';
}

export function initAppVariables() {
  const appVariablesDiv = document.querySelector<AppVariablesElement>(
    getReactDomContainerSelector(),
  );
  if (appVariablesDiv === null) {
    throw new Error('Failed to get app variables');
  }

  getEnhancedWindow().baseUrl = appVariablesDiv.dataset.baseUrl;
  getEnhancedWindow().serverStatus = appVariablesDiv.dataset.serverStatus;
  getEnhancedWindow().instance = appVariablesDiv.dataset.instance;
  getEnhancedWindow().official = Boolean(appVariablesDiv.dataset.official);
}

export function isCurrentVersionEOLActive(versionEOL: string) {
  return isAfter(parseDate(versionEOL), new Date());
}

export async function initMockApi() {
  if (process.env.NODE_ENV === 'development' && process.env.WITH_MOCK_API === 'true') {
    const { worker } = await import('../api/mocks-v2/browser');
    return worker
      .start({
        onUnhandledRequest: (req, print) => {
          const url = new URL(req.url);

          if (url.pathname.startsWith('/api')) {
            print.warning();
          }
        },
      })
      .catch((e) => {
        throw e;
      });
  }
  return Promise.resolve();
}
