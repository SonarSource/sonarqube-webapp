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

import { ThemeProvider } from '@emotion/react';
import { EchoesProvider } from '@sonarsource/echoes-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRoot } from 'react-dom/client';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { IntlShape, RawIntlProvider } from 'react-intl';
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import { lightTheme } from '~design-system';
import { A11yProvider } from '~shared/components/a11y/A11yProvider';
import { ResetLayerStack } from '~shared/components/ResetLayerStack';
import StateCallbackHandler from '~shared/components/StateCallbackHandler';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import SuggestionsProvider from '~sq-server-commons/components/embed-docs-modal/SuggestionsProvider';
import { AddonsContext } from '~sq-server-commons/context/addons/AddonsContext';
import { DEFAULT_APP_STATE } from '~sq-server-commons/context/app-state/AppStateContext';
import AppStateContextProvider from '~sq-server-commons/context/app-state/AppStateContextProvider';
import {
  AvailableFeaturesContext,
  DEFAULT_AVAILABLE_FEATURES,
} from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import CurrentUserContextProvider from '~sq-server-commons/context/current-user/CurrentUserContextProvider';
import IndexationContextProvider from '~sq-server-commons/context/indexation/IndexationContextProvider';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { queryClient } from '~sq-server-commons/queries/queryClient';
import A11ySkipLinks from '~sq-server-commons/sonar-aligned/components/a11y/A11ySkipLinks';
import { AppState } from '~sq-server-commons/types/appstate';
import { Feature } from '~sq-server-commons/types/features';
import { CurrentUser } from '~sq-server-commons/types/users';
import accountRoutes from '../../apps/account/routes';
import auditLogsRoutes from '../../apps/audit-logs/routes';
import backgroundTasksRoutes from '../../apps/background-tasks/routes';
import codeRoutes from '../../apps/code/routes';
import codingRulesRoutes from '../../apps/coding-rules/routes';
import componentMeasuresRoutes from '../../apps/component-measures/routes';
import groupsRoutes from '../../apps/groups/routes';
import { globalIssuesRoutes, projectIssuesRoutes } from '../../apps/issues/routes';
import maintenanceRoutes from '../../apps/maintenance/routes';
import marketplaceRoutes from '../../apps/marketplace/routes';
import SlackOAuthCallback from '../../apps/oauth/SlackOAuthCallback';
import overviewRoutes from '../../apps/overview/routes';
import permissionTemplatesRoutes from '../../apps/permission-templates/routes';
import { globalPermissionsRoutes, projectPermissionsRoutes } from '../../apps/permissions/routes';
import projectActivityRoutes from '../../apps/projectActivity/routes';
import projectDeletionRoutes from '../../apps/projectDeletion/routes';
import projectDumpRoutes from '../../apps/projectDump/routes';
import projectInfoRoutes from '../../apps/projectInformation/routes';
import projectKeyRoutes from '../../apps/projectKey/routes';
import projectLinksRoutes from '../../apps/projectLinks/routes';
import projectNewCodeDefinitionRoutes from '../../apps/projectNewCode/routes';
import projectQualityGateRoutes from '../../apps/projectQualityGate/routes';
import projectQualityProfilesRoutes from '../../apps/projectQualityProfiles/routes';
import projectsRoutes from '../../apps/projects/routes';
import projectsManagementRoutes from '../../apps/projectsManagement/routes';
import qualityGatesRoutes from '../../apps/quality-gates/routes';
import qualityProfilesRoutes from '../../apps/quality-profiles/routes';
import securityHotspotsRoutes from '../../apps/security-hotspots/routes';
import sessionsRoutes from '../../apps/sessions/routes';
import settingsRoutes from '../../apps/settings/routes';
import systemRoutes from '../../apps/system/routes';
import tutorialsRoutes from '../../apps/tutorials/routes';
import usersRoutes from '../../apps/users/routes';
import webAPIRoutesV2 from '../../apps/web-api-v2/routes';
import webAPIRoutes from '../../apps/web-api/routes';
import webhooksRoutes from '../../apps/webhooks/routes';
import AdminContainer from '../components/AdminContainer';
import AdminContainerLegacy from '../components/AdminContainerLegacy';
import App from '../components/App';
import ComponentContainer from '../components/ComponentContainer';
import DocumentationRedirect from '../components/DocumentationRedirect';
import { projectAdminExtensionMigratedRoutes } from '../components/extensions/Extension';
import GlobalAdminPageExtension from '../components/extensions/GlobalAdminPageExtension';
import GlobalPageExtension from '../components/extensions/GlobalPageExtension';
import PortfoliosPage from '../components/extensions/PortfoliosPage';
import ProjectAdminPageExtension from '../components/extensions/ProjectAdminPageExtension';
import ProjectPageExtension from '../components/extensions/ProjectPageExtension';
import GlobalContainer from '../components/GlobalContainer';
import Landing from '../components/Landing';
import MigrationContainer from '../components/MigrationContainer';
import NonAdminPagesContainer from '../components/NonAdminPagesContainer';
import NotFound from '../components/NotFound';
import ProjectAdminContainer from '../components/ProjectAdminContainer';
import SimpleContainer from '../components/SimpleContainer';
import { GlobalStyles } from '../styles/GlobalStyles';
import exportModulesAsGlobals from './exportModulesAsGlobals';

