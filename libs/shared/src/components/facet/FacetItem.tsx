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
import { Button, ButtonSize, ButtonVariety, cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import tw from 'twin.macro';

export type FacetItemProps = {
  active?: boolean;
  className?: string;
  /** Disable the item if its value is 0. True by default. */
  disableZero?: boolean;
  disabled?: boolean;
  hideStat?: boolean;
  icon?: React.ReactNode;
  name: string | React.ReactNode;
  onClick: (x: string, multiple?: boolean) => void;
  small?: boolean;
  stat?: React.ReactNode;
  value: string;
};

/**
 * This version of FacetItem is taken from SQS design-system.
 * It is mostly a drop-in replacement, but support for the StatBar was removed.
 */
export function BaseFacetItem({
  active = false,
  className,
  disabled: disabledProp = false,
  disableZero = true,
  hideStat = false,
  icon,
  name,
  onClick,
  small,
  stat,
  value,
}: Readonly<FacetItemProps>) {
  // allow an active facet to be disabled even if it now has a "0" stat
  // (it was activated when a different value of My issues/All/New code was selected)
  const disabled = disabledProp || (disableZero && !active && stat !== undefined && stat === 0);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    onClick(value, event.ctrlKey || event.metaKey);
  };

  return (
    <StyledItem active={active} className={classNames({ active }, className)}>
      <StyledButton
        active={active}
        aria-checked={active}
        aria-label={typeof name === 'string' ? name : undefined}
        data-facet={value}
        isDisabled={disabled}
        onClick={handleClick}
        prefix={icon}
        role="checkbox"
        size={ButtonSize.Medium}
        small={small}
        variety={ButtonVariety.DefaultGhost}
      >
        <div className="container">
          <span className="name">{name}</span>
          <div>{!hideStat && <span className="stat">{stat}</span>}</div>
        </div>
      </StyledButton>
    </StyledItem>
  );
}

BaseFacetItem.displayName = 'FacetItem'; // so that tests don't see the obfuscated production name

export const FacetItem = styled(BaseFacetItem)``;

const StyledButton = styled(Button)<{
  active?: boolean;
  small?: boolean;
}>`
  ${tw`sw-typo-default`};
  ${tw`sw-box-border`};
  ${tw`sw-h-[28px]`};
  ${tw`sw-px-1`};
  ${tw`sw-rounded-1`};
  ${tw`sw-w-full`};

  ${({ small }) => (small ? tw`sw-typo-sm sw-pr-0` : '')};

  background-color: ${({ active }) =>
    active ? cssVar('color-background-accent-weak-default') : 'transparent'} !important;

  & div.container {
    ${tw`sw-container`};
    ${tw`sw-flex`};
    ${tw`sw-items-center`};
    ${tw`sw-justify-between`};

    & span.name {
      ${tw`sw-pr-1`};
      ${tw`sw-truncate`};

      & mark {
        background-color: var(--echoes-color-tangerine-50);
        color: var(--echoes-color-grey-500);
        font-weight: 400;
      }
    }

    & span.stat {
      color: ${cssVar('color-text-subtle')};
    }
  }

  &:disabled {
    background-color: transparent;
    border-color: transparent;

    & span.container span.stat {
      color: ${cssVar('color-text-disabled')};
    }

    &:hover {
      background-color: transparent;
      border-color: transparent;
    }
  }
`;

const StyledItem = styled.li<{ active: boolean }>`
  border-color: ${({ active }) => (active ? cssVar('color-text-accent') : 'transparent')};
  border-radius: 0.25rem;
  border-width: 1px;
  border-style: solid;

  &:hover,
  &:active,
  &:focus {
    border-color: ${cssVar('color-text-accent')} !important;
  }
`;
