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

import { Heading, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import ResetPasswordForm from '~sq-server-commons/components/common/ResetPasswordForm';
import { useCurrentLoginUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { getInstance } from '~sq-server-commons/helpers/system';
import TokensForm from '../../users/components/TokensForm';
import { AccountPageTemplate } from '../components/AccountPageTemplate';

export default function Security() {
  const { formatMessage } = useIntl();
  const currentUser = useCurrentLoginUser();
  return (
    <AccountPageTemplate title={formatMessage({ id: 'my_account.security' })}>
      <Text as="p" className="sw-mb-2">
        <FormattedMessage id="my_account.tokens_description" values={{ instance: getInstance() }} />
      </Text>
      <TokensForm deleteConfirmation="modal" displayTokenTypeInput login={currentUser.login} />

      {currentUser.local && (
        <div className="sw-mt-8">
          <Heading as="h2" hasMarginBottom>
            <FormattedMessage id="my_profile.password.title" />
          </Heading>

          <ResetPasswordForm user={currentUser} />
        </div>
      )}
    </AccountPageTemplate>
  );
}
