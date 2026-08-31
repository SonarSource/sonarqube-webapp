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
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import {
  mockProjectGitLabBindingResponse,
  mockProjectGithubBindingResponse,
} from '~sq-server-commons/helpers/mocks/alm-settings';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { useProjectBindingQuery } from '~sq-server-commons/queries/devops-integration';
import BranchHelpTooltip from '../BranchHelpTooltip';

jest.mock('~sq-server-commons/queries/devops-integration', () => ({
  useProjectBindingQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }),
}));

const mockUseProjectBindingQuery = jest.mocked(useProjectBindingQuery);

beforeEach(() => {
  jest.clearAllMocks();

  mockUseProjectBindingQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
  } as ReturnType<typeof useProjectBindingQuery>);
});

it('should render application tooltip with an admin link', async () => {
  const user = userEvent.setup();
  const component = mockComponent();

  renderBranchHelpTooltip({
    canAdminComponent: true,
    component,
    isApplication: true,
  });

  const toggleTip = screen.getByRole('button', { name: 'toggletip.help' });

  await expect(toggleTip).toHaveAPopoverWithContent('application.branches.help');

  await user.click(toggleTip);

  const expectedHref = `/project/admin/extension/developer-server/application-console?id=${component.key}`;

  expect(screen.getByRole('link', { name: 'application.branches.link' })).toHaveAttribute(
    'href',
    expectedHref,
  );
});

it.each([
  {
    description: 'application already has multiple branches',
    props: { canAdminComponent: true, hasManyBranches: true, isApplication: true },
  },
  {
    description: 'branch support is enabled and multiple branches are already available',
    props: { hasManyBranches: true },
  },
])('should not render a help tooltip when $description', ({ props }) => {
  renderBranchHelpTooltip(props);

  expect(screen.queryByRole('button', { name: 'toggletip.help' })).not.toBeInTheDocument();
});

it('should render generic disabled branch support help when project binding is missing', async () => {
  const user = userEvent.setup();

  renderBranchHelpTooltip({ branchSupportEnabled: false });

  await user.click(screen.getByRole('button', { name: 'toggletip.help' }));

  expect(screen.getByRole('dialog')).toHaveTextContent(
    'branch_like_navigation.no_branch_support.title',
  );

  expect(screen.getByRole('dialog')).toHaveTextContent(
    'branch_like_navigation.no_branch_support.content',
  );

  expect(screen.getByRole('link', { name: /learn_more/ })).toHaveAttribute(
    'href',
    'https://www.sonarsource.com/plans-and-pricing/developer/',
  );
});

it('should render gitlab-specific disabled branch support help', async () => {
  const user = userEvent.setup();

  mockUseProjectBindingQuery.mockReturnValue({
    data: mockProjectGitLabBindingResponse(),
    isLoading: false,
  } as ReturnType<typeof useProjectBindingQuery>);

  renderBranchHelpTooltip({ branchSupportEnabled: false });

  await user.click(screen.getByRole('button', { name: 'toggletip.help' }));

  expect(screen.getByRole('dialog')).toHaveTextContent(
    'branch_like_navigation.no_branch_support.title.mr',
  );

  expect(screen.getByRole('dialog')).toHaveTextContent(
    'branch_like_navigation.no_branch_support.content_x.mr',
  );
});

it('should render the single branch help with documentation links', async () => {
  const user = userEvent.setup();
  const component = mockComponent();

  mockUseProjectBindingQuery.mockReturnValue({
    data: mockProjectGithubBindingResponse(),
    isLoading: false,
  } as ReturnType<typeof useProjectBindingQuery>);

  renderBranchHelpTooltip({ component });

  await user.click(screen.getByRole('button', { name: 'toggletip.help' }));

  expect(screen.getByRole('dialog')).toHaveTextContent(
    'branch_like_navigation.only_one_branch.title',
  );

  expect(screen.getByRole('dialog')).toHaveTextContent(
    'branch_like_navigation.only_one_branch.content',
  );

  expect(
    screen.getByRole('link', { name: 'branch_like_navigation.only_one_branch.documentation' }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole('link', { name: 'branch_like_navigation.only_one_branch.pr_analysis' }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole('link', { name: 'branch_like_navigation.tutorial_for_ci' }),
  ).toHaveAttribute('href', `/tutorials?id=${component.key}`);
});

function renderBranchHelpTooltip(
  overrides: Partial<ComponentProps<typeof BranchHelpTooltip>> = {},
) {
  return renderComponent(
    <BranchHelpTooltip
      branchSupportEnabled
      canAdminComponent={false}
      component={mockComponent()}
      hasManyBranches={false}
      isApplication={false}
      {...overrides}
    />,
  );
}
