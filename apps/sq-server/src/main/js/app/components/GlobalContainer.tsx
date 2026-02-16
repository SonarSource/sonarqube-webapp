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
import { Outlet } from 'react-router-dom';
import { addons } from '~sq-server-addons/index';
import NCDAutoUpdateMessage from '~sq-server-commons/components/new-code-definition/NCDAutoUpdateMessage';
import Workspace from '~sq-server-commons/components/workspace/Workspace';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import IndexationNotification from '~sq-server-commons/context/indexation/IndexationNotification';
import MetricsContextProvider from '~sq-server-commons/context/metrics/MetricsContextProvider';
import { Feature } from '~sq-server-commons/types/features';
import NonProductionDatabaseWarning from './NonProductionDatabaseWarning';
import SystemAnnouncement from './SystemAnnouncement';
import EnableAiCodeFixMessage from './ai-codefix-notification/EnableAiCodeFixMessage';
import CalculationChangeMessage from './calculation-notification/CalculationChangeMessage';
import { GlobalNav } from './nav/global/GlobalNav';
import { PromotionNotificationManager } from './promotion-notification/PromotionNotificationManager';
import { UpdateNotification } from './update-notification/UpdateNotification';

const StartupLicenseCheckBanner = addons.license?.StartupLicenseCheckBanner || (() => undefined);

export default function GlobalContainer() {
  const { hasFeature } = useAvailableFeatures();
  const { canAdmin } = useAppState();

  return (
    <MetricsContextProvider>
      <Workspace>
        <Layout>
          <Layout.BannerContainer>
            <Banners />
          </Layout.BannerContainer>

          <GlobalNav />

          <Outlet />
        </Layout>

        {/* spotlight tours and modals */}
        {hasFeature(Feature.Architecture) && canAdmin && addons.architecture?.spotlight({})}
        {hasFeature(Feature.FromSonarQubeUpdate) && addons.issueSandbox?.SandboxIssuesIntro && (
          <addons.issueSandbox.SandboxIssuesIntro />
        )}

        <PromotionNotificationManager />
      </Workspace>
    </MetricsContextProvider>
  );
}

function Banners() {
  const { hasFeature } = useAvailableFeatures();
  const { canAdmin } = useAppState();

  return (
    <>
      <StartupLicenseCheckBanner />
      <SystemAnnouncement />
      <NonProductionDatabaseWarning />
      {(hasFeature(Feature.FixSuggestions) || hasFeature(Feature.FixSuggestionsMarketing)) && (
        <EnableAiCodeFixMessage />
      )}
      {hasFeature(Feature.Architecture) &&
        canAdmin &&
        addons.architecture?.ArchitectureAdminBanner({})}
      <NCDAutoUpdateMessage />
      <UpdateNotification isGlobalBanner />
      <IndexationNotification />
      <CalculationChangeMessage />
    </>
  );
}
