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

import { ToggleButtonGroup } from '@sonarsource/echoes-react';
import * as React from 'react';
import { withRouter, WithRouterProps } from '~shared/components/hoc/withRouter';
import { save } from '~shared/helpers/storage';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';
import { PROJECTS_ALL, PROJECTS_DEFAULT_FILTER, PROJECTS_FAVORITE } from '../utils';

interface Props extends WithRouterProps {
  currentUser: CurrentUser;
}

enum OPTION {
  Favorite = 'fav',
  All = 'all',
}

export const FAVORITE_PATHNAME = '/projects/favorite';
export const ALL_PATHNAME = '/projects';

export class FavoriteFilter extends React.PureComponent<Props> {
  handleSaveFavorite = () => {
    save(PROJECTS_DEFAULT_FILTER, PROJECTS_FAVORITE);
  };

  handleSaveAll = () => {
    save(PROJECTS_DEFAULT_FILTER, PROJECTS_ALL);
  };

  onFavoriteChange = (value: OPTION) => {
    if (value === OPTION.Favorite) {
      this.handleSaveFavorite();
      this.props.router.push({ pathname: FAVORITE_PATHNAME, query: this.props.location.query });
    } else {
      this.handleSaveAll();
      this.props.router.push({ pathname: ALL_PATHNAME, query: this.props.location.query });
    }
  };

  render() {
    const {
      location: { pathname },
    } = this.props;

    if (!isLoggedIn(this.props.currentUser)) {
      return null;
    }

    return (
      <ToggleButtonGroup
        className="sw-mb-8"
        onChange={this.onFavoriteChange}
        options={[
          { value: OPTION.Favorite, label: translate('my_favorites') },
          { value: OPTION.All, label: translate('all') },
        ]}
        selected={pathname === FAVORITE_PATHNAME ? OPTION.Favorite : OPTION.All}
      />
    );
  }
}

export default withRouter(withCurrentUserContext(FavoriteFilter));
