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

import { Button, ButtonVariety, Heading } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import UserForm from './components/UserForm';

interface Props {
  manageProvider?: string;
}

export default function Header(props: Readonly<Props>) {
  const { manageProvider } = props;
  return (
    <div>
      <div className="sw-flex sw-justify-between">
        <Heading as="h1">{translate('users.page')}</Heading>

        <UserForm isInstanceManaged={false}>
          <Button
            id="users-create"
            isDisabled={manageProvider !== undefined}
            variety={ButtonVariety.Primary}
          >
            {translate('users.create_user')}
          </Button>
        </UserForm>
      </div>
      <div>
        {manageProvider === undefined ? (
          <span>{translate('users.page.description')}</span>
        ) : (
          <div className="sw-max-w-3/4 sw-mb-4">
            <FormattedMessage
              id="users.page.managed_description"
              values={{
                provider: translate(`managed.${manageProvider}`),
              }}
            />
            <div className="sw-mt-2">
              <FormattedMessage
                id="users.page.managed_description.recommendation"
                values={{
                  link: (
                    <DocumentationLink to={DocLink.AuthOverview}>
                      {translate('users.page.managing_users')}
                    </DocumentationLink>
                  ),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
