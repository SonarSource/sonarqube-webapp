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

import { Button } from '@sonarsource/echoes-react';
import { screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { Visibility } from '~shared/types/component';
import { AddonsContext } from '../../../../context/addons/AddonsContext';
import { mockComponent } from '../../../../helpers/mocks/component';
import { mockLoggedInUser } from '../../../../helpers/testMocks';
import { Feature } from '../../../../types/features';
import { Component } from '../../../../types/types';
import { ProjectContentHeader } from '../ProjectContentHeader';

jest.mock('~sq-server-commons/components/nav/ComponentNavProjectBindingErrorNotif', () => ({
  __esModule: true,
  default: jest
    .requireActual<typeof import('~shared/helpers/test-utils')>('~shared/helpers/test-utils')
    .mockReactComponent('ComponentNavProjectBindingErrorNotif'),
}));

jest.mock('~sq-server-commons/components/new-code-definition/NCDAutoUpdateMessage', () => ({
  __esModule: true,
  default: jest
    .requireActual<typeof import('~shared/helpers/test-utils')>('~shared/helpers/test-utils')
    .mockReactComponent('NCDAutoUpdateMessage'),
}));

jest.mock('~sq-server-commons/components/shared/ComponentMissingMqrMetricsMessage', () => ({
  ComponentMissingMqrMetricsMessage: jest
    .requireActual<typeof import('~shared/helpers/test-utils')>('~shared/helpers/test-utils')
    .mockReactComponent('ComponentMissingMqrMetricsMessage'),
}));

jest.mock('~adapters/queries/branch', () => ({
  useCurrentBranchQuery: jest.fn().mockReturnValue({
    data: jest
      .requireActual<
        typeof import('../../../../helpers/mocks/branch-like')
      >('../../../../helpers/mocks/branch-like')
      .mockMainBranch({ analysisDate: '2021-01-01' }),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('should render correctly with default behavior for logged in user', () => {
  setupWithProps(
    {
      actions: <Button>Custom Action</Button>,
      breadcrumbs: [{ linkElement: 'Custom breadcrumb', to: '/custom' }],
      callout: <div>Custom Callout</div>,
      metadata: <div>Custom Metadata</div>,
      title: 'Overview',
    },
    {
      component: mockComponent({
        configuration: { showSettings: true },
        visibility: Visibility.Public,
      }),
    },
  );

  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('MyProject')).toBeInTheDocument();
  expect(screen.getByText('Custom breadcrumb')).toBeInTheDocument();
  expect(screen.getByText('Custom Metadata')).toBeInTheDocument();
  expect(screen.getByText('Branch selector')).toBeInTheDocument();

  expect(screen.getByRole('button', { name: 'Custom Action' })).toBeInTheDocument();

  expect(screen.getByText('Custom Callout')).toBeInTheDocument();
  expect(
    screen.getByTestId('mocked-component-nav-project-binding-error-notif'),
  ).toBeInTheDocument();
  expect(screen.getByTestId('mocked-ncd-auto-update-message')).toBeInTheDocument();
  expect(screen.getByTestId('mocked-component-missing-mqr-metrics-message')).toBeInTheDocument();
});

it('should not render when component is not provided', () => {
  const { container } = renderWithRouter(<ProjectContentHeader title="Overview" />);

  expect(container).toBeEmptyDOMElement();
});

function setupWithProps(
  props: ComponentProps<typeof ProjectContentHeader>,
  contextOverrides?: { component?: Component },
) {
  const component = contextOverrides?.component ?? mockComponent();
  return renderWithRouter(
    <AddonsContext.Provider
      value={{ branches: { ProjectBranchSelector: () => <div>Branch selector</div> } }}
    >
      <ProjectContentHeader {...props} />
    </AddonsContext.Provider>,
    {
      componentContext: { component },
      availableFeatures: [Feature.BranchSupport],
      initialCurrentUser: mockLoggedInUser(),
    },
  );
}
