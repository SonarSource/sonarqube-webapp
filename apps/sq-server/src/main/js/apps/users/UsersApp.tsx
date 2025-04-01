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

import { subDays, subSeconds } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HelperHintIcon,
  InputSearch,
  InputSelect,
  LargeCenteredLayout,
  PageContentFontWrapper,
  Spinner,
  StyledPageTitle,
} from '~design-system';
import { getIdentityProviders } from '~sq-server-shared/api/users';
import ListFooter from '~sq-server-shared/components/controls/ListFooter';
import { ManagedFilter } from '~sq-server-shared/components/controls/ManagedFilter';
import { now, toISO8601WithOffsetString } from '~sq-server-shared/helpers/dates';
import { translate } from '~sq-server-shared/helpers/l10n';
import { LabelValueSelectOption } from '~sq-server-shared/helpers/search';
import { useIdentityProviderQuery } from '~sq-server-shared/queries/identity-provider/common';
import { useUsersQueries } from '~sq-server-shared/queries/users';
import HelpTooltip from '~sq-server-shared/sonar-aligned/components/controls/HelpTooltip';
import { IdentityProvider, Provider } from '~sq-server-shared/types/types';
import { RestUserDetailed } from '~sq-server-shared/types/users';
import GitHubSynchronisationWarning from '../../app/components/GitHubSynchronisationWarning';
import GitLabSynchronisationWarning from '../../app/components/GitLabSynchronisationWarning';
import Header from './Header';
import UsersList from './UsersList';
import { USERS_ACTIVITY_OPTIONS, USER_INACTIVITY_DAYS_THRESHOLD } from './constants';
import { UserActivity } from './types';

export default function UsersApp() {
  const [identityProviders, setIdentityProviders] = useState<IdentityProvider[]>([]);
  const [search, setSearch] = useState('');
  const [usersActivity, setUsersActivity] = useState<UserActivity>(UserActivity.AnyActivity);
  const [managed, setManaged] = useState<boolean | undefined>(undefined);

  const { data: manageProvider } = useIdentityProviderQuery();

  const usersActivityParams = useMemo(() => {
    const nowDate = now();
    const nowDateMinus30Days = subDays(nowDate, USER_INACTIVITY_DAYS_THRESHOLD);
    const nowDateMinus30DaysAnd1Second = subSeconds(nowDateMinus30Days, 1);

    switch (usersActivity) {
      case UserActivity.ActiveSonarLintUser:
        return {
          sonarLintLastConnectionDateFrom: toISO8601WithOffsetString(nowDateMinus30Days),
        };
      case UserActivity.ActiveSonarQubeUser:
        return {
          sonarQubeLastConnectionDateFrom: toISO8601WithOffsetString(nowDateMinus30Days),
          sonarLintLastConnectionDateTo: toISO8601WithOffsetString(nowDateMinus30DaysAnd1Second),
        };
      case UserActivity.InactiveUser:
        return {
          sonarQubeLastConnectionDateTo: toISO8601WithOffsetString(nowDateMinus30DaysAnd1Second),
        };
      default:
        return {};
    }
  }, [usersActivity]);

  const { data, isLoading, fetchNextPage } = useUsersQueries<RestUserDetailed>({
    q: search,
    managed,
    ...usersActivityParams,
  });

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  useEffect(() => {
    (async () => {
      const { identityProviders } = await getIdentityProviders();
      setIdentityProviders(identityProviders);
    })();
  }, []);

  return (
    <LargeCenteredLayout as="main" id="users-page">
      <PageContentFontWrapper className="sw-my-8 sw-typo-default">
        <Helmet defer={false} title={translate('users.page')} />
        <Header manageProvider={manageProvider?.provider} />
        {manageProvider?.provider === Provider.Github && <GitHubSynchronisationWarning short />}
        {manageProvider?.provider === Provider.Gitlab && <GitLabSynchronisationWarning short />}
        <div className="sw-flex sw-my-4">
          <ManagedFilter
            loading={isLoading}
            manageProvider={manageProvider?.provider}
            managed={managed}
            setManaged={(m) => {
              setManaged(m);
            }}
          />
          <InputSearch
            id="users-search"
            minLength={2}
            onChange={(search: string) => {
              setSearch(search);
            }}
            placeholder={translate('search.search_by_login_or_name')}
            value={search}
          />
          <div className="sw-flex sw-items-center sw-ml-4">
            <StyledPageTitle as="label" className="sw-typo-semibold sw-mr-2">
              {translate('users.filter.by')}
            </StyledPageTitle>
            <InputSelect
              aria-label={translate('users.activity_filter.label')}
              className="sw-typo-default"
              id="users-activity-filter"
              isDisabled={isLoading}
              isSearchable={false}
              onChange={(userActivity: LabelValueSelectOption<UserActivity>) => {
                setUsersActivity(userActivity.value);
              }}
              options={USERS_ACTIVITY_OPTIONS}
              placeholder={translate('users.activity_filter.placeholder')}
              size="medium"
              value={
                USERS_ACTIVITY_OPTIONS.find((option) => option.value === usersActivity) ?? null
              }
            />
            <HelpTooltip
              className="sw-ml-1"
              overlay={
                <>
                  <p>{translate('users.activity_filter.helptext.sonarqube')}</p>
                  <p>{translate('users.activity_filter.helptext.sonarlint')}</p>
                </>
              }
            >
              <HelperHintIcon />
            </HelpTooltip>
          </div>
        </div>
        <Spinner loading={isLoading}>
          <UsersList
            identityProviders={identityProviders}
            manageProvider={manageProvider?.provider}
            users={users}
          />
        </Spinner>

        <ListFooter
          count={users.length}
          loadMore={fetchNextPage}
          ready={!isLoading}
          total={data?.pages[0].page.total}
        />
      </PageContentFontWrapper>
    </LargeCenteredLayout>
  );
}
