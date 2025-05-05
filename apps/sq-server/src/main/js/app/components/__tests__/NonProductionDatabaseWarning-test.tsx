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

import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { AppState } from '~sq-server-commons/types/appstate';
import NonProductionDatabaseWarning from '../NonProductionDatabaseWarning';

const ui = {
  alert: byRole('alert'),
  alertText: byText('notification.non_production_database.warning'),
  learnMoreLink: byRole('link', {
    name: 'notification.non_production_database.learn_more open_in_new_tab',
  }),
};

it('should not show production database warning', () => {
  const { container } = render();
  expect(container).toBeEmptyDOMElement();
});

it('should show production database warning', async () => {
  render({ productionDatabase: false });
  expect(await ui.alert.find()).toBeInTheDocument();
  expect(ui.alertText.get()).toBeInTheDocument();
  expect(ui.learnMoreLink.get()).toBeInTheDocument();
});

function render(appStateOverride: Partial<AppState> = {}) {
  return renderComponent(<NonProductionDatabaseWarning />, '/', {
    appState: mockAppState({
      productionDatabase: true,
      ...appStateOverride,
    }),
  });
}
