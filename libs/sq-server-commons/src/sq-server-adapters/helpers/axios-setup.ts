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
import { AxiosInstance, AxiosInterceptorManager, AxiosResponse } from 'axios';
import { parseErrorResponse } from '../../helpers/request';
import { getBaseUrl } from './system';

type AxiosResponseInterceptor = Parameters<AxiosInterceptorManager<AxiosResponse>['use']>;

type SetupAxiosClientFunc = (
  axiosInstance: AxiosInstance,
  responseInterceptors?: AxiosResponseInterceptor[],
) => Promise<AxiosInstance>;

export const setupAxiosClient: SetupAxiosClientFunc = async (
  axiosInstance,
  responseInterceptors = [],
) => {
  axiosInstance.defaults.baseURL = getBaseUrl();
  axiosInstance.defaults.headers.patch = { 'Content-Type': 'application/merge-patch+json' };

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
