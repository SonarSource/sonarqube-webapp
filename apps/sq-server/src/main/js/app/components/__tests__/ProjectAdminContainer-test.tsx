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

import { Route } from 'react-router-dom';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { renderAppRoutes } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import handleRequiredAuthorization from '../../utils/handleRequiredAuthorization';
import { ProjectAdminContainer } from '../ProjectAdminContainer';

jest.mock('../../utils/handleRequiredAuthorization', () => {
  return jest.fn();
});

it('should render correctly', () => {
  renderProjectAdminContainer();

  expect(byText('children').get()).toBeInTheDocument();
});

it('should redirect for authorization if needed', () => {
  jest.useFakeTimers();
  renderProjectAdminContainer({
    component: mockComponent({ configuration: { showSettings: false } }),
  });
  jest.runAllTimers();
  expect(handleRequiredAuthorization).toHaveBeenCalled();
  jest.useRealTimers();
});

function renderProjectAdminContainer(props: Partial<ProjectAdminContainer['props']> = {}) {
  return renderAppRoutes('project/settings', () => (
    <Route
      element={
        <ProjectAdminContainer
          component={mockComponent({ configuration: { showSettings: true } })}
          {...props}
        />
      }
      path="project/settings"
    >
      <Route element={<div>children</div>} index />
    </Route>
  ));
}