function renderComponentRoutes({
  hasArchitectureFeature,
  hasBranchSupport,
  hasScaFeature,
  hasAicaFeature,
  hasPortfolioFeature,
}: {
  hasAicaFeature: boolean;
  hasArchitectureFeature: boolean;
  hasBranchSupport: boolean;
  hasPortfolioFeature: boolean;
  hasScaFeature: boolean;
}) {
  return (
    <Route element={<ComponentContainer />}>
      {/* This container is a catch-all for all non-admin pages */}
      <Route element={<NonAdminPagesContainer />}>
        {codeRoutes()}
        {componentMeasuresRoutes()}
        {overviewRoutes()}
        {hasPortfolioFeature && addons.portfolios?.routes()}
        {projectActivityRoutes()}
        <Route
          element={<ProjectPageExtension />}
          path="project/extension/:pluginKey/:extensionKey"
        />
        {hasArchitectureFeature && addons.architecture?.routes()}
        {projectIssuesRoutes()}
        {hasScaFeature && addons?.sca?.projectRoutes}
        {securityHotspotsRoutes()}
        {projectQualityGateRoutes()}
        {projectQualityProfilesRoutes()}
        {projectInfoRoutes()}

        {tutorialsRoutes()}
      </Route>

      <Route path="project">
        {/* Pages migrated to the new layout get their <main> from Layout.PageContent */}
        <Route element={<ProjectAdminContainer skipMainWrapper />}>
          {/* Migrated extensions - explicit routes based on EXTENSION_PAGE_TEMPLATES */}
          {projectAdminExtensionMigratedRoutes()}

          {hasBranchSupport && addons.branches?.routes()}
          {hasAicaFeature && addons.aica?.aicaSettingsRoutes()}

          {projectDeletionRoutes()}
          {projectDumpRoutes()}
          {projectKeyRoutes()}
          {projectLinksRoutes()}
          {projectNewCodeDefinitionRoutes()}
          {settingsRoutes()}
          {webhooksRoutes()}
        </Route>

        {/* Pages not yet using new layout - ProjectAdminContainer provides <main> wrapper */}
        <Route element={<ProjectAdminContainer />}>
          {/* Non-migrated extensions (from Sonar or 3rd-party ones) */}
          <Route
            element={<ProjectAdminPageExtension />}
            path="admin/extension/:pluginKey/:extensionKey"
          />

          {backgroundTasksRoutes()}
        </Route>
      </Route>
      <Route element={<ProjectAdminContainer skipMainWrapper />}>
        {projectPermissionsRoutes()}
      </Route>
    </Route>
  );
}

function renderAdminRoutes() {
  return (
    <Route path="admin">
      <Route element={<AdminContainerLegacy />}>
        <Route element={<GlobalAdminPageExtension />} path="extension/:pluginKey/:extensionKey" />
      </Route>
      <Route element={<AdminContainer />}>
        {auditLogsRoutes()}
        {backgroundTasksRoutes()}
        {globalPermissionsRoutes()}
        {groupsRoutes()}
        {addons.license?.routes()}
        {marketplaceRoutes()}
        {permissionTemplatesRoutes()}
        {projectsManagementRoutes()}
        {settingsRoutes()}
        {systemRoutes()}
        {usersRoutes()}
        {webhooksRoutes()}
      </Route>
    </Route>
  );
}

function renderRedirects() {
  return (
    <>
      {/*
       * This redirect enables analyzers and PDFs to link to the correct version of the
       * documentation without having to compute the direct links themselves (DRYer).
       */}
      <Route element={<DocumentationRedirect />} path="/documentation/*" />
    </>
  );
}

const FormattingHelp = lazyLoadComponent(() => import('../components/FormattingHelp'));
const SonarLintConnection = lazyLoadComponent(() => import('../components/SonarLintConnection'));
const ResetPassword = lazyLoadComponent(() => import('../components/ResetPassword'));
const ChangeAdminPasswordApp = lazyLoadComponent(
  () => import('../../apps/change-admin-password/ChangeAdminPasswordApp'),
);
const PluginRiskConsent = lazyLoadComponent(() => import('../components/PluginRiskConsent'));

