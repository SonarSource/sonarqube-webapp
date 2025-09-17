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

import {
  Link,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import useLocalStorage from '~sq-server-commons/hooks/useLocalStorage';

const SANDBOX_LOCAL_STORAGE_KEY = 'issue.sandbox.dismissed';

export default function IssueSandboxCallout() {
  const intl = useIntl();

  const [dismissedMessage, setDismissedMessage] = useLocalStorage(SANDBOX_LOCAL_STORAGE_KEY, false);

  const docUrl = useDocUrl(DocLink.IssueStatuses);

  if (dismissedMessage) {
    return null;
  }

  return (
    <MessageCallout
      action={
        <Link
          className="sw-ml-3"
          enableOpenInNewTab
          highlight={LinkHighlight.CurrentColor}
          to={docUrl}
        >
          {intl.formatMessage({ id: 'learn_more_in_doc' })}
        </Link>
      }
      onDismiss={() => {
        setDismissedMessage(true);
      }}
      title={intl.formatMessage({ id: 'issue.sandbox.title' })}
      variety={MessageVariety.Discover}
    >
      <Text as="p">
        <FormattedMessage id="issue.sandbox.description" />
      </Text>
    </MessageCallout>
  );
}
