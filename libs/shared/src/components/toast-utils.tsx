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

import { IconCheckCircle, IconError } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { Id, ToastOptions, toast } from 'react-toastify';

export enum MessageLevel {
  Error = 'ERROR',
  Success = 'SUCCESS',
}

export function dismissToastMessage(id: Id) {
  toast.dismiss(id);
}

export function dismissAllToastMessages() {
  toast.dismiss();
}

/** @deprecated Use `useToast` instead */
export function addGlobalErrorMessage(message: ReactNode, overrides?: ToastOptions) {
  return createToastContent(message, MessageLevel.Error, overrides);
}

/** @deprecated Use `useToast` instead */
export function addGlobalSuccessMessage(message: ReactNode, overrides?: ToastOptions) {
  return createToastContent(message, MessageLevel.Success, overrides);
}

export function createToastContent(
  message: ReactNode,
  level: MessageLevel,
  overrides?: ToastOptions,
  toastId?: string,
) {
  const overrideObject: ToastOptions = {
    icon: level === MessageLevel.Error ? <IconError /> : <IconCheckCircle />,
    type: level === MessageLevel.Error ? 'error' : 'success',
    ...overrides,
  };

  if (toastId) {
    overrideObject.toastId = toastId;
  }

  return toast(
    <div
      className="fs-mask sw-typo-default sw-p-3 sw-pb-4"
      data-testid={`global-message__${level}`}
    >
      {message}
    </div>,
    overrideObject,
  );
}
