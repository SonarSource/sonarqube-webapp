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

import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { Outlet, useLocation } from 'react-router-dom';
import { lightTheme, themeColor } from '~design-system';
import { A11yProvider } from '~shared/components/a11y/A11yProvider';
import { addons } from '~sq-server-addons/index';
import SuggestionsProvider from '~sq-server-commons/components/embed-docs-modal/SuggestionsProvider';
import NCDAutoUpdateMessage from '~sq-server-commons/components/new-code-definition/NCDAutoUpdateMessage';
import Workspace from '~sq-server-commons/components/workspace/Workspace';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import IndexationContextProvider from '~sq-server-commons/context/indexation/IndexationContextProvider';
import IndexationNotification from '~sq-server-commons/context/indexation/IndexationNotification';
import MetricsContextProvider from '~sq-server-commons/context/metrics/MetricsContextProvider';
import A11ySkipLinks from '~sq-server-commons/sonar-aligned/components/a11y/A11ySkipLinks';
import { Feature } from '~sq-server-commons/types/features';
import AutodetectAIBanner from './AutodetectAIBanner';
import GlobalFooter from './GlobalFooter';
import ModeTour from './ModeTour';
import NonProductionDatabaseWarning from './NonProductionDatabaseWarning';
import StartupModal from './StartupModal';
import SystemAnnouncement from './SystemAnnouncement';
import EnableAiCodeFixMessage from './ai-codefix-notification/EnableAiCodeFixMessage';
import CalculationChangeMessage from './calculation-notification/CalculationChangeMessage';
import GlobalNav from './nav/global/GlobalNav';
import PromotionNotification from './promotion-notification/PromotionNotification';
import { UpdateNotification } from './update-notification/UpdateNotification';

/*
 * These pages need a white background (aka 'secondary', rather than the default 'primary')
 * This should be revisited at some point (why the exception?)
 */
const PAGES_WITH_SECONDARY_BACKGROUND = [
  '/tutorials',
  '/projects/create',
  '/project/baseline',
  '/project/branches',
  '/project/key',
  '/project/deletion',
  '/project/links',
  '/project/import_export',
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
  '/admin/extension/license/support',
  '/admin/audit',
  '/admin/projects_management',
  '/account/projects',
];

export default function GlobalContainer() {
  // it is important to pass `location` down to `GlobalNav` to trigger render on url change
  const location = useLocation();
  const { hasFeature } = useAvailableFeatures();
  const { canAdmin } = useAppState();

  return (
    <ThemeProvider theme={lightTheme}>
      <SuggestionsProvider>
        <A11yProvider>
          <A11ySkipLinks />
          <GlobalContainerWrapper>
            <GlobalBackground
              className="sw-box-border sw-flex-[1_0_auto]"
              id="container"
              secondary={PAGES_WITH_SECONDARY_BACKGROUND.includes(location.pathname)}
            >
              <Workspace>
                <IndexationContextProvider>
                  <MetricsContextProvider>
                    <div className="sw-sticky sw-top-0 sw-z-global-navbar" id="global-navigation">
                      <SystemAnnouncement />
                      <NonProductionDatabaseWarning />
                      {(hasFeature(Feature.FixSuggestions) ||
                        hasFeature(Feature.FixSuggestionsMarketing)) && <EnableAiCodeFixMessage />}
                      {hasFeature(Feature.AiCodeAssurance) && canAdmin && <AutodetectAIBanner />}
                      {hasFeature(Feature.Architecture) &&
                        canAdmin &&
                        addons.architecture?.ArchitectureAdminBanner({})}
                      <NCDAutoUpdateMessage />
                      <UpdateNotification isGlobalBanner />
                      <IndexationNotification />
                      <CalculationChangeMessage />
                      <GlobalNav />
                      {hasFeature(Feature.Architecture) &&
                        canAdmin &&
                        addons.architecture?.spotlight({})}
                      <ModeTour />
                      {/* The following is the portal anchor point for the component nav
                       * See ComponentContainer.tsx
                       */}
                      <div id="component-nav-portal" />
                    </div>
                    <Outlet />
                  </MetricsContextProvider>
                </IndexationContextProvider>
              </Workspace>
              <PromotionNotification />
            </GlobalBackground>
            <GlobalFooter />
          </GlobalContainerWrapper>
          <StartupModal />
        </A11yProvider>
      </SuggestionsProvider>
    </ThemeProvider>
  );
}

const GlobalContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
`;

const GlobalBackground = styled.div<{ secondary: boolean }>`
  background-color: ${({ secondary }) =>
    themeColor(secondary ? 'backgroundSecondary' : 'backgroundPrimary')};
`;
