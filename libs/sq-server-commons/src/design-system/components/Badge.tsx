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
import tw from 'twin.macro';

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
  ${tw`sw-text-[0.75rem]`};
  ${tw`sw-leading-[0.938rem]`};
  ${tw`sw-font-semibold`};
  ${tw`sw-inline-block`};
  ${tw`sw-whitespace-nowrap`};
  ${tw`sw-px-[0.125rem] sw-py-[0.03125rem]`};
  ${tw`sw-rounded-1/2`};

  ${getBadgeVariantStyles}

  text-transform: uppercase;

  &:empty {
    ${tw`sw-hidden`}
  }
`;

const StyledCounter = styled.span<{
  variant: BadgeVariant;
}>`
  ${tw`sw-min-w-250 sw-min-h-500`};
  ${tw`sw-text-[0.75rem]`};
  ${tw`sw-font-regular`};
  ${tw`sw-box-border sw-px-[5px]`};
  ${tw`sw-inline-flex`};
  ${tw`sw-leading-[1.125rem]`};
  ${tw`sw-items-center sw-justify-center`};
  ${tw`sw-rounded-pill`};

  ${getBadgeVariantStyles}

  &:empty {
    ${tw`sw-hidden`}
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
