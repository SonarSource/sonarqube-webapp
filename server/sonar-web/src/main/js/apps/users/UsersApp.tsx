/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useUsersQueries } from '../../api/queries/users';
import { getIdentityProviders } from '../../api/users';
import GitHubSynchronisationWarning from '../../app/components/GitHubSynchronisationWarning';
import HelpTooltip from '../../components/controls/HelpTooltip';
import ListFooter from '../../components/controls/ListFooter';
import { ManagedFilter } from '../../components/controls/ManagedFilter';
import SearchBox from '../../components/controls/SearchBox';
import Select, { LabelValueSelectOption } from '../../components/controls/Select';
import Suggestions from '../../components/embed-docs-modal/Suggestions';
import { Provider, useManageProvider } from '../../components/hooks/useManageProvider';
import DeferredSpinner from '../../components/ui/DeferredSpinner';
import { now, toISO8601WithOffsetString } from '../../helpers/dates';
import { translate } from '../../helpers/l10n';
import { IdentityProvider } from '../../types/types';
import Header from './Header';
import UsersList from './UsersList';
import { USERS_ACTIVITY_OPTIONS, USER_INACTIVITY_DAYS_THRESHOLD } from './constants';
import { UserActivity } from './types';

export default function UsersApp() {
  const [identityProviders, setIdentityProviders] = useState<IdentityProvider[]>([]);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [usersActivity, setUsersActivity] = useState<UserActivity>(UserActivity.AnyActivity);
  const [managed, setManaged] = useState<boolean | undefined>(undefined);

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

  const { users, total, isLoading } = useUsersQueries<'admin'>(
    {
      q: search,
      managed,
      ...usersActivityParams,
    },
    numberOfPages
  );

  const manageProvider = useManageProvider();

  useEffect(() => {
    (async () => {
      const { identityProviders } = await getIdentityProviders();
      setIdentityProviders(identityProviders);
    })();
  }, []);

  return (
    <main className="page page-limited" id="users-page">
      <Suggestions suggestions="users" />
      <Helmet defer={false} title={translate('users.page')} />
      <Header manageProvider={manageProvider} />
      {manageProvider === Provider.Github && <GitHubSynchronisationWarning short />}
      <div className="display-flex-justify-start big-spacer-bottom big-spacer-top">
        <ManagedFilter
          manageProvider={manageProvider}
          loading={isLoading}
          managed={managed}
          setManaged={(m) => {
            setManaged(m);
            setNumberOfPages(1);
          }}
        />
        <SearchBox
          id="users-search"
          minLength={2}
          onChange={(search: string) => {
            setSearch(search);
            setNumberOfPages(1);
          }}
          placeholder={translate('search.search_by_login_or_name')}
          value={search}
        />
        <div className="sw-ml-4">
          <Select
            id="users-activity-filter"
            className="input-large"
            isDisabled={isLoading}
            onChange={(userActivity: LabelValueSelectOption<UserActivity>) => {
              setUsersActivity(userActivity.value);
              setNumberOfPages(1);
            }}
            options={USERS_ACTIVITY_OPTIONS}
            isSearchable={false}
            placeholder={translate('users.activity_filter.placeholder')}
            aria-label={translate('users.activity_filter.label')}
            value={USERS_ACTIVITY_OPTIONS.find((option) => option.value === usersActivity) ?? null}
          />
          <HelpTooltip
            className="sw-ml-1"
            overlay={
              <>
                <p>{translate('users.activity_filter.helptext.sonarqube')}</p>
                <p>{translate('users.activity_filter.helptext.sonarlint')}</p>
              </>
            }
          />
        </div>
      </div>
      <DeferredSpinner loading={isLoading}>
        <UsersList
          identityProviders={identityProviders}
          users={users}
          manageProvider={manageProvider}
        />
      </DeferredSpinner>

      <ListFooter
        count={users.length}
        loadMore={() => setNumberOfPages((n) => n + 1)}
        ready={!isLoading}
        total={total}
      />
    </main>
  );
}
