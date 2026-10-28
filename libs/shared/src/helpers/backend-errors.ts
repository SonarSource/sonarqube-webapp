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

export function getBackendErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }
  const errorRecord = error as Record<string, unknown>;

  if (typeof errorRecord.msg === 'string' && errorRecord.msg) {
    return errorRecord.msg;
  }

  if (typeof errorRecord.message === 'string' && errorRecord.message) {
    return errorRecord.message;
  }

  return undefined;
}

export function getBackendErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== 'object') {
    return [];
  }
  const errorRecord = error as Record<string, unknown>;
  if (!Array.isArray(errorRecord.errors)) {
    return [];
  }
  return errorRecord.errors
    .map((nestedError) => getBackendErrorMessage(nestedError))
    .filter((message): message is string => message !== undefined);
}

export function getBackendErrorSummary(data: unknown): string | undefined {
  const message = getBackendErrorMessage(data);
  if (message) {
    return message;
  }

  const messages = getBackendErrorMessages(data);
  return messages.length > 0 ? messages.join('. ') : undefined;
}

interface ApiErrorLike {
  response?: { data?: unknown };
}

export function getApiErrorMessage(error: unknown): string | undefined {
  const data = (error as ApiErrorLike | undefined)?.response?.data;
  return getBackendErrorSummary(data);
}
