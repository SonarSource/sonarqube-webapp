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

import { Heading, HeadingSize, ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { GreySeparator } from '~design-system';
import { whenLoggedIn } from '~sq-server-commons/components/hoc/whenLoggedIn';
import { LoggedInUser } from '~sq-server-commons/types/users';
import { AccountPageTemplate } from '../components/AccountPageTemplate';
import { Preferences } from './Preferences';
import UserExternalIdentity from './UserExternalIdentity';

export interface ProfileProps {
  currentUser: LoggedInUser;
}

export function Profile({ currentUser }: ProfileProps) {
  const isExternalProvider = !currentUser.local && currentUser.externalProvider !== 'sonarqube';
  const { formatMessage } = useIntl();

  return (
    <AccountPageTemplate title={formatMessage({ id: 'my_account.profile' })}>
      {renderLogin()}
      {renderEmail()}
      <GreySeparator className="sw-my-4" />
      {renderUserGroups()}
      {renderScmAccounts()}
      <GreySeparator className="sw-my-4" />
      <Preferences />
    </AccountPageTemplate>
  );

  function renderLogin() {
    if (!currentUser.login && !isExternalProvider) {
      return undefined;
    }

    return (
      <div className="sw-flex sw-items-center sw-mb-2">
        <strong className="sw-typo-semibold sw-mr-1">
          <FormattedMessage id="my_profile.login" />:
        </strong>
        {currentUser.login && <span id="login">{currentUser.login}</span>}
        {isExternalProvider && <UserExternalIdentity user={currentUser} />}
      </div>
    );
  }

  function renderEmail() {
    if (!currentUser.email) {
      return undefined;
    }

    return (
      <div className="sw-mb-2">
        <strong className="sw-typo-semibold sw-mr-1">
          <FormattedMessage id="my_profile.email" />:
        </strong>
        <span id="email">{currentUser.email}</span>
      </div>
    );
  }

  function renderUserGroups() {
    if (!currentUser.groups || currentUser.groups.length === 0) {
      return undefined;
    }

    return (
      <>
        <Heading as="h2" hasMarginBottom size={HeadingSize.Medium}>
          <FormattedMessage id="my_profile.groups" />
        </Heading>

        <ul id="groups">
          {currentUser.groups.map((group) => (
            <li className="sw-mb-2" key={group} title={group}>
              {group}
            </li>
          ))}
        </ul>
        <GreySeparator className="sw-my-4" />
      </>
    );
  }

  function renderScmAccounts() {
    if (
      !currentUser.login &&
      !currentUser.email &&
      (!currentUser.scmAccounts || currentUser.scmAccounts.length === 0)
    ) {
      return undefined;
    }

    return (
      <>
        <Heading
          as="h2"
          className="sw-flex sw-items-center sw-gap-2"
          hasMarginBottom
          size={HeadingSize.Medium}
        >
          <FormattedMessage id="my_profile.scm_accounts" />

          <ToggleTip description={<FormattedMessage id="my_profile.scm_accounts.tooltip" />} />
        </Heading>

        <ul id="scm-accounts">
          {currentUser.login && <li title={currentUser.login}>{currentUser.login}</li>}

          {currentUser.email && <li title={currentUser.email}>{currentUser.email}</li>}

          {currentUser.scmAccounts &&
            currentUser.scmAccounts.length > 0 &&
            currentUser.scmAccounts.map((scmAccount) => (
              <li key={scmAccount} title={scmAccount}>
                {scmAccount}
              </li>
            ))}
        </ul>
      </>
    );
  }
}

export default whenLoggedIn(Profile);
