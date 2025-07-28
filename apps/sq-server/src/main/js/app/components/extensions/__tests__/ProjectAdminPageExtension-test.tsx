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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '~shared/helpers/test-utils';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import { getExtensionStart } from '~sq-server-commons/helpers/extensions';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { ComponentContextShape } from '~sq-server-commons/types/component';
import { Component } from '~sq-server-commons/types/types';
import ProjectAdminPageExtension from '../ProjectAdminPageExtension';

jest.mock('~sq-server-commons/helpers/extensions', () => ({
  getExtensionStart: jest.fn().mockResolvedValue(jest.fn()),
}));

it('should render correctly when the extension is found', () => {
  renderProjectAdminPageExtension(
    mockComponent({
      configuration: { extensions: [{ key: 'pluginId/extensionId', name: 'name' }] },
    }),
    { pluginKey: 'pluginId', extensionKey: 'extensionId' },
  );
  expect(getExtensionStart).toHaveBeenCalledWith('pluginId/extensionId');
});

it('should render correctly when the extension is not found', () => {
  renderProjectAdminPageExtension(
    mockComponent({ extensions: [{ key: 'pluginId/extensionId', name: 'name' }] }),
    { pluginKey: 'not-found-plugin', extensionKey: 'not-found-extension' },
  );
  expect(screen.getByText('page_not_found')).toBeInTheDocument();
});

function renderProjectAdminPageExtension(
  component: Component,
  params: {
    extensionKey: string;
    pluginKey: string;
  },
) {
  const { pluginKey, extensionKey } = params;
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={{}}>
        <IntlProvider defaultLocale="en" locale="en">
          <ComponentContext.Provider value={{ component } as ComponentContextShape}>
            <MemoryRouter initialEntries={[`/${pluginKey}/${extensionKey}`]}>
              <Routes>
                <Route element={<ProjectAdminPageExtension />} path="/:pluginKey/:extensionKey" />
              </Routes>
            </MemoryRouter>
          </ComponentContext.Provider>
        </IntlProvider>
      </HelmetProvider>
    </QueryClientProvider>,
  );
}
