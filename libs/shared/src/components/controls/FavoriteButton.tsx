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
import {
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  cssVar,
  IconStar,
  TooltipSide,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

export interface Props {
  className?: string;
  componentName?: string;
  favorite: boolean;
  qualifier: string;
  side?: TooltipSide;
  size?: ButtonSize;
  toggleFavorite: VoidFunction;
  variety?: ButtonVariety;
}

export default function FavoriteButton(props: Readonly<Props>) {
  const intl = useIntl();
  const {
    className,
    componentName,
    favorite,
    qualifier,
    side,
    size = ButtonSize.Medium,
    toggleFavorite,
    variety = ButtonVariety.PrimaryGhost,
  } = props;

  const actionName = favorite ? 'remove' : 'add';
  const label = componentName
    ? intl.formatMessage(
        { id: `favorite.action.${qualifier}.${actionName}_x` },
        { component: componentName },
      )
    : intl.formatMessage({ id: `favorite.action.${qualifier}.${actionName}` });

  return (
    <StyledButtonIcon
      Icon={IconStar}
      ariaLabel={label}
      className={classNames('it__favorite-link', className, { 'it__is-filled': favorite })}
      data-is-favorite={favorite}
      isIconFilled={favorite}
      onClick={toggleFavorite}
      size={size}
      tooltipContent={label}
      tooltipOptions={{ side }}
      variety={variety}
    />
  );
}

const StyledButtonIcon = styled(ButtonIcon)<{ isIconFilled: boolean }>`
  &[data-is-favorite='true'] {
    color: ${cssVar('color-background-favourite-default')};

    &:hover {
      color: ${cssVar('color-background-favourite-hover')};
    }
  }
`;
