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

import styled from '@emotion/styled';
import { Layout } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { Outlet } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import useEffectOnce from '~shared/helpers/useEffectOnce';
import { Extension } from '~shared/types/common';
import { getSettingsNavigation } from '~sq-server-commons/api/navigation';
import { getPendingPlugins } from '~sq-server-commons/api/plugins';
import { getSystemStatus, waitSystemUPStatus } from '~sq-server-commons/api/system';
import AdminContext, {
  defaultPendingPlugins,
  defaultSystemStatus,
} from '~sq-server-commons/context/AdminContext';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { AdminPagesContext } from '~sq-server-commons/types/admin';
import { AppState } from '~sq-server-commons/types/appstate';
import { PendingPluginResult } from '~sq-server-commons/types/plugins';
import { SysStatus } from '~sq-server-commons/types/types';
import handleRequiredAuthorization from '../utils/handleRequiredAuthorization';
import { AdministrationSidebar } from './nav/administration/AdministrationSidebar';
import SettingsNav from './nav/settings/SettingsNav';

export interface AdminContainerProps {
  appState: AppState;
}

export function AdminContainer({ appState }: Readonly<AdminContainerProps>) {
  const intl = useIntl();

  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  const [pendingPlugins, setPendingPlugins] =
    React.useState<PendingPluginResult>(defaultPendingPlugins);
  const [systemStatus, setSystemStatus] = React.useState<SysStatus>(defaultSystemStatus);
  const [adminPages, setAdminPages] = React.useState<Extension[]>([]);

  const fetchNavigationSettings = React.useCallback(() => {
    getSettingsNavigation().then((r) => {
      setAdminPages(r.extensions);
    }, noop);
  }, []);

  const fetchPendingPlugins = React.useCallback(() => {
    getPendingPlugins().then((pendingPlugins) => {
      setPendingPlugins(pendingPlugins);
    }, noop);
  }, []);

  const waitRestartingDone = React.useCallback(() => {
    waitSystemUPStatus().then(({ status }) => {
      setSystemStatus(status);
      window.location.reload();
    }, noop);
  }, []);

  const fetchSystemStatus = React.useCallback(() => {
    getSystemStatus().then(({ status }) => {
      setSystemStatus(status);
      if (status === 'RESTARTING') {
        waitRestartingDone();
      }
    }, noop);
  }, [waitRestartingDone]);

  useEffectOnce(() => {
    if (!appState.canAdmin) {
      handleRequiredAuthorization();
      return;
    }

    fetchNavigationSettings();
    fetchPendingPlugins();
    fetchSystemStatus();
  });

  const adminContextValue = React.useMemo(
    () => ({
      fetchSystemStatus,
      fetchPendingPlugins,
      pendingPlugins,
      systemStatus,
    }),
    [fetchPendingPlugins, fetchSystemStatus, pendingPlugins, systemStatus],
  );

  // Check that the adminPages are loaded
  if (!adminPages) {
    return null;
  }

  const adminPagesContext: AdminPagesContext = { adminPages };

  return (
    <>
      {frontEndEngineeringEnableSidebarNavigation && (
        <AdministrationSidebar extensions={adminPages} />
      )}

      <Layout.ContentGrid>
        <Helmet
          defer={false}
          titleTemplate={intl.formatMessage(
            { id: 'page_title.template.with_category' },
            { page: translate('layout.settings') },
          )}
        />

        {!frontEndEngineeringEnableSidebarNavigation && (
          <ContentHeader>
            <SettingsNav
              extensions={adminPages}
              fetchPendingPlugins={fetchPendingPlugins}
              fetchSystemStatus={fetchSystemStatus}
              pendingPlugins={pendingPlugins}
              systemStatus={systemStatus}
            />
          </ContentHeader>
        )}

        <AdminContext.Provider value={adminContextValue}>
          <Outlet context={adminPagesContext} />
        </AdminContext.Provider>
      </Layout.ContentGrid>
    </>
  );
}

export default withAppStateContext(AdminContainer);

const ContentHeader = styled.div`
  grid-area: content-header;
`;
