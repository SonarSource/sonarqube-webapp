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
import * as React from 'react';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { getBaseUrl } from '~adapters/helpers/system';
import { addGlobalErrorMessage } from '~design-system';
import { RecentHistory } from '~shared/helpers/recent-history';
import { logOut } from '~sq-server-commons/api/auth';
import { translate } from '~sq-server-commons/helpers/l10n';

export default function Logout() {
  React.useEffect(() => {
    logOut()
      .then(() => {
        RecentHistory.clear();
        window.location.replace(getBaseUrl() + '/');
      })
      .catch(() => {
        addGlobalErrorMessage(translate('login.logout_failed'));
      });
  }, []);

  return (
    <Layout.PageGrid>
      <Layout.PageContent>
        <div className="sw-typo-lg sw-mt-40 sw-text-center">{translate('logging_out')}</div>
      </Layout.PageContent>
      <GlobalFooter hideLoggedInInfo />
    </Layout.PageGrid>
  );
}
