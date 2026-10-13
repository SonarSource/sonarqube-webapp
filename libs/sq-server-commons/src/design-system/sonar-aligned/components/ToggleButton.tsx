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
import { Badge } from '../../components/Badge';
import { getTabId, getTabPanelId } from '../helpers/tabs';
import { ButtonSecondary } from './buttons';

type ToggleButtonValueType = string | number | boolean;

export interface ToggleButtonsOption<T extends ToggleButtonValueType> {
  counter?: number;
  disabled?: boolean;
  label: string | React.ReactNode;
  value: T;
}

export interface ButtonToggleProps<T extends ToggleButtonValueType> {
  disabled?: boolean;
  label?: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<ToggleButtonsOption<T>>;
  role?: 'radiogroup' | 'tablist';
  value?: T;
}

/** @deprecated Use ToggleButtonGroup from Echoes instead
 *
 * Prop changes:
 *
 * - `disabled` becomes `isDisabled`
 * - `value` becomes `selected` and is mandatory
 * - `role` disappears: if you need a tablist, use Tabs (Echoes component coming in the future)
 * - `label` disappears, use `aria-label` directly
 *
 * Options cannot be disabled individually anymore
 *
 */
export function ToggleButton<T extends ToggleButtonValueType>(props: ButtonToggleProps<T>) {
  const { disabled = false, label, options, value, role = 'radiogroup' } = props;
  const isRadioGroup = role === 'radiogroup';

  return (
    <Wrapper aria-label={label} role={role}>
      {options.map((option) => (
        <OptionButton
          aria-checked={isRadioGroup ? option.value === value : undefined}
          aria-controls={isRadioGroup ? undefined : getTabPanelId(String(option.value))}
          aria-current={option.value === value}
          aria-selected={!isRadioGroup ? option.value === value : undefined}
          data-value={option.value}
          disabled={disabled || option.disabled}
          id={getTabId(String(option.value))}
          key={option.value.toString()}
          onClick={() => {
            if (option.value !== value) {
              props.onChange(option.value);
            }
          }}
          role={isRadioGroup ? 'radio' : 'tab'}
          selected={option.value === value}
        >
          {option.label}
          {option.counter ? (
            <Badge className="sw-ml-1" variant="counter">
              {option.counter}
            </Badge>
          ) : null}
        </OptionButton>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};

  display: inline-flex;
  height: ${cssVar('dimension-height-900', '2.25rem')};
  box-sizing: border-box;
  font-weight: ${cssVar('font-weight-semi-bold')};
  border-radius: ${cssVar('border-radius-400', '0.5rem')};
`;

const OptionButton = styled(ButtonSecondary)<{ selected: boolean }>`
  background: ${(props) =>
    cssVar(props.selected ? 'color-background-selected-weak-default' : 'color-surface-default')};
  border: none;
  color: ${cssVar('color-text-default')};
  font-weight: ${(props) =>
    props.selected ? cssVar('font-weight-semi-bold') : cssVar('font-weight-regular')};
  height: auto;

  border-radius: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:first-of-type {
    border-top-left-radius: ${cssVar('border-radius-400', '0.5rem')};
    border-bottom-left-radius: ${cssVar('border-radius-400', '0.5rem')};
  }

  &:last-of-type {
    border-top-right-radius: ${cssVar('border-radius-400', '0.5rem')};
    border-bottom-right-radius: ${cssVar('border-radius-400', '0.5rem')};
  }

  &:not(:last-of-type) {
    border-right: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
  }

  &:hover {
    background: ${(props) =>
      cssVar(props.selected ? 'color-background-selected-weak-hover' : 'color-surface-hover')};
    color: ${cssVar('color-text-default')};
  }

  &:focus-visible {
    outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
    outline-offset: ${cssVar('focus-border-offset-default')};
    z-index: 1;
  }
`;
