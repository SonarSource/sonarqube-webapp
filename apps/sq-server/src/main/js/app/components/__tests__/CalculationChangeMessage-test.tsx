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

import { Outlet, Route } from 'react-router-dom';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import { renderAppRoutes } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { Mode } from '~sq-server-commons/types/mode';
import CalculationChangeMessage from '../calculation-notification/CalculationChangeMessage';

const ui = {
  alert: byRole('alert'),
  learnMoreLink: byRole('link', {
    name: 'notification.calculation_change.message_link open_in_new_tab',
  }),

  alertText: byText('notification.calculation_change.message'),
};

const modeHandler = new ModeServiceMock();

beforeEach(() => {
  modeHandler.reset();
});

it.each([
  ['Project', '/projects'],
  ['Favorite Project', '/projects/favorite'],
  ['Portfolios', '/portfolios'],
])('should render on %s page', (_, path) => {
  render(path);
  expect(ui.alert.get()).toBeInTheDocument();
  expect(ui.alertText.get()).toBeInTheDocument();
  expect(ui.learnMoreLink.get()).toBeInTheDocument();
});

it.each([
  ['Project', '/projects'],
  ['Favorite Project', '/projects/favorite'],
  ['Portfolios', '/portfolios'],
])('should not render on %s page if isStandardMode', (_, path) => {
  modeHandler.setMode(Mode.Standard);
  render(path);
  expect(ui.alert.get()).toBeInTheDocument();
  expect(ui.alertText.get()).toBeInTheDocument();
  expect(ui.learnMoreLink.get()).toBeInTheDocument();
});

it('should not render on other page', () => {
  render('/other');
  expect(ui.alert.query()).not.toBeInTheDocument();
  expect(ui.alertText.query()).not.toBeInTheDocument();
  expect(ui.learnMoreLink.query()).not.toBeInTheDocument();
});

function render(indexPath = '/projects') {
  renderAppRoutes(indexPath, () => (
    <Route
      element={
        <>
          <CalculationChangeMessage />
          <Outlet />
        </>
      }
      path="/"
    >
      <Route element={<div>Projects</div>} path="projects" />
      <Route element={<div>Favorite Projects</div>} path="projects/favorite" />
      <Route element={<div>Portfolios</div>} path="portfolios" />
      <Route element={<div>Other page</div>} path="other" />
    </Route>
  ));
}
