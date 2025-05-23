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

import { Link, MessageCallout, MessageType } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { DocLink } from '../../../helpers/doc-links';
import { useDocUrl } from '../../../helpers/docs';
import { translate } from '../../../helpers/l10n';

export interface ProjectTokenScopeInfoProps {
  className?: string;
}

export default function ProjectTokenScopeInfo({ className }: Readonly<ProjectTokenScopeInfoProps>) {
  const docUrl = useDocUrl(DocLink.AccountTokens);

  return (
    <MessageCallout
      className={classNames('sw-mt-2', className)}
      text={
        <FormattedMessage
          id="onboarding.token.warning_project_token_scope"
          tagName="span"
          values={{
            link: (
              <Link shouldOpenInNewTab to="/account/security">
                {translate('onboarding.token.text.user_account')}
              </Link>
            ),
            doc_link: <Link to={docUrl}>{translate('documentation')}</Link>,
          }}
        />
      }
      type={MessageType.Info}
    />
  );
}
