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

const MINIMUM_TRIES_TIMEOUT = 500;
const MAXIMUM_TRIES_TIMEOUT = 3000;

function tryRequestAgain<T>(
  repeatAPICall: () => Promise<T>,
  tries: { max: number; slowThreshold: number },
  stopRepeat: (response: T) => boolean,
  repeatErrors: number[] = [],
  lastError?: Response,
) {
  tries.max--;
  if (tries.max !== 0) {
    return new Promise<T>((resolve) => {
      setTimeout(
        () => {
          resolve(requestTryAndRepeatUntil(repeatAPICall, tries, stopRepeat, repeatErrors));
        },
        tries.max > tries.slowThreshold ? MINIMUM_TRIES_TIMEOUT : MAXIMUM_TRIES_TIMEOUT,
      );
    });
  }
  return Promise.reject(lastError);
}

export function requestTryAndRepeatUntil<T>(
  repeatAPICall: () => Promise<T>,
  tries: { max: number; slowThreshold: number },
  stopRepeat: (response: T) => boolean,
  repeatErrors: number[] = [],
  initialAPICall?: () => Promise<T>,
) {
  return (initialAPICall ?? repeatAPICall)().then(
    (r) => {
      if (stopRepeat(r)) {
        return r;
      }
      return tryRequestAgain(repeatAPICall, tries, stopRepeat, repeatErrors);
    },
    (error: Response) => {
      if (repeatErrors.length === 0 || repeatErrors.includes(error.status)) {
        return tryRequestAgain(repeatAPICall, tries, stopRepeat, repeatErrors, error);
      }
      return Promise.reject(error);
    },
  );
}
