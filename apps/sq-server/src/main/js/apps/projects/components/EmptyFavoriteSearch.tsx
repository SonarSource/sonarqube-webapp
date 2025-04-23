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

import { Link, Text, TextSize } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { FishVisual } from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';
import { queryToSearchString } from '~sq-server-shared/sonar-aligned/helpers/urls';
import { ProjectsQuery } from '~sq-server-shared/types/projects';

export default function EmptyFavoriteSearch({ query }: { query: ProjectsQuery }) {
  return (
    <div className="sw-flex sw-flex-col sw-items-center sw-py-8">
      <FishVisual />
      <Text className="sw-mt-6" isHighlighted size={TextSize.Large}>
        {translate('no_results_search.favorites')}
      </Text>
      <div className="sw-my-4 sw-typo-default">
        <FormattedMessage
          id="no_results_search.favorites.2"
          values={{
            url: (
              <Link
                to={{
                  pathname: '/projects',
                  search: queryToSearchString(query as Record<string, string | undefined | number>),
                }}
              >
                {translate('all')}
              </Link>
            ),
          }}
        />
      </div>
    </div>
  );
}
