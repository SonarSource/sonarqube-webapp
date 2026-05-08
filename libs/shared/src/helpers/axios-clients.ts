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

import axios, { type AxiosResponse } from 'axios';
import {
  axiosClientResponseInterceptors,
  axiosToCatchResponseInterceptors,
  setupAxiosClient,
} from '~adapters/helpers/axios-setup';

/**
 * This instance will catch error and display a toast with the error message
 */
export const axiosClient = axios.create();

void setupAxiosClient(axiosClient, axiosClientResponseInterceptors);

/**
 * This instance will not catch error, so you need to handle it yourself
 */
export const axiosToCatch = axios.create();

void setupAxiosClient(axiosToCatch, axiosToCatchResponseInterceptors);

function unwrapAxiosData<T>(response: AxiosResponse<T>): T {
  return response.data;
}

/**
 * This instance is for fetching presigned / cross-origin URLs returned in API
 * payloads (e.g. S3 download URLs). It deliberately omits app credentials,
 * XSRF, and baseURL so that:
 *   - the browser issues a simple GET (no preflight),
 *   - no session cookies leak to a third-party host,
 *   - the URL stands on its own as the authorization.
 * The response interceptor unwraps `response.data` to match the other clients.
 */
export const externalAxiosClient = axios.create();

externalAxiosClient.interceptors.response.use(unwrapAxiosData);
