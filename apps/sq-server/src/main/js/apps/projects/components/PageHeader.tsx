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

import { ButtonGroup, SearchInput, Text, Tooltip } from '@sonarsource/echoes-react';
import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { RawQuery } from '~shared/types/router';
import HomePageSelect from '~sq-server-commons/components/controls/HomePageSelect';
import { DEBOUNCE_DELAY } from '~sq-server-commons/design-system';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';
import ApplicationCreation from './ApplicationCreation';
import PerspectiveSelect from './PerspectiveSelect';
import ProjectCreationMenu from './ProjectCreationMenu';
import ProjectsSortingSelect from './ProjectsSortingSelect';

interface Props {
  currentUser: CurrentUser;
  onPerspectiveChange: (x: { view: string }) => void;
  onQueryChange: (change: RawQuery) => void;
  onSortChange: (sort: string, desc: boolean) => void;
  query: RawQuery;
  selectedSort: string;
  total?: number;
  view: string;
}

const MIN_SEARCH_QUERY_LENGTH = 2;

export default function PageHeader(props: Readonly<Props>) {
  const { query, total, currentUser, onQueryChange, view } = props;

  const [search, setSearch] = useState<string>((query.search as string) ?? '');
  const intl = useIntl();

  const defaultOption = isLoggedIn(currentUser) ? 'name' : 'analysis_date';

  const onQueryChangeDebounced = useMemo(
    () => debounce(onQueryChange, DEBOUNCE_DELAY),
    [onQueryChange],
  );
  const handleSearch = useCallback(
    (search: string) => {
      setSearch(search);

      if (search.length >= MIN_SEARCH_QUERY_LENGTH) {
        onQueryChangeDebounced({ search });
      } else if (search.length === 0) {
        onQueryChangeDebounced({ search: undefined });
      }
    },
    [onQueryChangeDebounced],
  );

  return (
    <div className="it__page-header sw-flex sw-flex-col sw-gap-2 sw-pb-4">
      <div className="sw-flex sw-justify-end">
        <ButtonGroup>
          <ProjectCreationMenu />

          <ApplicationCreation />
        </ButtonGroup>
      </div>

      <div className="sw-flex sw-justify-between sw-gap-2">
        <div className="sw-flex sw-flex-1 sw-gap-3">
          <Tooltip content={intl.formatMessage({ id: 'projects.search' })}>
            <SearchInput
              className="it__page-header-search sw-min-w-abs-150 sw-max-w-abs-350 sw-flex-1"
              minLength={MIN_SEARCH_QUERY_LENGTH}
              onChange={handleSearch}
              placeholderLabel={intl.formatMessage({ id: 'search.search_for_projects' })}
              value={search}
              width="full"
            />
          </Tooltip>

          <PerspectiveSelect onChange={props.onPerspectiveChange} view={view} />

          <ProjectsSortingSelect
            defaultOption={defaultOption}
            onChange={props.onSortChange}
            selectedSort={props.selectedSort}
            view={view}
          />
        </div>

        <div className="sw-flex sw-items-center sw-gap-1">
          {isDefined(total) && (
            <Text>
              <Text className="sw-mr-1" id="projects-total" isHighlighted>
                {total}
              </Text>
              <FormattedMessage id="projects_" />
            </Text>
          )}

          <HomePageSelect currentPage={{ type: 'PROJECTS' }} />
        </div>
      </div>
    </div>
  );
}
