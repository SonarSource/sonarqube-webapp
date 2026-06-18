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

import { LinkStandalone, MessageCallout, MessageVariety } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppState } from '../../context/app-state/withAppStateContext';
import { SonarSourceLink } from '../../helpers/doc-links';
import { getSonarSourceComUrl } from '../../helpers/urls';
import { EditionKey } from '../../types/editions';

interface CommunityBuildSecurityNoticeProps {
  className?: string;
}

export function CommunityBuildSecurityNotice({
  className,
}: Readonly<CommunityBuildSecurityNoticeProps>) {
  const { edition } = useAppState();
  const { formatMessage } = useIntl();

  if (edition !== EditionKey.community) {
    return null;
  }

  return (
    <MessageCallout
      className={className}
      title={formatMessage({ id: 'promotion.community_build_security.title' })}
      variety={MessageVariety.Warning}
    >
      <div className="sw-flex sw-flex-col sw-items-start sw-gap-2">
        <FormattedMessage id="promotion.community_build_security.text" />
        <LinkStandalone enableOpenInNewTab to={getSonarSourceComUrl(SonarSourceLink.WhyUpgrade)}>
          <FormattedMessage id="promotion.community_build_security.action" />
        </LinkStandalone>
      </div>
    </MessageCallout>
  );
}
