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
import { isAxiosError, type AxiosError } from 'axios';
import { HttpStatus } from '~shared/types/request';
import handleRequiredAuthentication from '../../helpers/handleRequiredAuthentication';
import { parseError } from '../../helpers/request';

interface ThrowGlobalErrorOptions {
  redirectUnauthorizedNoReasons?: boolean;
  returnErrorReasons?: boolean; // used only in SC
}

export function throwGlobalError(
  param: unknown,
  options: ThrowGlobalErrorOptions = {},
): Promise<never> {
  if (!param) {
    return Promise.reject(new Error('No error provided'));
  }
  let resolved: unknown = param;

  if (
    resolved !== null &&
    typeof resolved === 'object' &&
    'response' in resolved &&
    resolved.response instanceof Response
  ) {
    /* eslint-disable-next-line no-console */
    console.warn('DEPRECATED: response should not be wrapped, pass it directly.');
    resolved = resolved.response;
  }

  if (resolved instanceof Response || isAxiosError<{ message?: string }>(resolved)) {
    return throwGlobalErrorInternal(resolved, options);
  }

  return Promise.reject(
    param instanceof Error ? param : new Error('Unexpected error', { cause: param }),
  );
}

async function throwGlobalErrorInternal(
  param: AxiosError<{ message?: string }> | Response,
  options: ThrowGlobalErrorOptions,
): Promise<never> {
  if (param instanceof Response) {
    await parseError(param).then(
      (message) => {
        toast.error({ description: message, id: message, duration: 'medium' });
        if (options.redirectUnauthorizedNoReasons && param.status === HttpStatus.Unauthorized) {
          handleRequiredAuthentication();
        }
      },
      () => {
        /* ignore parsing errors */
      },
    );
    throw param;
  }

  // Axios response object
  const message = param.response?.data?.message;
  if (message) {
    toast.error({ description: message, id: message, duration: 'medium' });
  }

  throw param;
}