const router = ({
  availableFeatures,
  governanceInstalled,
  optInFeatures,
}: {
  availableFeatures: Feature[];
  governanceInstalled: boolean;
  optInFeatures: Feature[];
}) =>
  createBrowserRouter(
    createRoutesFromElements(
      // Wrapper to set containers and providers that need access to the router context for all routes.
      // This way we can use router context in toast message, for example render links
      <Route
        element={
          <EchoesProvider>
            <ResetLayerStack>
              <SuggestionsProvider>
                <A11yProvider>
                  <A11ySkipLinks />
                  <IndexationContextProvider>
                    <Outlet />
                  </IndexationContextProvider>
                </A11yProvider>
              </SuggestionsProvider>
            </ResetLayerStack>
          </EchoesProvider>
        }
      >
        {renderRedirects()}

        <Route element={<FormattingHelp />} path="formatting/help" />

        <Route element={<SimpleContainer />}>{maintenanceRoutes()}</Route>

        <Route element={<MigrationContainer />}>
          {sessionsRoutes()}

          <Route element={<App />} path="/">
            <Route element={<Landing />} index />

            <Route element={<GlobalContainer />}>
              {accountRoutes()}

              {codingRulesRoutes()}

              <Route element={<GlobalPageExtension />} path="extension/:pluginKey/:extensionKey" />

              {globalIssuesRoutes()}

              {projectsRoutes()}

              {qualityGatesRoutes()}
              {qualityProfilesRoutes()}

              <Route element={<PortfoliosPage />} path="portfolios" />

              <Route element={<SonarLintConnection />} path="sonarlint/auth" />

              {webAPIRoutes()}
              {webAPIRoutesV2()}

              {renderComponentRoutes({
                hasArchitectureFeature:
                  availableFeatures.includes(Feature.Architecture) &&
                  optInFeatures.includes(Feature.Architecture),
                hasBranchSupport: availableFeatures.includes(Feature.BranchSupport),
                hasScaFeature: availableFeatures.includes(Feature.Sca),
                hasAicaFeature: availableFeatures.includes(Feature.AiCodeAssurance),
                hasPortfolioFeature: governanceInstalled,
              })}

              {availableFeatures.includes(Feature.Sca) && addons.sca?.licenseRoutes}

              {renderAdminRoutes()}

              <Route element={<StateCallbackHandler />} path="callback" />
            </Route>
            <Route
              // We don't want this route to have any menu.
              // That is why we can not have it under the accountRoutes
              element={<ResetPassword />}
              path="account/reset_password"
            />

            <Route
              // We don't want this route to have any menu. This is why we define it here
              // rather than under the admin routes.
              element={<ChangeAdminPasswordApp />}
              path="admin/change_admin_password"
            />

            <Route
              // We don't want this route to have any menu. This is why we define it here
              // rather than under the admin routes.
              element={<PluginRiskConsent />}
              path="admin/plugin_risk_consent"
            />

            <Route element={<SimpleContainer />}>
              <Route element={<NotFound />} path="not_found" />
              <Route element={<NotFound />} path="*" />

              <Route path="oauth-callback">
                <Route element={<SlackOAuthCallback />} path="slack" />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>,
    ),
    { basename: getBaseUrl() },
  );

export default function startReactApp(
  l10nBundle: IntlShape,
  currentUser?: CurrentUser,
  appState?: AppState,
  availableFeatures: Feature[] = DEFAULT_AVAILABLE_FEATURES,
  optInFeatures: Feature[] = [],
) {
  exportModulesAsGlobals();

  const el = document.getElementById('content');
  const root = createRoot(el as HTMLElement);
  const governanceInstalled = Boolean(appState?.qualifiers.includes(ComponentQualifier.Project));

  root.render(
    <HelmetProvider>
      <AppStateContextProvider appState={appState ?? DEFAULT_APP_STATE}>
        <AvailableFeaturesContext.Provider value={availableFeatures}>
          <AddonsContext.Provider value={addons}>
            <CurrentUserContextProvider currentUser={currentUser}>
              <RawIntlProvider value={l10nBundle}>
                <ThemeProvider theme={lightTheme}>
                  <QueryClientProvider client={queryClient}>
                    <GlobalStyles />
                    <Helmet titleTemplate={translate('page_title.template.default')} />

                    <RouterProvider
                      router={router({ availableFeatures, optInFeatures, governanceInstalled })}
                    />

                    <ReactQueryDevtools initialIsOpen={false} />
                  </QueryClientProvider>
                </ThemeProvider>
              </RawIntlProvider>
            </CurrentUserContextProvider>
          </AddonsContext.Provider>
        </AvailableFeaturesContext.Provider>
      </AppStateContextProvider>
    </HelmetProvider>,
  );
}
