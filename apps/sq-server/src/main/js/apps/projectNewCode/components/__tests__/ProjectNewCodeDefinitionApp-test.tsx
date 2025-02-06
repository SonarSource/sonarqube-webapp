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

import { screen, waitFor } from '@testing-library/react';
import BranchesServiceMock from '~sq-server-shared/api/mocks/BranchesServiceMock';
import MessagesServiceMock from '~sq-server-shared/api/mocks/MessagesServiceMock';
import NewCodeDefinitionServiceMock from '~sq-server-shared/api/mocks/NewCodeDefinitionServiceMock';
import { ProjectActivityServiceMock } from '~sq-server-shared/api/mocks/ProjectActivityServiceMock';
import { mockComponent } from '~sq-server-shared/helpers/mocks/component';
import { mockAppState } from '~sq-server-shared/helpers/testMocks';
import {
  RenderContext,
  renderAppWithComponentContext,
} from '~sq-server-shared/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { Feature } from '~sq-server-shared/types/features';
import routes from '../../routes';

const newCodeDefinitionMock = new NewCodeDefinitionServiceMock();
const projectActivityMock = new ProjectActivityServiceMock();
const branchHandler = new BranchesServiceMock();
const messagesMock = new MessagesServiceMock();
jest.mock('~addons/index', () => ({
  addons: {},
}));

describe('add-ons', () => {
  beforeEach(() => {
    branchHandler.reset();
    newCodeDefinitionMock.reset();
    projectActivityMock.reset();
    messagesMock.reset();
  });

  it('should not render BranchListSection when branch support is enabled and addons is undefined', async () => {
    const { ui } = getPageObjects();
    renderProjectNewCodeDefinitionApp({
      featureList: [Feature.BranchSupport],
      appState: mockAppState({ canAdmin: true }),
    });

    await waitFor(() => ui.appIsLoaded());

    expect(screen.queryByText('project_baseline.configure_branches')).not.toBeInTheDocument();
  });

  it('should not render BranchListSection when branch support is disabled and addons is undefined', async () => {
    const { ui } = getPageObjects();
    renderProjectNewCodeDefinitionApp();

    await waitFor(() => ui.appIsLoaded());

    expect(screen.queryByText('project_baseline.configure_branches')).not.toBeInTheDocument();
  });
});

function renderProjectNewCodeDefinitionApp(context: RenderContext = {}, params?: string) {
  return renderAppWithComponentContext(
    'baseline',
    routes,
    {
      ...context,
      navigateTo: params ? `baseline?id=my-project&${params}` : 'baseline?id=my-project',
    },
    {
      component: mockComponent(),
    },
  );
}

function getPageObjects() {
  const ui = {
    pageHeading: byRole('heading', { name: 'project_baseline.page' }),
    branchListHeading: byText('project_baseline.configure_branches'),
  };

  async function appIsLoaded() {
    expect(await ui.pageHeading.find()).toBeInTheDocument();
  }

  return {
    ui: {
      ...ui,
      appIsLoaded,
    },
  };
}
