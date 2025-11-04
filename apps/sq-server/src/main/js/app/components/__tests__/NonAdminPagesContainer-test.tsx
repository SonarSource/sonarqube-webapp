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

import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '~shared/helpers/test-utils';
import { ComponentQualifier } from '~shared/types/component';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { ComponentContextShape } from '~sq-server-commons/types/component';
import { Component } from '~sq-server-commons/types/types';
import NonAdminPagesContainer from '../NonAdminPagesContainer';

function Child() {
  return <div>Test Child</div>;
}

it('should render correctly for an user that does not have access to all children', () => {
  renderNonAdminPagesContainer(
    mockComponent({ qualifier: ComponentQualifier.Application, canBrowseAllChildProjects: false }),
  );
  expect(screen.getByText(/^application.cannot_access_all_child_projects1/)).toBeInTheDocument();
});

it('should render correctly', () => {
  renderNonAdminPagesContainer(mockComponent());
  expect(screen.getByText('Test Child')).toBeInTheDocument();
});

function renderNonAdminPagesContainer(component: Component) {
  return render(
    <ComponentContext.Provider value={{ component } as ComponentContextShape}>
      <MemoryRouter>
        <Routes>
          <Route element={<NonAdminPagesContainer />}>
            <Route element={<Child />} path="*" />
          </Route>
        </Routes>
      </MemoryRouter>
    </ComponentContext.Provider>,
  );
}
