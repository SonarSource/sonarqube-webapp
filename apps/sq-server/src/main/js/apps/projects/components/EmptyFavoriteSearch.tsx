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

import { Button, ButtonVariety, EmptyState, IconSearch } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';

export default function EmptyFavoriteSearch({ onClearAll }: Readonly<{ onClearAll: () => void }>) {
  return (
    <div className="sw-flex sw-justify-center sw-py-8">
      <EmptyState
        action={
          <Button onClick={onClearAll} variety={ButtonVariety.Primary}>
            <FormattedMessage id="projects.favorite_search.clear_all_filters" />
          </Button>
        }
        className="sw-py-8"
        graphic={<IconSearch />}
        text={<FormattedMessage id="no_results_search.favorites" />}
        title={<FormattedMessage id="projects.favorite_search.empty.title" />}
        titleAs="h3"
        titleSize="medium"
      />
    </div>
  );
}
