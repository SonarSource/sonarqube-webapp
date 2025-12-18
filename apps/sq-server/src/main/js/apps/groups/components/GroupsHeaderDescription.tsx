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

import { Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { Provider } from '~sq-server-commons/types/types';

interface Props {
  manageProvider: Provider | undefined;
}

export function GroupsHeaderDescription({ manageProvider }: Readonly<Props>) {
  return (
    <Layout.PageHeader.Description>
      {manageProvider === undefined ? (
        <FormattedMessage id="user_groups.page.description" />
      ) : (
        <div className="sw-max-w-3/4">
          <FormattedMessage
            id="user_groups.page.managed_description"
            values={{
              provider: <FormattedMessage id={`managed.${manageProvider}`} />,
            }}
          />
          <div className="sw-mt-2">
            <FormattedMessage
              id="user_groups.page.managed_description.recommendation"
              values={{
                link: (
                  <DocumentationLink to={DocLink.AuthOverview}>
                    <FormattedMessage id="user_groups.page.managing_groups" />
                  </DocumentationLink>
                ),
              }}
            />
          </div>
        </div>
      )}
    </Layout.PageHeader.Description>
  );
}
