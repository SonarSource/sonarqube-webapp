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

import axios from 'axios';
import 'react-day-picker/dist/style.css';
import { addons } from '~addons/index';
import { addGlobalErrorMessage } from '~design-system';
import { getAvailableFeatures } from '~sq-server-shared/api/features';
import { getGlobalNavigation } from '~sq-server-shared/api/navigation';
import { getValue } from '~sq-server-shared/api/settings';
import { getCurrentUser } from '~sq-server-shared/api/users';
import {
  installExtensionsHandler,
  installWebAnalyticsHandler,
} from '~sq-server-shared/helpers/extensionsHandler';
import { loadL10nBundle } from '~sq-server-shared/helpers/l10nBundle';
import { axiosToCatch, parseErrorResponse } from '~sq-server-shared/helpers/request';
import {
  getBaseUrl,
  getSystemStatus,
  initAppVariables,
  initMockApi,
} from '~sq-server-shared/helpers/system';
import { isDefined } from '~sq-server-shared/helpers/types';
import { Feature } from '~sq-server-shared/types/features';
import { SettingsKey } from '~sq-server-shared/types/settings';
import './styles/sonar.ts';

installWebAnalyticsHandler();
installExtensionsHandler();
initAppVariables();
initMockApi()
  .then(initApplication)
  .catch((e) => {
    throw e;
  });

async function initApplication() {
  axiosToCatch.interceptors.response.use((response) => response.data);
  axiosToCatch.defaults.baseURL = getBaseUrl();
  axiosToCatch.defaults.headers.patch['Content-Type'] = 'application/merge-patch+json';
  axios.defaults.headers.patch['Content-Type'] = 'application/merge-patch+json';
  axios.defaults.baseURL = getBaseUrl();

  axios.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const { response } = error;
      addGlobalErrorMessage(parseErrorResponse(response));

      return Promise.reject(response);
    },
  );

  const appState = isMainApp()
    ? await getGlobalNavigation().catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        return undefined;
      })
    : undefined;

  const [l10nBundle, currentUser, availableFeatures, architectureOptIn] = await Promise.all([
    loadL10nBundle(appState),
    isMainApp() ? getCurrentUser() : undefined,
    isMainApp() ? getAvailableFeatures() : undefined,
    isMainApp() ? getValue({ key: SettingsKey.DesignAndArchitecture }) : undefined,
  ]).catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Application failed to start', error);
    throw error;
  });

  const optInFeatures = architectureOptIn?.value === 'true' ? [Feature.Architecture] : [];

  const filteredFeatures = availableFeatures?.filter((f) => {
    if (f === Feature.BranchSupport) {
      return isDefined(addons.branches);
    }

    return true;
  });

  const startReactApp = await import('./utils/startReactApp').then((i) => i.default);
  startReactApp(l10nBundle, currentUser, appState, filteredFeatures, optInFeatures);
}

function isMainApp() {
  const { pathname } = window.location;

  return (
    getSystemStatus() === 'UP' &&
    !pathname.startsWith(`${getBaseUrl()}/sessions`) &&
    !pathname.startsWith(`${getBaseUrl()}/maintenance`) &&
    !pathname.startsWith(`${getBaseUrl()}/setup`) &&
    !pathname.startsWith(`${getBaseUrl()}/formatting/help`)
  );
}
