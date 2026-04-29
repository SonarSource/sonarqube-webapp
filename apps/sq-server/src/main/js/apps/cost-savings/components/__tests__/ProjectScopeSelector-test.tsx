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
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { ProjectScopeSelector } from '../ProjectScopeSelector';

jest.mock('../../api/cost-savings-api', () => ({
  getProjectList: jest.fn().mockResolvedValue({
    projects: [
      {
        estimatedSavings: 50000,
        issueCount: 120,
        key: 'proj-a',
        lastAnalysis: '2025-04-01',
        name: 'Project Alpha',
      },
      {
        estimatedSavings: 30000,
        issueCount: 80,
        key: 'proj-b',
        lastAnalysis: '2025-03-28',
        name: 'Project Beta',
      },
    ],
  }),
}));

it('should render the project scope button with count', async () => {
  renderComponent(
    <ProjectScopeSelector onProjectsChange={jest.fn()} selectedProjects={undefined} />,
  );

  expect(await screen.findByText(/cost_savings.projects.label/)).toBeInTheDocument();
});

it('should open dropdown and show project list on click', async () => {
  const user = userEvent.setup();
  renderComponent(
    <ProjectScopeSelector onProjectsChange={jest.fn()} selectedProjects={undefined} />,
  );

  const button = await screen.findByText(/cost_savings.projects.label/);
  await user.click(button);

  expect(await screen.findByText('Project Alpha')).toBeInTheDocument();
  expect(screen.getByText('Project Beta')).toBeInTheDocument();
});

it('should show select all and select none buttons', async () => {
  const user = userEvent.setup();
  renderComponent(
    <ProjectScopeSelector onProjectsChange={jest.fn()} selectedProjects={undefined} />,
  );

  const button = await screen.findByText(/cost_savings.projects.label/);
  await user.click(button);

  expect(await screen.findByText('cost_savings.projects.select_all')).toBeInTheDocument();
  expect(screen.getByText('cost_savings.projects.select_none')).toBeInTheDocument();
});

it('should render nothing when project list is empty', async () => {
  const { getProjectList } = jest.requireMock('../../api/cost-savings-api');
  getProjectList.mockResolvedValueOnce({ projects: [] });

  const { container } = renderComponent(
    <ProjectScopeSelector onProjectsChange={jest.fn()} selectedProjects={undefined} />,
  );

  await waitFor(() => {
    expect(container.querySelector('button')).toBeNull();
  });
});
