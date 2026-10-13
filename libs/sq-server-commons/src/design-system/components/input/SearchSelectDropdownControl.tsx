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
import { ButtonIcon, ButtonSize, ButtonVariety, cssVar, IconX } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { KeyboardEvent, MouseEvent } from 'react';
import { useIntl } from 'react-intl';
import { Key } from '~shared/helpers/keyboard';
import { INPUT_SIZES } from '../../helpers';
import { InputSizeKeys } from '../../types/theme';
import { ChevronDownIcon } from '../icons';

interface SearchSelectDropdownControlProps {
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  isClearable?: boolean;
  isDiscreet?: boolean;
  label?: React.ReactNode | string;
  onClear: VoidFunction;
  onClick: (event: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => void;
  placeholder?: string;
  size?: InputSizeKeys;
}

/**
 * @deprecated Use Select or SelectAsync from Echoes instead.
 *
 * See the [Migration Guide](https://xtranet-sonarsource.atlassian.net/wiki/x/K4AYxw)
 */
export function SearchSelectDropdownControl(props: SearchSelectDropdownControlProps) {
  const {
    className,
    disabled,
    placeholder,
    label,
    isClearable,
    isDiscreet,
    onClear,
    onClick,
    size = 'full',
    ariaLabel = '',
  } = props;

  const intl = useIntl();

  return (
    <StyledControl
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={classNames(className, { 'is-discreet': isDiscreet })}
      onClick={(ev: MouseEvent<HTMLDivElement>) => {
        if (!disabled) {
          onClick(ev);
        }
      }}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === Key.Enter || event.key === Key.ArrowDown) {
          onClick(event);
        }
      }}
      role="combobox"
      style={{ '--inputSize': isDiscreet ? 'auto' : INPUT_SIZES[size] }}
      tabIndex={disabled ? -1 : 0}
    >
      <InputValue
        className={classNames(
          'it__js-search-input-value sw-flex sw-justify-between sw-items-center',
          {
            'is-disabled': disabled,
            'is-placeholder': !label,
          },
        )}
      >
        <span className="sw-flex-1 sw-truncate">{label ?? placeholder}</span>
        <div className="sw-flex sw-items-center">
          {isClearable && (
            <ButtonIcon
              Icon={IconX}
              ariaLabel={intl.formatMessage({ id: 'clear' })}
              onClick={() => {
                onClear();
              }}
              size={ButtonSize.Medium}
              variety={ButtonVariety.DefaultGhost}
            />
          )}
          <ChevronDownIcon />
        </div>
      </InputValue>
    </StyledControl>
  );
}

const StyledControl = styled.div`
  color: ${cssVar('color-text-default')};
  background: ${cssVar('color-surface-default')};
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bolder')};
  width: var(--inputSize);

  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: ${cssVar('border-radius-400', '0.5rem')};
  box-sizing: border-box;
  padding-left: ${cssVar('dimension-space-150', '0.75rem')};
  padding-right: ${cssVar('dimension-space-150', '0.75rem')};
  font: ${cssVar('typography-text-default-regular')};
  height: ${cssVar('dimension-height-900', '2.25rem')};
  line-height: 1.5rem;
  cursor: pointer;

  &.is-discreet {
    border-style: none;
    padding-left: ${cssVar('dimension-space-50', '0.25rem')};
    padding-right: ${cssVar('dimension-space-50', '0.25rem')};
    height: auto;
    width: auto;

    background: inherit;
  }

  &:hover {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-focus-default')};

    &.is-discreet {
      border-style: none;
      color: ${cssVar('color-text-accent')};
    }
  }

  &:focus,
  &:focus-visible,
  &:focus-within {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-focus-default')};
    outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};

    &.is-discreet {
      border-radius: ${cssVar('border-radius-200', '0.25rem')};
      border-style: none;
      outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
    }
  }
`;

const InputValue = styled.span`
  height: 100%;
  width: 100%;
  color: ${cssVar('color-text-default')};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-placeholder {
    color: ${cssVar('color-text-placeholder')};
  }

  &.is-disabled {
    color: ${cssVar('color-text-disabled')};
  }
`;
