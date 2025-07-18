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

import styled from '@emotion/styled';
import { IconSearch, cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { debounce } from 'lodash';
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import tw, { theme } from 'twin.macro';
import { Key } from '~shared/helpers/keyboard';
import { isDefined } from '~shared/helpers/types';
import { DEBOUNCE_DELAY, INPUT_SIZES } from '../../helpers/constants';
import { themeBorder, themeColor, themeContrast } from '../../helpers/theme';
import { InputSizeKeys } from '../../types/theme';
import { CloseIcon } from '../icons/CloseIcon';
import { InteractiveIcon } from '../InteractiveIcon';
import { Spinner } from '../Spinner';

interface Props {
  autoFocus?: boolean;
  className?: string;
  id?: string;
  innerRef?: React.RefCallback<HTMLInputElement>;
  inputId?: string;
  loading?: boolean;
  maxLength?: number;
  minLength?: number;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange: (value: string) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onMouseDown?: React.MouseEventHandler<HTMLInputElement>;
  placeholder?: string;
  searchInputAriaLabel?: string;
  size?: InputSizeKeys;
  value?: string;
}

const DEFAULT_MAX_LENGTH = 100;

/**
 * @deprecated Use SearchInput from Echoes instead.
 * The props have changed significantly:
 * - `onChange` is no longer debounced - implement debouncing in the parent component if needed
 * - `value` is now required (component must be controlled)
 * - `placeholder` is now `placeholderLabel`
 * - `searchInputAriaLabel` is now `ariaLabel`
 * - `autoFocus` is now `hasAutoFocus`
 * - `loading` is now `isLoading`
 * - `size` has been removed, use `width` (`SearchInputWidth.Fixed` or `SearchInputWidth.Full`)
 * - `maxLength` is still supported
 * - `minLength` is still supported with enhanced `minLengthLabel` customization
 * - `className` is still supported
 * - `inputId` is now `id`
 * - `innerRef` is replaced by standard React `ref` forwarding
 * - `onBlur`, `onFocus`, `onKeyDown`, `onMouseDown` event handlers are still supported
 *
 * New props: `ariaDescribedBy`, `hasPreventScroll`, `isDisabled`
 *
 * Key behavioral changes:
 * - The component is now fully controlled and requires both `value` and `onChange` to be provided
 * - **Debouncing must be handled by the parent component**
 * - Minimum length validation message display is improved
 */
export function InputSearch(props: PropsWithChildren<Props>) {
  const {
    autoFocus,
    id,
    className,
    innerRef,
    inputId,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    onMouseDown,
    placeholder,
    loading,
    minLength,
    maxLength = DEFAULT_MAX_LENGTH,
    size = 'small',
    value: parentValue,
    searchInputAriaLabel,
  } = props;
  const intl = useIntl();
  const input = useRef<null | HTMLElement>(null);
  const [value, setValue] = useState(parentValue ?? '');
  const debouncedOnChange = useMemo(
    () =>
      debounce((val: string) => {
        onChange(val);
      }, DEBOUNCE_DELAY),
    [onChange],
  );

  const tooShort = isDefined(minLength) && value.length > 0 && value.length < minLength;
  const inputClassName = classNames('js-input-search', {
    touched: value.length > 0 && (!minLength || minLength > value.length),
    'sw-pr-10': value.length > 0,
  });

  const inputNoteLeftPad = Math.min(minLength || 1, 10);
  const inputNoteClassName = `sw-ml-${inputNoteLeftPad}`;

  useEffect(() => {
    // initially letting parentValue control the value of the input
    // later the value is controlled by the local value state
    if (parentValue === '' || (parentValue !== undefined && value === '')) {
      setValue(parentValue);
    }
  }, [parentValue]); // eslint-disable-line

  useEffect(() => {
    if (autoFocus && input.current) {
      input.current.focus();
    }
  }, [autoFocus]);

  const changeValue = (newValue: string) => {
    if (newValue.length === 0 || !minLength || minLength <= newValue.length) {
      debouncedOnChange(newValue);
    }
  };

  const handleInputChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const eventValue = event.currentTarget.value;
    setValue(eventValue);
    changeValue(eventValue);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Escape) {
      event.preventDefault();
      handleClearClick();
    }
    onKeyDown?.(event);
  };

  const handleClearClick = () => {
    onChange('');
    setValue('');
    input.current?.focus();
  };
  const ref = (node: HTMLInputElement | null) => {
    input.current = node;
    innerRef?.(node);
  };

  return (
    <InputSearchWrapper
      className={className}
      id={id}
      onMouseDown={onMouseDown}
      style={{ '--inputSize': INPUT_SIZES[size] }}
      title={
        tooShort && isDefined(minLength)
          ? intl.formatMessage({ id: 'select2.tooShort' }, { 0: minLength })
          : ''
      }
    >
      <StyledInputWrapper className="sw-flex sw-items-center">
        <input
          aria-label={searchInputAriaLabel ?? placeholder}
          autoComplete="off"
          className={inputClassName}
          id={inputId}
          maxLength={maxLength}
          onBlur={onBlur}
          onChange={handleInputChange}
          onFocus={onFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          ref={ref}
          role="searchbox"
          type="search"
          value={value}
        />
        <StyledSearchIconWrapper>
          <Spinner className="sw-z-normal" loading={loading ?? false}>
            <StyledSearchIcon />
          </Spinner>
        </StyledSearchIconWrapper>
        {value && (
          <StyledInteractiveIcon
            Icon={CloseIcon}
            aria-label={intl.formatMessage({ id: 'clear' })}
            className="it__search-box-clear"
            onClick={handleClearClick}
            size="small"
          />
        )}

        {tooShort && isDefined(minLength) && (
          <StyledNote className={inputNoteClassName} role="note">
            {intl.formatMessage({ id: 'select2.tooShort' }, { 0: minLength })}
          </StyledNote>
        )}
      </StyledInputWrapper>
    </InputSearchWrapper>
  );
}

