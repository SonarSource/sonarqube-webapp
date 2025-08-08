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
import React, { ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { IntlWrapper } from '~adapters/helpers/test-utils';
import { render, RenderContextOptions } from '~shared/helpers/test-utils';

export { render, renderWithContext } from '~shared/helpers/test-utils';

interface RenderRouterOptions {
  additionalRoutes?: ReactNode;
}

export function renderWithRouter(
  ui: React.ReactElement,
  options: RenderContextOptions & RenderRouterOptions = {},
) {
  const { additionalRoutes, userEventOptions, ...renderOptions } = options;

  function RouterWrapper({ children }: React.PropsWithChildren<object>) {
    return (
      <HelmetProvider>
        <IntlWrapper>
          <MemoryRouter>
            <Routes>
              <Route
                element={
                  <EchoesProvider tooltipsDelayDuration={0}>
                    <Outlet />
                  </EchoesProvider>
                }
              >
                <Route element={children} path="/" />
                {additionalRoutes}
              </Route>
            </Routes>
          </MemoryRouter>
        </IntlWrapper>
      </HelmetProvider>
    );
  }

  return render(ui, { ...renderOptions, wrapper: RouterWrapper }, userEventOptions);
}
