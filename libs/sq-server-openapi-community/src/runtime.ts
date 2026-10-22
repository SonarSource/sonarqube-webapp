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

// Generated SDK calls require full AxiosResponse objects; shared clients unwrap response.data.
import axios, { type AxiosResponse } from 'axios';
import { axiosClientErrorInterceptor, setupAxiosClient } from '~adapters/helpers/axios-setup';

const axiosInstance = axios.create();

export const openApiAxiosClientSetup = setupAxiosClient(axiosInstance, [
  [(response: AxiosResponse) => response, axiosClientErrorInterceptor],
]);

export function createClientConfig<T extends object>(override?: T) {
  return {
    ...override,
    axios: axiosInstance,
    paramsSerializer: { indexes: null },
    throwOnError: true as const,
  };
}
