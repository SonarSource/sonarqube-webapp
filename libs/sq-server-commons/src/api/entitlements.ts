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

import { AxiosError } from 'axios';
import { throwGlobalError } from '~adapters/helpers/error';
import { axiosToCatch } from '../helpers/request';
import { LicenseV2, PurchaseableFeature } from '../types/editions';

const DOMAIN = '/api/v2/entitlements';

export const axiosErrorHandler = (error: AxiosError) => {
  const responseData = error.response?.data;

  const errorMessage =
    responseData === null || typeof responseData === 'string'
      ? error.response?.statusText
      : (error.response?.data as { message: string }).message;

  // eslint-disable-next-line promise/no-promise-in-callback
  return Promise.reject(
    new Error(errorMessage, {
      cause: error.status,
    }),
  );
};

export function getCurrentLicense(): Promise<LicenseV2 | null> {
  return axiosToCatch.get<LicenseV2 | null>(`${DOMAIN}/license`).catch((response: Response) => {
    if (response.status === 404) {
      return null;
    }

    return throwGlobalError(response);
  });
}

export function getPurchasableFeatures(): Promise<PurchaseableFeature[]> {
  return axiosToCatch
    .get<PurchaseableFeature[]>(`${DOMAIN}/purchasable-features`)
    .catch(axiosErrorHandler);
}
