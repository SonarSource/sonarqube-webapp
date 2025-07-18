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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlmIntegrationsServiceMock from '~sq-server-commons/api/mocks/AlmIntegrationsServiceMock';
import DopTranslationServiceMock from '~sq-server-commons/api/mocks/DopTranslationServiceMock';
import NewCodeDefinitionServiceMock from '~sq-server-commons/api/mocks/NewCodeDefinitionServiceMock';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import CreateProjectPage from '../CreateProjectPage';

jest.mock('~sq-server-commons/api/alm-integrations');
jest.mock('~sq-server-commons/api/alm-settings');

let almIntegrationHandler: AlmIntegrationsServiceMock;
let dopTranslationHandler: DopTranslationServiceMock;
let newCodePeriodHandler: NewCodeDefinitionServiceMock;

const original = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { replace: jest.fn() },
  });
  almIntegrationHandler = new AlmIntegrationsServiceMock();
  dopTranslationHandler = new DopTranslationServiceMock();
  newCodePeriodHandler = new NewCodeDefinitionServiceMock();
});

beforeEach(() => {
  jest.clearAllMocks();
  almIntegrationHandler.reset();
  dopTranslationHandler.reset();
  newCodePeriodHandler.reset();
});
afterAll(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: original });
});

it('should be able to setup if no config and admin', async () => {
  dopTranslationHandler.removeDopTypeFromSettings(AlmKeys.Azure);
  renderCreateProject(true);
  expect(await screen.findByText('onboarding.create_project.select_method')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'setup' })).toBeInTheDocument();
});

it('should not be able to setup if no config and no admin rights', async () => {
  const user = userEvent.setup();
  dopTranslationHandler.removeDopTypeFromSettings(AlmKeys.Azure);
  renderCreateProject();
  expect(await screen.findByText('onboarding.create_project.select_method')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'setup' })).not.toBeInTheDocument();

  const helpTooltipButton = await screen.findByLabelText('toggletip.help');
  await user.click(helpTooltipButton);

  expect(
    await screen.findByText('onboarding.create_project.alm_not_configured'),
  ).toBeInTheDocument();
});

it('should be able to setup if config is present', async () => {
  renderCreateProject();
  expect(await screen.findByText('onboarding.create_project.select_method')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'onboarding.create_project.import_select_method.bitbucket' }),
  ).toBeInTheDocument();
});

function renderCreateProject(canAdmin = false) {
  renderApp('project/create', <CreateProjectPage />, {
    appState: mockAppState({ canAdmin }),
  });
}
