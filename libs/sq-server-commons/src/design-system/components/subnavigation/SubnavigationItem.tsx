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

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ReactNode, SyntheticEvent, useCallback } from 'react';
import NavLink, { NavLinkProps } from '../NavLink';
import { selectableItemState } from '../SelectableItemStateStyles';

interface Props {
  active?: boolean;
  ariaCurrent?: boolean;
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  innerRef?: (node: HTMLAnchorElement) => void;
  onClick: (value?: string) => void;
  value?: string;
}

export function SubnavigationItem(props: Readonly<Props>) {
  const {
    active,
    ariaCurrent,
    ariaLabel,
    className,
    children,
    disabled,
    id,
    innerRef,
    onClick,
    value,
  } = props;
  const handleClick = useCallback(
    (e: SyntheticEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
      onClick(value);
    },
    [disabled, onClick, value],
  );
  return (
    <StyledSubnavigationItem
      aria-current={ariaCurrent}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      className={classNames({ active, disabled }, className)}
      data-testid="js-subnavigation-item"
      href="#"
      id={id}
      onClick={handleClick}
      ref={innerRef}
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </StyledSubnavigationItem>
  );
}

export function SubnavigationLinkItem(props: Readonly<NavLinkProps>) {
  const { children, className, disabled, tabIndex, ...linkProps } = props;

  return (
    <SubnavigationLinkItemStyled
      aria-disabled={disabled || undefined}
      className={classNames({ disabled }, className)}
      disabled={disabled}
      tabIndex={disabled ? -1 : tabIndex}
      {...linkProps}
    >
      {children}
    </SubnavigationLinkItemStyled>
  );
}

const ItemBaseStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  font: ${cssVar('typography-text-default-regular')};
  padding-top: ${cssVar('dimension-space-200', '1rem')};
  padding-bottom: ${cssVar('dimension-space-200', '1rem')};
  padding-right: ${cssVar('dimension-space-200', '1rem')};
  width: 100%;
  cursor: pointer;

  padding-left: calc(${'1rem'} - 3px);
  color: ${selectableItemState.text};
  background-color: ${selectableItemState.defaultBackground};
  border-bottom: none;
  border-left: ${selectableItemState.inactiveBorder};
  transition: 0.2 ease;
  transition-property: border-left, background-color, color;

  &:hover,
  &:focus {
    background-color: ${selectableItemState.hoverBackground};
  }

  &.active {
    background-color: ${selectableItemState.selectedBackground};
    border-left: ${selectableItemState.selectedBorder};
  }

  &.active:hover,
  &.active:focus {
    background-color: ${selectableItemState.selectedHoverBackground};
  }

  &.disabled,
  &[aria-disabled='true'] {
    cursor: not-allowed;

    color: ${selectableItemState.disabledText};
    background-color: ${selectableItemState.disabledBackground};
    border-left: ${selectableItemState.inactiveBorder};
  }
`;

const StyledSubnavigationItem = styled.a`
  ${ItemBaseStyle};
`;

const SubnavigationLinkItemStyled = styled(NavLink)`
  ${ItemBaseStyle};
  text-decoration-line: none;
`;
