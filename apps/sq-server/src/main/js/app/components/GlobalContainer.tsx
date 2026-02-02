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

import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { Layout } from '@sonarsource/echoes-react';
import { Outlet, useLocation } from 'react-router-dom';
import { themeColor } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import NCDAutoUpdateMessage from '~sq-server-commons/components/new-code-definition/NCDAutoUpdateMessage';
import Workspace from '~sq-server-commons/components/workspace/Workspace';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import IndexationNotification from '~sq-server-commons/context/indexation/IndexationNotification';
import MetricsContextProvider from '~sq-server-commons/context/metrics/MetricsContextProvider';
import { Feature } from '~sq-server-commons/types/features';
import GlobalFooterLegacy from './GlobalFooter';
import NonProductionDatabaseWarning from './NonProductionDatabaseWarning';
import SystemAnnouncement from './SystemAnnouncement';
import EnableAiCodeFixMessage from './ai-codefix-notification/EnableAiCodeFixMessage';
import CalculationChangeMessage from './calculation-notification/CalculationChangeMessage';
import { GlobalNav, GlobalNavLegacy } from './nav/global/GlobalNav';
import PromotionNotification from './promotion-notification/PromotionNotification';
import { UpdateNotification } from './update-notification/UpdateNotification';

/*
 * These pages need a white background (aka 'secondary', rather than the default 'primary')
 * This should be revisited at some point (why the exception?)
 */
const PAGES_WITH_SECONDARY_BACKGROUND = new Set([
  '/tutorials',
  '/projects/create',
  '/project/branches',
  '/project/key',
  '/project/deletion',
  '/project/links',
  '/project/quality_gate',
  '/project/quality_profiles',
  '/project/webhooks',
  '/admin/webhooks',
  '/project_roles',
  '/admin/permissions',
  '/admin/permission_templates',
  '/project/background_tasks',
  '/admin/background_tasks',
  '/admin/groups',
  '/admin/marketplace',
  '/admin/system',
  '/admin/users',
  '/admin/settings',
  '/admin/settings/encryption',
  '/admin/audit',
  '/admin/projects_management',
  '/account/projects',
]);

/*
 * Temporary list of migrated pages. Once the migration is done, we can remove it
 */
const PAGES_MIGRATED: string[] = [
  '/admin/audit',
  '/account',
  '/admin/background_tasks',
  '/admin/groups',
  '/admin/license/app',
  '/admin/license/support',
  '/admin/marketplace',
  '/admin/permission_templates',
  '/admin/permissions',
  '/admin/projects_management',
  '/admin/settings',
  '/admin/settings/encryption',
  '/admin/system',
  '/admin/users',
  '/admin/webhooks',
  '/code',
  '/dashboard',
  '/dependencies',
  '/dependency-risks',
  '/coding_rules',
  '/component_measures',
  '/security_hotspots',
  '/issues',
  '/license_profiles',
  '/portfolios',
  '/profiles',
  '/project/activity',
  '/project/admin/extension/developer-server',
  '/project/admin/extension/governance/application_report',
  '/project/admin/extension/governance/console',
  '/project/admin/extension/governance/report',
  '/project/baseline',
  '/project/branches',
  '/project/deletion',
  '/project/extension/securityreport/securityreport',
  '/project/import_export',
  '/project/information',
  '/project/issues',
  '/project/key',
  '/project/license_profiles',
  '/project/links',
  '/project/quality_gate',
  '/project/quality_profiles',
  '/project_roles',
  '/quality_gates',
  '/tutorials',
  '/unsubscribe',
];

const StartupLicenseCheckBanner = addons.license?.StartupLicenseCheckBanner || (() => undefined);

export default function GlobalContainer() {
  // it is important to pass `location` down to `GlobalNav` to trigger render on url change
  const location = useLocation();
  const { hasFeature } = useAvailableFeatures();
  const { canAdmin } = useAppState();

  const newLayout = PAGES_MIGRATED.find((path) => location.pathname.includes(path));

  return isDefined(newLayout) ? (
    <MetricsContextProvider>
      <Workspace>
        {/*FIXME Temporary override to base.css to be removed when migration is done */}
        <Global
          styles={css`
            body {
              overflow-y: hidden;
            }
          `}
        />
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
        <PromotionNotification />
      </Workspace>
    </MetricsContextProvider>
  ) : (
    <MetricsContextProvider>
      <GlobalContainerWrapper id="global-container">
        <GlobalBackground
          className="sw-box-border sw-flex-[1_0_auto]"
          id="container"
          secondary={PAGES_WITH_SECONDARY_BACKGROUND.has(location.pathname)}
        >
          <Workspace>
            <div className="sw-sticky sw-top-0 sw-z-global-navbar" id="global-navigation">
              <SQSTemporaryRelativeBannerContainer>
                <Banners />
              </SQSTemporaryRelativeBannerContainer>
              <GlobalNavLegacy />
              {hasFeature(Feature.Architecture) && canAdmin && addons.architecture?.spotlight({})}
              {hasFeature(Feature.FromSonarQubeUpdate) &&
                addons.issueSandbox?.SandboxIssuesIntro && (
                  <addons.issueSandbox.SandboxIssuesIntro />
                )}

              {/* The following is the portal anchor point for the component nav
               * See ComponentContainer.tsx
               */}
              <div id="component-nav-portal" />
            </div>
            <Outlet />
          </Workspace>
          <PromotionNotification />
        </GlobalBackground>

        <GlobalFooterLegacy />
      </GlobalContainerWrapper>
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

const GlobalContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
`;

const GlobalBackground = styled.div<{ secondary: boolean }>`
  background-color: ${({ secondary }) =>
    themeColor(secondary ? 'backgroundSecondary' : 'backgroundPrimary')};
`;

// FIXME temporary fix for the banner in SQS SONAR-25639
const SQSTemporaryRelativeBannerContainer = styled.div`
  min-width: 1280px;

  & div {
    position: relative;
  }
`;
