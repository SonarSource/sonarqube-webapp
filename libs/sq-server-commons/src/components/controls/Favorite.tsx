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

import { ButtonSize, ButtonVariety, TooltipSide } from '@sonarsource/echoes-react';
import * as React from 'react';
import FavoriteButton from '~shared/components/controls/FavoriteButton';
import { useToggleFavoriteMutation } from '../../queries/favorites';

interface Props {
  className?: string;
  component: string;
  componentName?: string;
  favorite: boolean;
  handleFavorite?: (component: string, isFavorite: boolean) => void;
  qualifier: string;
  side?: TooltipSide;
  size?: ButtonSize;
  variety?: ButtonVariety;
}

export default function Favorite(props: Readonly<Props>) {
  const { favorite: favoriteP, component, handleFavorite, ...buttonProps } = props;
  // local state of favorite is only needed in case of portfolios, as they are not migrated to query yet
  const [favorite, setFavorite] = React.useState(favoriteP);
  const { mutate } = useToggleFavoriteMutation();

  const toggleFavorite = () => {
    const newFavorite = !favorite;

    mutate(
      { component, addToFavorites: newFavorite },
      {
        onSuccess: () => {
          setFavorite(newFavorite);
          handleFavorite?.(component, newFavorite);
        },
      },
    );
  };

  React.useEffect(() => {
    setFavorite(favoriteP);
  }, [favoriteP]);

  return <FavoriteButton {...buttonProps} favorite={favorite} toggleFavorite={toggleFavorite} />;
}
