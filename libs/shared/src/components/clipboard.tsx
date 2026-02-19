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

import {
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconCopy,
  Tooltip,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { copy } from 'clipboard';
import { ComponentProps, MouseEvent, ReactNode, useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const COPY_SUCCESS_NOTIFICATION_LIFESPAN = 1000;

interface ButtonProps {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  copiedLabel?: ReactNode;
  copyValue: string;
  icon?: ReactNode;
}

export function ClipboardButton(props: Readonly<ButtonProps>) {
  const { icon, className, children, copyValue, ariaLabel, copiedLabel } = props;
  const [copySuccess, handleCopy] = useCopyClipboardEffect(copyValue);

  return (
    <Tooltip content={copiedLabel ?? <FormattedMessage id="copied_action" />} isOpen={copySuccess}>
      <Button
        aria-label={ariaLabel}
        className={classNames('sw-select-none', className)}
        onClick={handleCopy}
        prefix={icon ?? <IconCopy />}
      >
        {children ?? <FormattedMessage id="copy" />}
      </Button>
    </Tooltip>
  );
}

interface IconButtonProps {
  Icon?: ComponentProps<typeof ButtonIcon>['Icon'];
  'aria-label'?: string;
  className?: string;
  copiedLabel?: string;
  copyLabel?: string;
  copyValue: string;
  discreet?: boolean;
  size?: `${ButtonSize}`;
}

export function ClipboardIconButton(props: Readonly<IconButtonProps>) {
  const { formatMessage } = useIntl();
  const {
    className,
    copyValue,
    discreet,
    size = ButtonSize.Medium,
    Icon = IconCopy,
    copiedLabel = formatMessage({ id: 'copied_action' }),
    copyLabel = formatMessage({ id: 'copy_to_clipboard' }),
  } = props;
  const [copySuccess, handleCopy] = useCopyClipboardEffect(copyValue);

  return (
    <ButtonIcon
      Icon={Icon}
      ariaLabel={props['aria-label'] ?? copyLabel}
      className={className}
      onClick={handleCopy}
      size={size}
      tooltipContent={copySuccess ? copiedLabel : copyLabel}
      tooltipOptions={copySuccess ? { isOpen: copySuccess } : undefined}
      variety={discreet ? ButtonVariety.DefaultGhost : ButtonVariety.Default}
    />
  );
}

export function useCopyClipboardEffect(copyValue: string) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = useCallback(
    async ({ currentTarget }: MouseEvent<HTMLButtonElement>) => {
      let isSuccess = false;

      // Try modern Clipboard API first (works better in modals and secure contexts)
      if (navigator.clipboard && globalThis.isSecureContext) {
        try {
          await navigator.clipboard.writeText(copyValue);
          isSuccess = true;
        } catch {
          // no-op, fall through to clipboard.js
        }
      }

      // Fallback to clipboard.js for older browsers or if modern API failed
      if (!isSuccess) {
        isSuccess = copy(copyValue) === copyValue;
      }

      setCopySuccess(isSuccess);

      if (isSuccess) {
        setTimeout(() => {
          setCopySuccess(false);
        }, COPY_SUCCESS_NOTIFICATION_LIFESPAN);
      }

      currentTarget.focus();
    },
    [copyValue],
  );

  return [copySuccess, handleCopy] as const;
}
