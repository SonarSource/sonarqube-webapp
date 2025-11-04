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

import { Heading, MessageCallout } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { LargeCenteredLayout } from '~design-system';
import ResetPasswordForm from '~sq-server-commons/components/common/ResetPasswordForm';
import { whenLoggedIn } from '~sq-server-commons/components/hoc/whenLoggedIn';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { LoggedInUser } from '~sq-server-commons/types/users';

export interface ResetPasswordProps {
  currentUser: LoggedInUser;
}

export function ResetPassword({ currentUser }: Readonly<ResetPasswordProps>) {
  return (
    <LargeCenteredLayout className="sw-h-screen sw-pt-10">
      <Helmet defer={false} title={translate('my_account.reset_password.page')} />
      <div className="sw-flex sw-justify-center">
        <div>
          <Heading as="h1">{translate('my_account.reset_password')}</Heading>
          <MessageCallout className="sw-mb-4" variety="warning">
            {translate('my_account.reset_password.explain')}
          </MessageCallout>
          <Heading as="h2">{translate('my_profile.password.title')}</Heading>
          <ResetPasswordForm
            onPasswordChange={() => {
              // Force a refresh for the backend to handle additional redirects.
              window.location.href = `${getBaseUrl()}/`;
            }}
            user={currentUser}
          />
        </div>
      </div>
    </LargeCenteredLayout>
  );
}

export default whenLoggedIn(ResetPassword);
