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

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type * as Echoes from '@sonarsource/echoes-react';
import { cssVar } from '@sonarsource/echoes-react';
import { forwardRef } from 'react';
import tw from 'twin.macro';
import { INPUT_SIZES } from '../../helpers/constants';
import { themeBorder, themeColor, themeContrast } from '../../helpers/theme';
import { InputSizeKeys, ThemedProps } from '../../types/theme';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  as?: React.ElementType;
  className?: string;
  isInvalid?: boolean;
  isValid?: boolean;
  size?: InputSizeKeys;
}

interface InputTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  isInvalid?: boolean;
  isValid?: boolean;
  size?: InputSizeKeys;
}

/**
 * @deprecated Use {@link Echoes.TextInput | TextInput} from Echoes instead.
 *
 * Props changed:
 * - `isInvalid` and `isValid` are now represented by the `validation` prop and you can also pass a
 * `messageInvalid` and `messageValid` props to display a message below the input.
 * - `size` prop is now `width` and can be `small`, `medium`, `large` or `full`.
 *
 * See the {@link https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/3863216139/TextInput+and+TextArea | Migration Guide} for more information.
 */
export const InputField = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'medium', style, ...props }, ref) => {
    return (
      <StyledInput ref={ref} style={{ ...style, '--inputSize': INPUT_SIZES[size] }} {...props} />
    );
  },
);
InputField.displayName = 'InputField';

/**
 * @deprecated Use {@link Echoes.TextArea | TextArea} from Echoes instead.
 *
 * Props changed:
 * - `isInvalid` and `isValid` are now represented by the `validation` prop and you can also pass a
 * `messageInvalid` and `messageValid` props to display a message below the input.
 * - `size` prop is now `width` and can be `small`, `medium`, `large` or `full`.
 *
 * See the {@link https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/3863216139/TextInput+and+TextArea | Migration Guide} for more information.
 */
export const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(
  ({ size = 'medium', style, ...props }, ref) => {
    return (
      <StyledTextArea ref={ref} style={{ ...style, '--inputSize': INPUT_SIZES[size] }} {...props} />
    );
  },
);
InputTextArea.displayName = 'InputTextArea';

const defaultStyle = (props: ThemedProps) => css`
  --border: ${themeBorder('default', 'inputBorder')(props)};
  --focusBorder: ${themeBorder('default', 'inputFocus')(props)};
  --focusOutline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
`;

const dangerStyle = (props: ThemedProps) => css`
  --border: ${themeBorder('default', 'inputDanger')(props)};
  --focusBorder: ${themeBorder('default', 'inputDangerFocus')(props)};
  --focusOutline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
`;

const successStyle = (props: ThemedProps) => css`
  --border: ${themeBorder('default', 'inputSuccess')(props)};
  --focusBorder: ${themeBorder('default', 'inputSuccessFocus')(props)};
  --focusOutline: ${themeBorder('focus', 'inputSuccessFocus')(props)};
`;

const getInputVariant = (props: ThemedProps & { isInvalid?: boolean; isValid?: boolean }) => {
  const { isValid, isInvalid } = props;
  if (isInvalid) {
    return dangerStyle;
  } else if (isValid) {
    return successStyle;
  }
  return defaultStyle;
};

const baseStyle = (props: ThemedProps) => css`
  color: ${themeContrast('inputBackground')(props)};
  background: ${themeColor('inputBackground')(props)};
  border: var(--border);
  width: var(--inputSize);
  transition: border-color 0.2s ease;

  ${tw`sw-typo-default`}
  ${tw`sw-box-border`}
  ${tw`sw-rounded-2`}
  ${tw`sw-px-3 sw-py-2`}

  &::placeholder {
    color: ${cssVar('color-text-placeholder')};
  }

  &:hover {
    border: var(--focusBorder);
  }

  &:active,
  &:focus,
  &:focus-within,
  &:focus-visible {
    border: var(--focusBorder);
    outline: var(--focusOutline);
    outline-offset: ${cssVar('focus-border-offset-default')};
  }

  &:disabled,
  &:disabled:hover {
    color: ${cssVar('color-text-disabled')};
    background-color: ${themeColor('inputDisabled')(props)};
    border: ${themeBorder('default', 'inputDisabledBorder')(props)};
    outline: none;

    ${tw`sw-cursor-not-allowed`};
    &::placeholder {
      color: ${cssVar('color-text-disabled')};
    }
  }
`;

const StyledInput = styled.input`
  ${getInputVariant}
  ${baseStyle}
  ${tw`sw-h-control`}
`;

const StyledTextArea = styled.textarea`
  ${getInputVariant};
  ${baseStyle};
`;
