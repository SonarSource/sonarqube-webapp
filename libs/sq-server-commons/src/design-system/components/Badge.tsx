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

type BadgeVariant = 'default' | 'new' | 'deleted' | 'counter' | 'counterFailed';

/** @deprecated Use Badge or BadgeCounter from Echoes instead
 *
 * If it's meant to display a number/counter, use BadgeCounter. Otherwise, use Badge.
 *
 * /!\ If the badge triggers a Tooltip, you cannot migrate it as is. A tooltip needs an interactive element.
 * Either add a ToggleTip or wait for an integrated Echoes solution to be provided!
 */
export interface BadgeProps extends React.PropsWithChildren {
  className?: string;
  title?: string;
  variant?: BadgeVariant;
}

/** @deprecated Use Badge or BadgeCounter from Echoes instead
 *
 * If it's meant to display a number/counter, use BadgeCounter. Otherwise, use Badge.
 *
 * /!\ If the badge triggers a Tooltip, you cannot migrate it as is. A tooltip needs an interactive element.
 * Either add a ToggleTip or wait for an integrated Echoes solution to be provided!
 */
export function Badge({ className, children, title, variant = 'default' }: BadgeProps) {
  const commonProps = {
    'aria-label': title,
    className,
    role: title ? 'img' : 'presentation',
    title,
    variant,
  };

  const Component = ['counter', 'counterFailed'].includes(variant) ? StyledCounter : StyledBadge;

  return <Component {...commonProps}>{children}</Component>;
}

const StyledBadge = styled.span<{
  variant: BadgeVariant;
}>`
  font-size: 0.75rem;
  line-height: 0.938rem;
  font-weight: ${cssVar('font-weight-semi-bold')};
  display: inline-block;
  white-space: nowrap;
  padding-left: ${cssVar('dimension-space-25', '0.125rem')};
  padding-right: ${cssVar('dimension-space-25', '0.125rem')};
  padding-top: 0.03125rem;
  padding-bottom: 0.03125rem;
  border-radius: ${cssVar('border-radius-100', '0.125rem')};

  ${getBadgeVariantStyles}

  text-transform: uppercase;

  &:empty {
    display: none;
  }
`;

const StyledCounter = styled.span<{
  variant: BadgeVariant;
}>`
  min-height: ${cssVar('dimension-height-500', '1.25rem')};
  min-width: ${cssVar('dimension-width-250', '1.25rem')};
  font-size: 0.75rem;
  font-weight: ${cssVar('font-weight-regular')};
  box-sizing: border-box;
  padding-left: 5px;
  padding-right: 5px;
  display: inline-flex;
  line-height: 1.125rem;
  align-items: center;
  justify-content: center;
  border-radius: ${cssVar('border-radius-full', '625rem')};

  ${getBadgeVariantStyles}

  &:empty {
    display: none;
  }
`;

function getBadgeVariantStyles({ variant }: { variant: BadgeVariant }) {
  switch (variant) {
    case 'default':
      return `
        background-color: ${cssVar('color-background-neutral-subtle-default')};
        color: ${cssVar('color-text-default')};`;
    case 'new':
      return `
        background-color: ${cssVar('color-background-accent-weak-default')};
        color: ${cssVar('color-text-accent')};`;
    case 'deleted':
      return `
        background-color: ${cssVar('color-background-danger-weak-active')};
        color: ${cssVar('color-text-danger')};`;
    case 'counter':
      return `
        background-color: ${cssVar('color-background-neutral-subtle-default')};
        color: ${cssVar('color-text-default')};
        border: ${cssVar('border-width-default')} solid ${cssVar('color-border-none')};`;
    case 'counterFailed':
      return `
        background-color: ${cssVar('color-background-danger-weak-default')};
        color: ${cssVar('color-text-danger')};
        border: ${cssVar('border-width-default')} solid ${cssVar('color-border-danger-weak')};`;
  }
}
