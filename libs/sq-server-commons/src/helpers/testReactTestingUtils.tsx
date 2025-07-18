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

import { EchoesProvider } from '@sonarsource/echoes-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Matcher, RenderResult, render, screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { omit } from 'lodash';
import * as React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import {
  MemoryRouter,
  Outlet,
  Route,
  RouterProvider,
  Routes,
  createMemoryRouter,
  createRoutesFromElements,
  parsePath,
} from 'react-router-dom';
import { IntlWrapper } from '~adapters/helpers/test-utils';
import { CatchAll } from '~shared/helpers/test-utils';
import { Extension } from '~shared/types/common';
import { Metric } from '~shared/types/measures';
import AdminContext from '../context/AdminContext';
import AppStateContextProvider from '../context/app-state/AppStateContextProvider';
import { AvailableFeaturesContext } from '../context/available-features/AvailableFeaturesContext';
import { ComponentContext } from '../context/componentContext/ComponentContext';
import CurrentUserContextProvider from '../context/current-user/CurrentUserContextProvider';
import IndexationContextProvider from '../context/indexation/IndexationContextProvider';
import { MetricsContext } from '../context/metrics/MetricsContext';
import { AppState } from '../types/appstate';
import { ComponentContextShape } from '../types/component';
import { Feature } from '../types/features';
import { Component, SysStatus } from '../types/types';
import { CurrentUser } from '../types/users';
import { mockComponent } from './mocks/component';
import { DEFAULT_METRICS } from './mocks/metrics';
import { mockAppState, mockCurrentUser } from './testMocks';

export interface RenderContext {
  appState?: AppState;
  currentUser?: CurrentUser;
  featureList?: Feature[];
  metrics?: Record<string, Metric>;
  navigateTo?: string;
}

export function renderAppWithAdminContext(
  indexPath: string,
  routes: () => JSX.Element,
  context: RenderContext = {},
  overrides: { adminPages?: Extension[]; systemStatus?: SysStatus } = {},
): RenderResult {
  function MockAdminContainer() {
    return (
      <AdminContext.Provider
        value={{
          fetchSystemStatus: () => {
            /*noop*/
          },
          fetchPendingPlugins: () => {
            /*noop*/
          },
          pendingPlugins: { installing: [], removing: [], updating: [] },
          systemStatus: overrides.systemStatus ?? 'UP',
        }}
      >
        <Outlet
          context={{
            adminPages: overrides.adminPages ?? [],
          }}
        />
      </AdminContext.Provider>
    );
  }

  return renderRoutedApp(
    <Route element={<MockAdminContainer />} path="admin">
      {routes()}
    </Route>,
    indexPath,
    context,
  );
}

export function renderComponent(
  component: React.ReactElement,
  pathname = '/',
  {
    appState = mockAppState(),
    featureList = [],
    currentUser = mockCurrentUser(),
  }: RenderContext = {},
) {
  function Wrapper({ children }: Readonly<React.PropsWithChildren<{}>>) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return (
      <IntlWrapper>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <AvailableFeaturesContext.Provider value={featureList}>
              <CurrentUserContextProvider currentUser={currentUser}>
                <AppStateContextProvider appState={appState}>
                  <MemoryRouter initialEntries={[pathname]}>
                    <EchoesProvider tooltipsDelayDuration={0}>
                      <Routes>
                        <Route element={children} path="*" />
                      </Routes>
                    </EchoesProvider>
                  </MemoryRouter>
                </AppStateContextProvider>
              </CurrentUserContextProvider>
            </AvailableFeaturesContext.Provider>
          </HelmetProvider>
        </QueryClientProvider>
      </IntlWrapper>
    );
  }

  return render(component, { wrapper: Wrapper });
}

export function renderAppWithComponentContext(
  indexPath: string,
  routes: () => JSX.Element,
  context: RenderContext = {},
  componentContext: Partial<ComponentContextShape> = {},
) {
  function MockComponentContainer() {
    const [realComponent, setRealComponent] = React.useState(
      componentContext?.component ?? mockComponent(),
    );
    return (
      <ComponentContext.Provider
        value={{
          onComponentChange: (changes: Partial<Component>) => {
            setRealComponent({ ...realComponent, ...changes });
          },
          fetchComponent: jest.fn(),
          component: realComponent,
          ...omit(componentContext, 'component'),
        }}
      >
        <Outlet />
      </ComponentContext.Provider>
    );
  }

  return renderRoutedApp(
    <Route element={<MockComponentContainer />}>{routes()}</Route>,
    indexPath,
    context,
  );
}

export function renderApp(
  indexPath: string,
  component: JSX.Element,
  context: RenderContext = {},
): RenderResult {
  return renderRoutedApp(<Route element={component} path={indexPath} />, indexPath, context);
}

export function renderAppRoutes(
  indexPath: string,
  routes: () => JSX.Element,
  context?: RenderContext,
): RenderResult {
  return renderRoutedApp(routes(), indexPath, context);
}

function renderRoutedApp(
  children: React.ReactElement,
  indexPath: string,
  {
    currentUser = mockCurrentUser(),
    navigateTo = indexPath,
    metrics = DEFAULT_METRICS,
    appState = mockAppState(),
    featureList = [],
  }: RenderContext = {},
): RenderResult {
  const path = parsePath(navigateTo);
  if (!path.pathname?.startsWith('/')) {
    path.pathname = `/${path.pathname}`;
  }
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const router = createMemoryRouter(
    createRoutesFromElements(
      <Route
        element={
          <EchoesProvider tooltipsDelayDuration={0}>
            <Outlet />
          </EchoesProvider>
        }
      >
        {children}
        <Route element={<CatchAll backPath={path} />} path="*" />
      </Route>,
    ),
    { initialEntries: [path] },
  );
  return render(
    <HelmetProvider context={{}}>
      <IntlWrapper>
        <MetricsContext.Provider value={metrics}>
          <AvailableFeaturesContext.Provider value={featureList}>
            <CurrentUserContextProvider currentUser={currentUser}>
              <AppStateContextProvider appState={appState}>
                <IndexationContextProvider>
                  <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                  </QueryClientProvider>
                </IndexationContextProvider>
              </AppStateContextProvider>
            </CurrentUserContextProvider>
          </AvailableFeaturesContext.Provider>
        </MetricsContext.Provider>
      </IntlWrapper>
    </HelmetProvider>,
  );
}

export function dateInputEvent(user: UserEvent) {
  return {
    async pickDate(element: HTMLElement, date: Date) {
      await user.click(element);

      const formatter = new Intl.DateTimeFormat('en', { month: 'long' });

      await user.selectOptions(
        await screen.findByRole('combobox', { name: 'Month:' }),
        formatter.format(date),
      );
      await user.selectOptions(
        screen.getByRole('combobox', { name: 'Year:' }),
        String(date.getFullYear()),
      );

      await user.click(screen.getByRole('gridcell', { name: String(date.getDate()) }));
    },
  };
}
/* eslint-enable testing-library/no-node-access */

/**
 * @deprecated Use our custom toHaveATooltipWithContent() matcher instead.
 */
export function findTooltipWithContent(
  text: Matcher,
  target?: HTMLElement,
  selector = 'svg > desc',
) {
  // eslint-disable-next-line no-console
  console.warn(`The usage of findTooltipWithContent() is deprecated; use expect.toHaveATooltipWithContent() instead.
Example:
  await expect(node).toHaveATooltipWithContent('foo.bar');`);
  return target
    ? within(target).getByText(text, { selector })
    : screen.getByText(text, { selector });
}
