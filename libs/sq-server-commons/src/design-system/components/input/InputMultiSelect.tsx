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
import { Text, cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ButtonProps } from '../../sonar-aligned/components/buttons';
import { Badge } from '../Badge';
import { WrapperButton } from '../buttons';
import { ChevronDownIcon } from '../icons';

interface Props extends Pick<ButtonProps, 'onClick'> {
  className?: string;
  count?: number;
  id?: string;
  placeholder: string;
  selectedLabel: string;
}

export function InputMultiSelect(props: Props) {
  const { className, count, id, placeholder, selectedLabel } = props;

  return (
    <StyledWrapper
      className={classNames('sw-flex sw-justify-between sw-px-2 sw-typo-default', className)}
      id={id}
      onClick={props.onClick}
      role="combobox"
    >
      {count ? selectedLabel : <Text isSubtle>{placeholder}</Text>}

      <div>
        {count !== undefined && count > 0 && <Badge variant="counter">{count}</Badge>}
        <ChevronDownIcon className="sw-ml-2" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(WrapperButton)`
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bolder')};

  &:hover {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-focus-default')};
  }

  &:active,
  &:focus,
  &:focus-within,
  &:focus-visible {
    border: ${cssVar('border-width-default')} solid ${cssVar('color-focus-default')};
    outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
  }
`;
