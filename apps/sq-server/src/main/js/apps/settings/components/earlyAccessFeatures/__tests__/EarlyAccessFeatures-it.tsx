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

import { byRole, byText } from '~shared/helpers/testSelector';
import FixSuggestionsServiceMock from '~sq-server-commons/api/mocks/FixSuggestionsServiceMock';
import ProjectManagementServiceMock from '~sq-server-commons/api/mocks/ProjectsManagementServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import SystemServiceMock from '~sq-server-commons/api/mocks/SystemServiceMock';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { EarlyAccessFeatures } from '../EarlyAccessFeatures';

let fixSuggestionsServiceMock: FixSuggestionsServiceMock;
let projectManagementServiceMock: ProjectManagementServiceMock;
let settingServiceMock: SettingsServiceMock;
let systemMock: SystemServiceMock;

beforeAll(() => {
  settingServiceMock = new SettingsServiceMock();
  fixSuggestionsServiceMock = new FixSuggestionsServiceMock();
  projectManagementServiceMock = new ProjectManagementServiceMock(settingServiceMock);
  systemMock = new SystemServiceMock();
});

afterEach(() => {
  settingServiceMock.reset();
  fixSuggestionsServiceMock.reset();
  projectManagementServiceMock.reset();
  systemMock.reset();
});

const ui = {
  pageTitle: byRole('heading', { name: 'settings.early_access.title' }),
  pageDesc: byText('settings.early_access.description'),
};

describe('early access features', () => {
  it('should render early access features page', async () => {
    renderEarlyAccessFeatures();

    expect(await ui.pageTitle.find()).toBeInTheDocument();
    expect(ui.pageDesc.get()).toBeInTheDocument();
  });
});

function renderEarlyAccessFeatures() {
  return renderComponent(<EarlyAccessFeatures />);
}
