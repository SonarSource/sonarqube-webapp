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
  SelectAsync,
  type SelectAsyncProps,
  SelectHighlight,
  SelectOption,
} from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import * as React from 'react';
import { RefObject, useEffect, useRef } from 'react';
import Avatar from '~adapters/components/ui/Avatar';
import { isDefined } from '../../helpers/types';

export interface AssigneeSelectOption extends SelectOption {
  Icon?: React.JSX.Element;
}

interface Props extends Omit<SelectAsyncProps, 'onChange' | 'data' | 'value'> {
  ariaLabel: string;
  data: AssigneeSelectOption[];
  onChange: (option: AssigneeSelectOption) => void;
  onToggleDropdown?: (isOpen: boolean) => void;
  ref?: RefObject<HTMLInputElement | null>;
  value?: string | null;
}

export function AssigneeSelect({
  ariaLabel,
  className,
  data,
  isDisabled,
  isLoading,
  labelNotFound,
  onChange,
  onOpen,
  onSearch,
  onToggleDropdown,
  placeholder,
  value,
  valueIcon,
  width = 'small',
  ref,
}: Readonly<Props>) {
  const internalRef = useRef<HTMLInputElement>(null);
  const selectRef = ref || internalRef;

  useEffect(() => {
    const inputElement = selectRef?.current;
    if (!inputElement) {
      return noop;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        inputElement.blur();
      }
    };

    const handleBlur = () => {
      onToggleDropdown?.(false);
    };

    inputElement.addEventListener('keydown', handleKeyDown);
    inputElement.addEventListener('blur', handleBlur);
    return () => {
      inputElement.removeEventListener('keydown', handleKeyDown);
      inputElement.removeEventListener('blur', handleBlur);
    };
  }, [selectRef, onToggleDropdown]);

  return (
    <SelectAsync
      ariaLabel={ariaLabel}
      className={className}
      data={data}
      hasDropdownAutoWidth
      highlight={SelectHighlight.Ghost}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isNotClearable
      labelNotFound={labelNotFound}
      onChange={(_, option) => {
        onChange(option);
      }}
      onOpen={() => {
        onOpen?.();
        onToggleDropdown?.(true);
      }}
      onSearch={onSearch}
      optionComponent={AssigneeOption}
      placeholder={placeholder}
      ref={selectRef}
      value={value}
      valueIcon={valueIcon}
      width={width}
    />
  );
}

function AssigneeOption(props: Readonly<AssigneeSelectOption>) {
  const { Icon, label } = props;

  return (
    <div className="sw-flex sw-flex-nowrap sw-items-center sw-overflow-hidden">
      {isDefined(Icon) && <span className="sw-mr-2">{Icon}</span>}
      <span className="sw-whitespace-nowrap sw-text-ellipsis">{label}</span>
    </div>
  );
}

export function userToOption(user: {
  avatar?: string;
  login: string;
  name?: string;
}): AssigneeSelectOption {
  return {
    Icon: <Avatar className="sw-my-1" hash={user.avatar} name={user.name} size="xs" />,
    label: user.name ?? user.login,
    value: user.login,
  };
}
