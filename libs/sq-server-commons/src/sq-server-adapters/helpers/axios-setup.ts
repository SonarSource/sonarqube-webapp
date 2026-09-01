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

import { toast } from '@sonarsource/echoes-react';
import { AxiosHeaders, AxiosInstance, AxiosInterceptorManager, AxiosResponse } from 'axios';
import { setCachedCSRFToken } from '../../helpers/csrf-token';
import { getCSRFTokenName, getCSRFTokenValue, parseErrorResponse } from '../../helpers/request';
import { getBaseUrl } from './system';

type AxiosResponseInterceptor = Parameters<AxiosInterceptorManager<AxiosResponse>['use']>;

type SetupAxiosClientFunc = (
  axiosInstance: AxiosInstance,
  responseInterceptors?: AxiosResponseInterceptor[],
) => Promise<AxiosInstance>;

/**
 * Some calls made through this client target third-party APIs with an absolute,
 * cross-origin URL (e.g. Beamer) — the CSRF token must never be attached to, or
 * cached from, those.
 */
function isSameOriginUrl(url?: string, baseURL?: string): boolean {
  if (!url) {
    return false;
  }
  try {
    // `baseURL` (e.g. a deployment context path like `/sonarqube`) can itself be relative,
    // so resolve it against the page URL first to get a valid base for `url`.
    const base = baseURL ? new URL(baseURL, window.location.href) : window.location.href;
    return new URL(url, base).origin === window.location.origin;
  } catch {
    return false;
  }
}

function cacheCSRFTokenFromHeaders(headers: AxiosHeaders): void {
  const token = headers.get(getCSRFTokenName());
  if (typeof token === 'string' && token) {
    setCachedCSRFToken(token);
  }
}

export const setupAxiosClient: SetupAxiosClientFunc = async (
  axiosInstance,
  responseInterceptors = [],
) => {
  axiosInstance.defaults.baseURL = getBaseUrl();
  axiosInstance.defaults.headers.patch = { 'Content-Type': 'application/merge-patch+json' };

  axiosInstance.interceptors.request.use((config) => {
    // We manage the CSRF token ourselves; always prevent axios from reading the
    // (possibly HttpOnly) XSRF-TOKEN cookie on its own.
    config.withXSRFToken = false;

    if (isSameOriginUrl(config.url, config.baseURL)) {
      const token = getCSRFTokenValue();
      if (token) {
        config.headers.set(getCSRFTokenName(), token);
      }
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      if (isSameOriginUrl(response.config.url, response.config.baseURL)) {
        cacheCSRFTokenFromHeaders(response.headers as AxiosHeaders);
      }
      return response;
    },
    (error) => {
      const { response } = error;
      if (response && isSameOriginUrl(response.config?.url, response.config?.baseURL)) {
        cacheCSRFTokenFromHeaders(response.headers as AxiosHeaders);
      }
      return Promise.reject(error);
    },
  );

  responseInterceptors.forEach((interceptor) => {
    axiosInstance.interceptors.response.use(...interceptor);
  });

  return Promise.resolve(axiosInstance);
};

export const axiosClientResponseInterceptors: AxiosResponseInterceptor[] = [
  [
    (response) => response.data,
    (error) => {
      const { response } = error;
      toast.error({
        description: parseErrorResponse(response),
        duration: 'short',
      });

      return Promise.reject(response);
    },
  ],
];

export const axiosToCatchResponseInterceptors: AxiosResponseInterceptor[] = [
  [(response) => response.data],
];
