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

import { type ModalAlertProps, Button, ButtonVariety, ModalAlert } from '@sonarsource/echoes-react';
import React from 'react';
import { translate } from '../../helpers/l10n';

export interface ConfirmModalProps<T> {
  cancelButtonText?: string;
  children: React.ReactNode;
  confirmButtonText: string;
  confirmData?: T;
  confirmDisable?: boolean;
  isDestructive?: boolean;
  isOpen: boolean;
  onConfirm: (data?: T) => void | Promise<void | Response>;
}

interface Props<T> extends ConfirmModalProps<T> {
  header: string;
  headerDescription?: ModalAlertProps['description'];
  onClose: () => void;
}

/** @deprecated Use {@link ModalAlert} from Echoes instead.
 * See the {@link https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/3465543707/Modals | Migration Guide}
 */
export default function ConfirmModal<T = string>(props: Readonly<Props<T>>) {
  const {
    header,
    onClose,
    onConfirm,
    children,
    confirmButtonText,
    confirmData,
    confirmDisable,
    headerDescription,
    isDestructive,
    isOpen,
    cancelButtonText = translate('cancel'),
  } = props;

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(() => {
    setSubmitting(true);
    const result = onConfirm(confirmData);

    if (result) {
      return result.then(
        () => {
          setSubmitting(false);
          onClose();
        },
        () => {
          setSubmitting(false);
        },
      );
    }

    setSubmitting(false);
    onClose();
    return undefined;
  }, [confirmData, onClose, onConfirm, setSubmitting]);

  return (
    <ModalAlert
      content={children}
      // A modal alert must have a description. However, there are many places a `ConfirmModal` is
      // used without a description. This type override allows the `ConfirmModal` to be backwards
      // compatible. The`ConfirmModal` component is deprecated and developers should use
      // `ModalAlert` instead.
      description={headerDescription as ModalAlertProps['description']}
      isOpen={isOpen}
      onOpenChange={onClose}
      primaryButton={
        <Button
          isDisabled={submitting || confirmDisable}
          isLoading={submitting}
          onClick={handleSubmit}
          variety={isDestructive ? ButtonVariety.Danger : ButtonVariety.Primary}
        >
          {confirmButtonText}
        </Button>
      }
      secondaryButtonLabel={cancelButtonText}
      title={header}
    />
  );
}
