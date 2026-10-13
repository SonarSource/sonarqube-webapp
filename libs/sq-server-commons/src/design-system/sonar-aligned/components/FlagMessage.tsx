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

import styled from '@emotion/styled';
import * as Echoes from '@sonarsource/echoes-react';
import { cssVar, type EchoesDesignTokens } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { InteractiveIcon } from '../../components/InteractiveIcon';
import {
  CloseIcon,
  FlagErrorIcon,
  FlagInfoIcon,
  FlagSuccessIcon,
  FlagWarningIcon,
} from '../../components/icons';

/**
 * @deprecated Use {@link Echoes.MessageVariety | MessageVariety} from Echoes instead.
 */
export type Variant = 'error' | 'warning' | 'success' | 'info';

type FlagMessageVariant = 'error' | 'warning' | 'success' | 'info';

interface Props {
  variant: FlagMessageVariant;
}

function getVariantInfo(variant: FlagMessageVariant) {
  const variantList: Record<
    FlagMessageVariant,
    {
      backgroundColor: EchoesDesignTokens;
      borderColor: EchoesDesignTokens;
      icon: React.ReactNode;
    }
  > = {
    error: {
      icon: <FlagErrorIcon />,
      borderColor: 'color-border-danger-weak',
      backgroundColor: 'color-background-danger-weak-default',
    },
    warning: {
      icon: <FlagWarningIcon />,
      borderColor: 'color-border-warning-weak',
      backgroundColor: 'color-background-warning-weak-default',
    },
    success: {
      icon: <FlagSuccessIcon />,
      borderColor: 'color-border-success-weak',
      backgroundColor: 'color-background-success-weak-default',
    },
    info: {
      icon: <FlagInfoIcon />,
      borderColor: 'color-border-info-weak',
      backgroundColor: 'color-background-info-weak-default',
    },
  };

  return variantList[variant];
}

function FlagMessageBase(props: Props & React.HTMLAttributes<HTMLDivElement>) {
  const { className, variant, ...domProps } = props;
  const variantInfo = getVariantInfo(variant);

  return (
    <StyledFlag className={classNames('alert', className)} variantInfo={variantInfo} {...domProps}>
      {props.children && (
        <div className="flag-inner">
          <div className="flag-icon">{variantInfo.icon}</div>
          <div className="flag-content">{props.children}</div>
        </div>
      )}
    </StyledFlag>
  );
}

/**
 * @deprecated Use {@link Echoes.MessageCallout | MessageCallout} from Echoes instead.
 *
 * Or {@link Echoes.MessageInline | MessageInline} for lightweight contextual communication.
 *
 * Some of the props have changed:
 * - `variant` is now `type` using the {@link Echoes.MessageVariety | MessageVariety} enum, note that `error` is now called `Danger`
 * - `children` is now `text`
 *
 * New features for MessageCallout include:
 * - `action` allows you to pass buttons that are displayed at the bottom of the callout message
 * - `onDismiss` to make the callout message dismissible
 * - `title` to add an optional title to the callout message
 * - `screenReaderPrefix` to optionally change the default prefix that indicates the type of message to the screen readers
 *
 * See the {@link https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/3774447676/Messages | Migration Guide} for more information.
 */
export function FlagMessage(props: Props & React.HTMLAttributes<HTMLDivElement>) {
  return <FlagMessageBase {...props} />;
}

FlagMessage.displayName = 'FlagMessage'; // so that tests don't see the obfuscated production name

interface DismissableFlagMessageProps extends Props {
  onDismiss: () => void;
}

/**
 * @deprecated Use {@link Echoes.MessageCallout | MessageCallout} from Echoes instead.
 *
 * Some of the props have changed:
 * - `variant` is now `type` using the {@link Echoes.MessageVariety | MessageVariety} enum, note that `error` is now called `Danger`
 * - `children` is now `text`
 *
 * New features for MessageCallout include:
 * - `action` allows you to pass buttons that are displayed at the bottom of the callout message
 * - `onDismiss` to make the callout message dismissible
 * - `title` to add an optional title to the callout message
 * - `screenReaderPrefix` to optionally change the default prefix that indicates the type of message to the screen readers
 *
 * See the {@link https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/3774447676/Messages | Migration Guide} for more information.
 */
export function DismissableFlagMessage(
  props: DismissableFlagMessageProps & React.HTMLAttributes<HTMLDivElement>,
) {
  const { onDismiss, children, ...flagMessageProps } = props;
  const intl = useIntl();
  return (
    <FlagMessageBase {...flagMessageProps}>
      {children}
      <DismissIcon
        Icon={CloseIcon}
        aria-label={intl.formatMessage({ id: 'dismiss' })}
        className="sw-ml-3"
        onClick={onDismiss}
        size="small"
      />
    </FlagMessageBase>
  );
}

DismissableFlagMessage.displayName = 'DismissableFlagMessage'; // so that tests don't see the obfuscated production name

const StyledFlag = styled.div<{ variantInfo: ReturnType<typeof getVariantInfo> }>`
  display: inline-flex;
  min-height: ${cssVar('dimension-height-1000', '2.5rem')};
  border-radius: ${cssVar('border-radius-200', '0.25rem')};
  box-sizing: border-box;

  border: ${cssVar('border-width-default')} solid
    ${({ variantInfo }) => cssVar(variantInfo.borderColor)};
  background-color: ${cssVar('color-surface-default')};

  :empty {
    display: none;
  }

  & > .flag-inner {
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
  }

  & .flag-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-top-left-radius: ${cssVar('border-radius-200', '0.25rem')};
    border-bottom-left-radius: ${cssVar('border-radius-200', '0.25rem')};
    padding-left: ${cssVar('dimension-space-150', '0.75rem')};
    padding-right: ${cssVar('dimension-space-150', '0.75rem')};
    background-color: ${({ variantInfo }) => cssVar(variantInfo.backgroundColor)};
  }

  & .flag-content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    overflow: auto;
    text-align: left;
    padding-left: ${cssVar('dimension-space-150', '0.75rem')};
    padding-right: ${cssVar('dimension-space-150', '0.75rem')};
    padding-top: ${cssVar('dimension-space-100', '0.5rem')};
    padding-bottom: ${cssVar('dimension-space-100', '0.5rem')};
    font: ${cssVar('typography-text-default-regular')};
    color: ${cssVar('color-text-default')};
  }
`;

const DismissIcon = styled(InteractiveIcon)`
  --background: ${cssVar('color-background-ghost-neutral-default')};
  --backgroundHover: ${cssVar('color-background-ghost-neutral-hover')};
  --color: ${cssVar('color-icon-default')};
  --colorHover: ${cssVar('color-icon-default')};
  --focus: ${cssVar('color-focus-default')};

  height: 28px;
`;
