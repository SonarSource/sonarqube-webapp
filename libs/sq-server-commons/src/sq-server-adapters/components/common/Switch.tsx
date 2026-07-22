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
import { cssVar } from '@sonarsource/echoes-react';
import { ForwardedRef, forwardRef } from 'react';
import tw from 'twin.macro';
import { CheckIcon } from '../../../design-system';

interface Props {
  ariaDescribedby?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange?: (value: boolean) => void;
  value: boolean | string;
}

const getValue = (value: boolean | string) => {
  return typeof value === 'string' ? value === 'true' : value;
};

function SwitchWithRef(props: Readonly<Props>, ref: ForwardedRef<HTMLButtonElement>) {
  const {
    ariaDescribedby,
    ariaLabel,
    ariaLabelledBy,
    disabled,
    name,
    value: propsValue,
    onChange,
    id,
  } = props;
  const value = getValue(propsValue);

  const handleClick = () => {
    if (!disabled && onChange) {
      const value = getValue(propsValue);
      onChange(!value);
    }
  };

  return (
    <StyledSwitch
      active={value}
      aria-checked={value}
      aria-describedby={ariaDescribedby}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      id={id}
      name={name}
      onClick={handleClick}
      ref={ref}
      role="switch"
      type="button"
    >
      <CheckIconContainer active={value} disabled={disabled}>
        {value && <CheckIcon fill="currentColor" />}
      </CheckIconContainer>
    </StyledSwitch>
  );
}

interface StyledProps {
  active: boolean;
  disabled?: boolean;
}

const CheckIconContainer = styled.div<StyledProps>`
  ${tw`sw-rounded-pill`}
  ${tw`sw-flex sw-items-center sw-justify-center`}
  ${tw`sw-w-200 sw-h-400`}
  color: ${({ disabled }) =>
    disabled ? cssVar('color-icon-disabled') : cssVar('color-icon-accent')};
  background: ${cssVar('color-surface-default')};
  border: none;
  box-shadow: ${cssVar('box-shadow-xsmall')};
  transform: ${({ active }) => (active ? 'translateX(1rem)' : 'translateX(0)')};
  cursor: inherit;
  transition: transform 0.3s ease;
`;

const StyledSwitch = styled.button<StyledProps>`
  ${tw`sw-flex sw-flex-row`}
  ${tw`sw-rounded-pill`}
  ${tw`sw-p-1/2`}
  ${tw`sw-cursor-pointer`}
  width: 2.25rem;
  height: 1.25rem;
  background: ${({ active }) =>
    active ? cssVar('color-background-accent-default') : cssVar('color-border-bold')};
  border: none;
  outline: none;
  transition: 0.3s ease;
  transition-property: background, box-shadow;

  &:hover:not(:disabled) {
    background: ${({ active }) =>
      active ? cssVar('color-background-accent-hover') : cssVar('color-icon-disabled')};
  }

  &:disabled {
    background: ${cssVar('color-surface-disabled')};
  }

  &:focus:not(:disabled),
  &:active:not(:disabled) {
    background: ${({ active }) =>
      active ? cssVar('color-background-accent-default') : cssVar('color-border-bold')};
  }

  &:focus-visible:not(:disabled) {
    background: ${({ active }) =>
      active ? cssVar('color-background-accent-default') : cssVar('color-border-bold')};
    outline: ${cssVar('focus-border-width-default')} solid transparent;
    outline-offset: ${cssVar('focus-border-offset-default')};
    box-shadow:
      0 0 0 ${cssVar('focus-border-offset-default')} ${cssVar('color-surface-default')},
      0 0 0 calc(${cssVar('focus-border-offset-default')} + ${cssVar('focus-border-width-default')})
        ${cssVar('color-focus-default')};
  }
`;

export const Switch = forwardRef(SwitchWithRef);
