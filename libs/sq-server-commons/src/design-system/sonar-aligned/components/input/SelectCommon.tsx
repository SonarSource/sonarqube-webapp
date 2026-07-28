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

import { ButtonIcon, ButtonSize, ButtonVariety, cssVar, IconX } from '@sonarsource/echoes-react';
import { RefObject, type JSX } from 'react';
import { useIntl } from 'react-intl';
import {
  ClearIndicatorProps,
  components,
  GroupBase,
  Props as NamedProps,
  OptionProps,
  StylesConfig,
} from 'react-select';
import type Select from 'react-select/base';
import SearchHighlighter from '~shared/components/SearchHighlighter';
import { ChevronDownIcon } from '../../../components/icons';
import { INPUT_SIZES } from '../../../helpers';
import { InputSizeKeys } from '../../../types/theme';

export interface ExtensionProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> {
  clearLabel?: string;
  selectRef?: RefObject<Select<Option, IsMulti, Group> | null>;
  shouldSortOption?: boolean;
  size?: InputSizeKeys;
}

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = NamedProps<Option, IsMulti, Group> & ExtensionProps<Option, IsMulti, Group>;

export function IconOption<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: OptionProps<Option, IsMulti, Group>) {
  const { label, isSelected } = props;
  const { Icon } = props.data as { Icon: JSX.Element };

  // For tests and a11y
  props.innerProps.role = 'option';
  props.innerProps['aria-selected'] = isSelected;

  return (
    <components.Option {...props}>
      <div className="sw-flex sw-items-center sw-gap-1">
        {Icon}
        <SearchHighlighter>{label}</SearchHighlighter>
      </div>
    </components.Option>
  );
}

export function SingleValue<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: OptionProps<Option, IsMulti, Group>) {
  const label = props.selectProps.getOptionLabel(props.data);
  const { Icon } = props.data as { Icon: JSX.Element };

  return (
    <components.SingleValue {...props}>
      <div className="sw-flex sw-items-center sw-gap-1">
        {Icon}
        {label}
      </div>
    </components.SingleValue>
  );
}

export function ClearIndicator<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: ClearIndicatorProps<Option, IsMulti, Group> & {
    selectProps: SelectProps<Option, IsMulti, Group>;
  },
) {
  const intl = useIntl();
  const {
    selectProps: { clearLabel },
  } = props;

  return (
    <components.ClearIndicator {...props}>
      <ButtonIcon
        Icon={IconX}
        ariaLabel={clearLabel ?? intl.formatMessage({ id: 'clear' })}
        onClick={props.clearValue}
        size={ButtonSize.Medium}
        variety={ButtonVariety.DefaultGhost}
      />
    </components.ClearIndicator>
  );
}

export function DropdownIndicator<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: OptionProps<Option, IsMulti, Group>) {
  return (
    <components.DropdownIndicator {...props}>
      <div className="sw-pr-2 sw-flex">
        <ChevronDownIcon />
      </div>
    </components.DropdownIndicator>
  );
}

export function selectStyle<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({ size }: { size: InputSizeKeys }): StylesConfig<Option, IsMulti, Group> {
  return {
    control: (base, { isFocused, menuIsOpen, isDisabled }) => ({
      ...base,
      color: cssVar('color-text-default'),
      cursor: 'pointer',
      background: cssVar('form-control-colors-background-default'),
      transition: 'border 0.2s ease, outline 0.2s ease',
      outline:
        isFocused && !menuIsOpen
          ? `${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')}`
          : 'none',
      borderRadius: '4px',
      ...(isDisabled && {
        color: cssVar('color-text-disabled'),
        background: cssVar('color-surface-disabled'),
        border: `${cssVar('border-width-default')} solid ${cssVar('color-border-disabled')}`,
        outline: 'none',
      }),
      ...(isFocused && {
        border: `${cssVar('border-width-default')} solid ${cssVar(
          'form-control-colors-border-default',
        )}`,
      }),
    }),
    menu: (base) => ({
      ...base,
      width: INPUT_SIZES[size],
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      borderLeft: '2px solid transparent',
      ...((isSelected || isFocused) && {
        background: getOptionBackground(isFocused, isSelected),
        color: cssVar('color-text-default'),
        borderLeftColor: cssVar('color-focus-default'),
      }),
    }),
    singleValue: (base) => ({
      ...base,
      color: cssVar('color-text-default'),
    }),
    placeholder: (base) => ({
      ...base,
      color: cssVar('color-text-placeholder'),
    }),
  };
}

function getOptionBackground(isFocused: boolean, isSelected: boolean) {
  if (isSelected) {
    return cssVar(
      isFocused ? 'color-background-selected-weak-hover' : 'color-background-selected-weak-default',
    );
  }

  return cssVar('color-surface-hover');
}

export interface LabelValueSelectOption<V = string> {
  Icon?: React.ReactNode;
  label: string;
  value: V;
}
