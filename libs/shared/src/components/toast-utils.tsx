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

import { toast, ToastParams } from '@sonarsource/echoes-react';

/** @deprecated Use `toast.error` from Echoes instead */
export function addGlobalErrorMessage(
  message: ToastParams['description'],
  overrides?: ToastParams,
) {
  return toast.error({ description: message, ...overrides });
}

/** @deprecated Use `toast.success` from Echoes instead */
export function addGlobalSuccessMessage(
  message: ToastParams['description'],
  overrides?: ToastParams,
) {
  return toast.success({ description: message, ...overrides });
}
