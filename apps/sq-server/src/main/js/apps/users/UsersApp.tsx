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

import {
  Button,
  ButtonVariety,
  Card,
  Label,
  Layout,
  SearchInput,
  Spinner,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { subDays, subSeconds } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { InputSelect } from '~design-system';
import ListFooter from '~shared/components/controls/ListFooter';
import { useDebouncedValue } from '~shared/helpers/useDebouncedValue';
import { getIdentityProviders } from '~sq-server-commons/api/users';
import { ManagedFilter } from '~sq-server-commons/components/controls/ManagedFilter';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import { now, toISO8601WithOffsetString } from '~sq-server-commons/helpers/dates';
import { LabelValueSelectOption } from '~sq-server-commons/helpers/search';
import { useIdentityProviderQuery } from '~sq-server-commons/queries/identity-provider/common';
import { useUsersQueries } from '~sq-server-commons/queries/users';
import { IdentityProvider, Provider } from '~sq-server-commons/types/types';
import GitHubSynchronisationWarning from '../../app/components/GitHubSynchronisationWarning';
import GitLabSynchronisationWarning from '../../app/components/GitLabSynchronisationWarning';
import UserForm from './components/UserForm';
import { USERS_ACTIVITY_OPTIONS, USER_INACTIVITY_DAYS_THRESHOLD } from './constants';
import { UserActivity } from './types';
import UsersAppDescription from './UsersAppDescription';
import UsersList from './UsersList';

export default function UsersApp() {
  const { formatMessage } = useIntl();
  const [identityProviders, setIdentityProviders] = useState<IdentityProvider[]>([]);
  const [usersActivity, setUsersActivity] = useState<UserActivity>(UserActivity.AnyActivity);
  const [managed, setManaged] = useState<boolean | undefined>(undefined);

  const { data: manageProvider } = useIdentityProviderQuery();

  const [search, query, handleSearch] = useDebouncedValue();

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

  const { data, isLoading, fetchNextPage } = useUsersQueries({
    q: query,
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
    <AdminPageTemplate
      actions={
        <Layout.PageHeader.Actions>
          <UserForm isInstanceManaged={false}>
            <Button
              id="users-create"
              isDisabled={manageProvider?.provider !== undefined}
              variety={ButtonVariety.Primary}
            >
              <FormattedMessage id="users.create_user" />
            </Button>
          </UserForm>
        </Layout.PageHeader.Actions>
      }
      description={<UsersAppDescription manageProvider={manageProvider?.provider} />}
      title={formatMessage({ id: 'users.page' })}
      width="fluid"
    >
      <div className="sw-mb-8">
        {manageProvider?.provider === Provider.Github && <GitHubSynchronisationWarning short />}
        {manageProvider?.provider === Provider.Gitlab && <GitLabSynchronisationWarning short />}
        <Card>
          <Card.Body>
            <div className="sw-flex sw-mb-4">
              <ManagedFilter
                loading={isLoading}
                manageProvider={manageProvider?.provider}
                managed={managed}
                setManaged={(m) => {
                  setManaged(m);
                }}
              />

              <SearchInput
                className="sw-mr-2"
                id="users-search"
                onChange={handleSearch}
                placeholderLabel={formatMessage({ id: 'search.search_by_login_or_name' })}
                value={search}
                width="large"
              />
              <div className="sw-flex sw-items-center sw-ml-4">
                <Label as="label" className="sw-mr-2">
                  <FormattedMessage id="users.filter.by" />
                </Label>
                <InputSelect
                  aria-label={formatMessage({ id: 'users.activity_filter.label' })}
                  className="sw-typo-default"
                  id="users-activity-filter"
                  isDisabled={isLoading}
                  isSearchable={false}
                  onChange={(userActivity: LabelValueSelectOption<UserActivity>) => {
                    setUsersActivity(userActivity.value);
                  }}
                  options={USERS_ACTIVITY_OPTIONS}
                  placeholder={formatMessage({ id: 'users.activity_filter.placeholder' })}
                  size="medium"
                  value={
                    USERS_ACTIVITY_OPTIONS.find((option) => option.value === usersActivity) ?? null
                  }
                />
                <ToggleTip
                  className="sw-ml-2"
                  description={
                    <>
                      <p>
                        <FormattedMessage id="users.activity_filter.helptext.sonarqube" />
                      </p>
                      <br />
                      <p>
                        <FormattedMessage id="users.activity_filter.helptext.sonarlint" />
                      </p>
                    </>
                  }
                  side="right"
                />
              </div>
            </div>

            <Spinner isLoading={isLoading}>
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
          </Card.Body>
        </Card>
      </div>
    </AdminPageTemplate>
  );
}
