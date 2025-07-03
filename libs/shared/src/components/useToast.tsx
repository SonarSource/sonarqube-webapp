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

import { useCallback, useRef } from 'react';
import { Id, ToastOptions, toast } from 'react-toastify';
import { MessageLevel, createToastContent } from './toast-utils';

export function useToastMessage(baseOverrides?: ToastOptions) {
  const toastId = useRef<Id | undefined>(undefined);

  const dismiss = useCallback(() => {
    if (toastId.current && toast.isActive(toastId.current)) {
      toast.dismiss(toastId.current);
    }
  }, []);

  const pushToast = useCallback(
    (message: string, level: MessageLevel, overrides?: ToastOptions) => {
      if (toastId.current && toast.isActive(toastId.current)) {
        toast.dismiss(toastId.current);
      }

      toastId.current = createToastContent(message, level, overrides ?? baseOverrides);
    },
    [baseOverrides],
  );

  const pushErrorToast = useCallback(
    (message: string, overrides?: ToastOptions) => {
      pushToast(message, MessageLevel.Error, overrides);
    },
    [pushToast],
  );

  const pushSuccessToast = useCallback(
    (message: string, overrides?: ToastOptions) => {
      pushToast(message, MessageLevel.Success, overrides);
    },
    [pushToast],
  );

  return {
    dismiss,
    pushToast,
    pushErrorToast,
    pushSuccessToast,
  };
}
