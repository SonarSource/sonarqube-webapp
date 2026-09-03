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

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { save } from '~shared/helpers/storage';
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import { ProjectsServiceMock } from '~sq-server-commons/api/mocks/ProjectsServiceMock';
import { mockAppState, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderAppRoutes } from '~sq-server-commons/helpers/testReactTestingUtils';
import { CurrentUser, NoticeType } from '~sq-server-commons/types/users';
import projectRoutes from '../../routes';
import { LS_PROJECTS_SORT, LS_PROJECTS_VIEW } from '../AllProjects';

jest.mock('~sq-server-commons/api/components');
jest.mock('~sq-server-commons/api/measures');
jest.mock('~sq-server-commons/api/favorites');

jest.mock('~shared/helpers/storage', () => {
  const fakeStorage: Record<string, string> = {
    'sonarqube.projects.default': 'all',
  };

  return {
    get: jest.fn((key: string) => fakeStorage[key]),
    save: jest.fn((key: string, value: string) => {
      fakeStorage[key] = value;
    }),
  };
});

// eslint-disable-next-line local-rules/use-metrickey-enum
const BASE_PATH = 'projects';

const projectHandler = new ProjectsServiceMock();
const modeHandler = new ModeServiceMock();

beforeEach(() => {
  jest.clearAllMocks();
  projectHandler.reset();
  modeHandler.reset();
});

it('renders correctly', async () => {
  renderProjects(`${BASE_PATH}?gate=OK`);

  expect(await ui.sortSelect.find()).toBeInTheDocument();
  expect(await ui.perspectiveSelect.find()).toBeInTheDocument();
  expect(await ui.projects.findAll()).toHaveLength(20);
  expect(ui.buttonCoverage.query()).not.toBeInTheDocument();
});

it('shows the project coverage button for a system admin', async () => {
  renderProjects(
    `${BASE_PATH}?gate=OK`,
    mockLoggedInUser({
      dismissedNotices: { [NoticeType.PROJECT_COVERAGE_TOUR]: true },
      permissions: { global: ['admin'] },
    }),
  );

  expect(await ui.buttonCoverage.find()).toHaveAttribute('href', '/admin/onboarding-dashboard');
});

it('changes sort and perspective', async () => {
  const user = userEvent.setup();
  renderProjects();

  await user.click(await ui.sortSelect.find());
  await user.click(screen.getByText('projects.sorting.size'));

  const projects = await ui.projects.findAll();
  expect(save).toHaveBeenCalledWith(LS_PROJECTS_SORT, '"size"');

  expect(await within(projects[0]).findByRole('link')).toHaveTextContent(
    'sonarlint-omnisharp-dotnet',
  );

  // Change perspective
  await user.click(ui.perspectiveSelect.get());
  await user.click(screen.getByText('projects.view.new_code'));

  // each project should show "new bugs" instead of "bugs"
  expect(await screen.findAllByText(`metric.${MetricKey.new_violations}.description`)).toHaveLength(
    20,
  );

  expect(save).toHaveBeenCalledWith(LS_PROJECTS_VIEW, '"leak"');
  // sort should also be updated
  expect(save).toHaveBeenCalledWith(LS_PROJECTS_SORT, `"${MetricKey.new_ncloc}"`);
});

it('handles showing favorite projects on load', async () => {
  const user = userEvent.setup();
  renderProjects(`${BASE_PATH}/favorite`);

  expect(await ui.myFavoritesToggleOption.find()).toHaveAttribute('aria-checked', 'true');
  expect(await ui.projects.findAll()).toHaveLength(2);

  await user.click(ui.allToggleOption.get());

  expect(await ui.projects.findAll()).toHaveLength(20);
});

it('renders favorite search empty state and clears filters', async () => {
  const user = userEvent.setup();
  renderProjects(`${BASE_PATH}/favorite?search=dndn`);

  expect(await ui.favoriteSearchEmptyStateTitle.find()).toBeInTheDocument();
  expect(ui.favoriteSearchEmptyStateDescription.get()).toBeInTheDocument();

  await user.click(ui.favoriteSearchClearFilters.get());

  expect(await ui.projects.findAll()).toHaveLength(2);
});

it('shows the empty favorite state when the user has no favorite projects', async () => {
  projectHandler.projects.forEach((project) => {
    project.isFavorite = false;
  });

  renderProjects(`${BASE_PATH}/favorite`);

  expect(await ui.noFavoriteProjectsTitle.find()).toBeInTheDocument();
  expect(ui.noFavoriteProjectsDescription.get()).toBeInTheDocument();
  expect(ui.exploreProjectsLink.get()).toHaveAttribute('href', '/projects/all');
});

function renderProjects(navigateTo?: string, currentUser?: CurrentUser) {
  return renderAppRoutes(BASE_PATH, projectRoutes, {
    appState: mockAppState({
      qualifiers: [ComponentQualifier.Project, ComponentQualifier.Application],
    }),
    currentUser: currentUser ?? mockLoggedInUser({ dismissedNotices: {} }),
    navigateTo,
  });
}

const ui = {
  loading: byText('loading'),
  myFavoritesToggleOption: byRole('radio', { name: 'my_favorites' }),
  allToggleOption: byRole('radio', { name: 'all' }),
  buttonCoverage: byRole('link', { name: 'projects.coverage' }),
  exploreProjectsLink: byRole('link', { name: 'projects.explore_projects' }),
  noFavoriteProjectsDescription: byText('projects.no_favorite_projects.engagement'),
  noFavoriteProjectsTitle: byRole('heading', { name: 'projects.no_favorite_projects' }),
  projects: byLabelText('list_of_projects').byRole('listitem'),
  favoriteSearchEmptyStateTitle: byRole('heading', {
    name: 'projects.favorite_search.empty.title',
  }),
  favoriteSearchEmptyStateDescription: byText('no_results_search.favorites'),
  favoriteSearchClearFilters: byRole('button', {
    name: 'projects.favorite_search.clear_all_filters',
  }),
  perspectiveSelect: byLabelText('projects.perspective'),
  sortSelect: byLabelText('projects.sort_by'),
};
