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

import { UseQueryResult } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { mockProjectGithubBindingResponse } from '../../../helpers/mocks/alm-settings';
import { mockPullRequest } from '../../../helpers/mocks/branch-like';
import { mockComponent } from '../../../helpers/mocks/component';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { useProjectBindingQuery } from '../../../queries/devops-integration';
import { BranchLike } from '../../../types/branch-like';
import { Feature } from '../../../types/features';
import { ComponentNavBindingStatus } from '../ComponentNavBindingStatus';

jest.mock('~adapters/queries/branch', () => ({
  useCurrentBranchQuery: jest.fn().mockReturnValue({ data: undefined }),
}));

jest.mock('../../../queries/devops-integration', () => ({
  useProjectBindingQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('should show loading spinner when project binding is loading', () => {
  jest.mocked(useProjectBindingQuery).mockReturnValue({ data: undefined, isLoading: true });

  renderComponentNavBindingStatus();

  expect(screen.getByText('loading')).toBeInTheDocument();
});

it('should display bound DOP button with URL when project is bound', () => {
  jest.mocked(useProjectBindingQuery).mockReturnValue({
    data: mockProjectGithubBindingResponse({ repositoryUrl: 'https://github.com/test/repo' }),
    isLoading: false,
  });

  renderComponentNavBindingStatus();

  expect(
    screen.getByRole('link', { name: /project_navigation.binding_status.view_on_x/ }),
  ).toBeInTheDocument();
});

it('should display bound DOP button without URL when project is bound but no URL available', () => {
  jest.mocked(useProjectBindingQuery).mockReturnValue({
    data: mockProjectGithubBindingResponse({ repositoryUrl: undefined }),
    isLoading: false,
  });

  renderComponentNavBindingStatus();

  expect(
    screen.getByRole('button', { name: /project_navigation.binding_status.bound_to_x/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /project_navigation.binding_status.bound_to_x/ }),
  ).toBeDisabled();
});

it('should display bind button when project is not bound and user has permissions', () => {
  jest.mocked(useProjectBindingQuery).mockReturnValue({ data: undefined, isLoading: false });

  renderComponentNavBindingStatus({
    component: mockComponent({ configuration: { showSettings: true } }),
  });

  expect(
    screen.getByRole('link', { name: 'project_navigation.binding_status.bind' }),
  ).toBeInTheDocument();
});

it('should not display bind button when user does not have permissions', () => {
  jest.mocked(useProjectBindingQuery).mockReturnValue({ data: undefined, isLoading: false });

  renderComponentNavBindingStatus({
    component: mockComponent({ configuration: { showSettings: false } }),
  });

  expect(
    screen.queryByRole('link', { name: 'project_navigation.binding_status.bind' }),
  ).not.toBeInTheDocument();
});

it('should display PR link addon when viewing a pull request', () => {
  jest
    .mocked(useCurrentBranchQuery)
    .mockReturnValue({ data: mockPullRequest() } as UseQueryResult<BranchLike>);
  const prLinkAddon = <div>PR Link Addon</div>;

  renderComponentNavBindingStatus({ prLinkAddon });

  expect(screen.getByText('PR Link Addon')).toBeInTheDocument();
});

function renderComponentNavBindingStatus(
  props: Partial<Parameters<typeof ComponentNavBindingStatus>[0]> = {},
) {
  return renderComponent(<ComponentNavBindingStatus component={mockComponent()} {...props} />, '', {
    featureList: [Feature.BranchSupport],
    currentUser: { isLoggedIn: true },
  });
}
