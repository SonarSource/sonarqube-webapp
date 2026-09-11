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

import { Layout, Link } from '@sonarsource/echoes-react';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { getSecurityAlertsUrl } from '~shared/helpers/security-alerts-urls';
import { CurrentUserContext } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { useMostRecentSecurityAlertQuery } from '~sq-server-commons/queries/security-alerts';

export function SecurityAlertBanner() {
  const { currentUser } = useContext(CurrentUserContext);

  const { data } = useMostRecentSecurityAlertQuery({ enabled: currentUser.isLoggedIn });
  const alert = data?.securityAlerts[0];

  if (!currentUser.isLoggedIn || !alert) {
    return null;
  }

  return (
    <Layout.Banner variety="danger">
      <FormattedMessage
        id="security_alerts.security_alert_banner.message"
        values={{
          link: (text) => <Link to={getSecurityAlertsUrl()}>{text}</Link>,
        }}
      />
    </Layout.Banner>
  );
}
