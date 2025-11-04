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

import { Heading, Link } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  children?: React.ReactNode;
}

export default function PageHeader({ children }: Readonly<Props>) {
  const toUrl = useDocUrl(DocLink.Webhooks);

  return (
    <header className="sw-mb-2 sw-flex sw-items-center sw-justify-between">
      <div>
        <Heading as="h1" className="sw-mb-4">
          {translate('webhooks.page')}
        </Heading>
        <p>{translate('webhooks.description0')}</p>
        <p>
          <FormattedMessage
            id="webhooks.description1"
            values={{
              url: <Link to={toUrl}>{translate('webhooks.documentation_link')}</Link>,
            }}
          />
        </p>
      </div>
      <div>{children}</div>
    </header>
  );
}