InputSearch.displayName = 'InputSearch'; // so that tests don't see the obfuscated production name

export const InputSearchWrapper = styled.div`
  isolation: isolate;

  width: var(--inputSize);

  ${tw`sw-relative sw-inline-block`}
  ${tw`sw-whitespace-nowrap`}
  ${tw`sw-align-middle`}
  ${tw`sw-h-control`}
`;

export const StyledInputWrapper = styled.div`
  input {
    background: ${themeColor('inputBackground')};
    color: ${themeContrast('inputBackground')};
    border: ${themeBorder('default', 'inputBorder')};

    ${tw`sw-rounded-2`}
    ${tw`sw-box-border`}
    ${tw`sw-pl-10`}
    ${tw`sw-typo-default`}
    ${tw`sw-w-full sw-h-control`}

    &::placeholder {
      color: ${cssVar('color-text-placeholder')};

      ${tw`sw-truncate`}
    }

    &:hover {
      border: ${themeBorder('default', 'inputFocus')};
    }

    &:focus,
    &:active {
      border: ${themeBorder('default', 'inputFocus')};
      outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
      outline-offset: ${cssVar('focus-border-offset-default')};
    }

    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      ${tw`sw-hidden sw-appearance-none`}
    }
  }
`;

export const StyledSearchIcon = styled(IconSearch)`
  color: ${cssVar('form-control-colors-icon-default')};
`;

export const StyledSearchIconWrapper = styled.div`
  ${tw`sw-left-3`}
  ${tw`sw-absolute`}
  ${tw`sw-z-normal`}
`;

export const StyledInteractiveIcon = styled(InteractiveIcon)`
  ${tw`sw-absolute`}
  ${tw`sw-right-2`}

  &:focus,
  &:active {
    outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
  }
`;

export const StyledNote = styled.span`
  color: ${cssVar('color-text-placeholder')};
  top: calc(1px + ${theme('inset.2')});

  ${tw`sw-absolute`}
  ${tw`sw-left-12 sw-right-10`}
  ${tw`sw-typo-default`}
  ${tw`sw-text-right`}
  ${tw`sw-truncate`}
  ${tw`sw-pointer-events-none`}
`;
