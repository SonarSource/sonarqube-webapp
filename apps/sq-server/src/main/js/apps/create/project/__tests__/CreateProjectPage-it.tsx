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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockLocation } from '~shared/helpers/mocks/router';
import AlmIntegrationsServiceMock from '~sq-server-commons/api/mocks/AlmIntegrationsServiceMock';
import DopTranslationServiceMock from '~sq-server-commons/api/mocks/DopTranslationServiceMock';
import { mockDopSetting } from '~sq-server-commons/api/mocks/data/dop-translation';
import NewCodeDefinitionServiceMock from '~sq-server-commons/api/mocks/NewCodeDefinitionServiceMock';
import { mockAppState, mockRouter } from '~sq-server-commons/helpers/testMocks';
import { renderApp, renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AlmBindingDefinitionBase, AlmKeys } from '~sq-server-commons/types/alm-settings';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import { Feature } from '~sq-server-commons/types/features';
import CreateProjectPage, {
  CreateProjectPage as UnwrappedCreateProjectPage,
} from '../CreateProjectPage';

jest.mock('~sq-server-commons/api/alm-integrations');
jest.mock('~sq-server-commons/api/alm-settings');
jest.mock('../../../settings/components/almIntegration/AlmBindingDefinitionForm', () => ({
  AlmBindingDefinitionForm: ({
    afterSubmit,
  }: {
    afterSubmit: (data: AlmBindingDefinitionBase) => void;
  }) =>
    jest.requireActual<typeof import('react')>('react').createElement(
      'button',
      {
        onClick: () => {
          afterSubmit({ key: 'conf-final-3' });
        },
        type: 'button',
      },
      'submit-definition',
    ),
}));

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
  const user = userEvent.setup();
  dopTranslationHandler.removeDopTypeFromSettings(AlmKeys.Azure);
  renderCreateProject(true);
  expect(await screen.findByText('onboarding.create_project.select_method')).toBeInTheDocument();

  await user.click(await screen.findByRole('radio', { name: 'alm.azure' }));

  expect(
    await screen.findByRole('button', { name: 'onboarding.create_project.configure.create' }),
  ).toBeInTheDocument();
});

it('should not be able to setup if no config and no admin rights', async () => {
  dopTranslationHandler.removeDopTypeFromSettings(AlmKeys.Azure);
  renderCreateProject();
  expect(await screen.findByText('onboarding.create_project.select_method')).toBeInTheDocument();

  expect(await screen.findByRole('radio', { name: 'alm.azure' })).toBeDisabled();
  expect(screen.getByText('onboarding.create_project.configure.contact_admin')).toBeInTheDocument();
});

it('should be able to continue to the import step if config is present', async () => {
  const user = userEvent.setup();
  renderCreateProject();
  expect(await screen.findByText('onboarding.create_project.select_method')).toBeInTheDocument();

  await user.click(
    await screen.findByRole('radio', {
      name: 'onboarding.create_project.configure.bitbucket_server_card',
    }),
  );
  const selectedConfiguration = screen.getByRole('combobox', {
    name: /alm.configuration.selector.label/,
  });
  await user.click(selectedConfiguration);
  await user.click((await screen.findAllByRole('option'))[0]);

  expect(
    screen.getByRole('button', { name: 'onboarding.create_project.configure.continue' }),
  ).toBeEnabled();
});

it('carries location.state.from into the import step when no redirect query param is present', async () => {
  const user = userEvent.setup();
  const router = mockRouter();
  renderComponent(
    <UnwrappedCreateProjectPage
      hasFeature={() => false}
      location={mockLocation({ pathname: '/project/create', state: { from: '/some/page' } })}
      router={router}
    />,
  );

  await user.click(
    await screen.findByRole('radio', {
      name: 'onboarding.create_project.configure.bitbucket_server_card',
    }),
  );
  await user.click(await screen.findByRole('combobox'));
  await user.click((await screen.findAllByRole('option'))[0]);
  await user.click(
    screen.getByRole('button', { name: 'onboarding.create_project.configure.continue' }),
  );

  expect(router.push).toHaveBeenCalledWith({
    pathname: '/project/create',
    query: {
      dopSetting: 'conf-bitbucketserver-1',
      mode: CreateProjectModes.BitbucketServer,
      redirect: '/some/page',
    },
  });
});

it('continues to the import step with the newly created configuration selected', async () => {
  const user = userEvent.setup();
  const router = mockRouter();
  dopTranslationHandler.dopSettings = [
    ...dopTranslationHandler.dopSettings,
    mockDopSetting({ id: 'new-gitlab-id', key: 'conf-final-3', type: AlmKeys.GitLab }),
  ];
  renderComponent(
    <UnwrappedCreateProjectPage
      hasFeature={() => true}
      location={mockLocation({ pathname: '/project/create' })}
      router={router}
    />,
    undefined,
    { appState: mockAppState({ canAdmin: true }), featureList: [Feature.MultipleAlm] },
  );

  await user.click(await screen.findByRole('radio', { name: 'alm.gitlab' }));
  await user.click(
    screen.getByRole('button', { name: 'onboarding.create_project.configure.create_another' }),
  );
  await user.click(await screen.findByRole('button', { name: 'submit-definition' }));

  await waitFor(() => {
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/project/create',
      query: {
        dopSetting: 'new-gitlab-id',
        mode: CreateProjectModes.GitLab,
      },
    });
  });
});

function renderCreateProject(canAdmin = false) {
  renderApp('project/create', <CreateProjectPage />, {
    appState: mockAppState({ canAdmin }),
  });
}
