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
import { byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier } from '~shared/types/component';
import { getSuggestions } from '~sq-server-commons/api/components';
import { mockRouter } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import GlobalSearch, { GlobalSearch as GlobalSearchWithoutRouter } from '../GlobalSearch';

jest.mock('~sq-server-commons/api/components', () => {
  const { ComponentQualifier: mockComponentQualifier } =
    jest.requireActual<typeof import('~shared/types/component')>('~shared/types/component');

  return {
    getSuggestions: jest.fn().mockResolvedValue({
      results: [
        {
          q: mockComponentQualifier.Project,
          more: 1,
          items: [
            {
              isFavorite: true,
              isRecentlyBrowsed: true,
              key: 'sonarqube',
              match: 'SonarQube',
              name: 'SonarQube',
              project: '',
            },
            {
              isFavorite: false,
              isRecentlyBrowsed: false,
              key: 'sonarcloud',
              match: 'Sonarcloud',
              name: 'Sonarcloud',
              project: '',
            },
          ],
        },
      ],
    }),
  };
});

const ui = {
  searchButton: byRole('button', { name: 'search_verb' }),
  searchInput: byRole('searchbox'),
  searchItemListWrapper: byRole('menu'),
  searchItem: byRole('menuitem'),
  showMoreButton: byRole('menuitem', { name: 'show_more' }),
  tooShortWarning: byText('search_input.minimum_characters.2'),
  noResultTextABCD: byText(/no_results_for_x.abcd/),
};

it('should show the input when user click on the search icon', async () => {
  const user = userEvent.setup();
  renderGlobalSearch();

  expect(ui.searchButton.get()).toBeInTheDocument();
  await user.click(ui.searchButton.get());
  expect(ui.searchInput.get()).toBeVisible();
  expect(ui.searchItemListWrapper.get()).toBeVisible();

  await user.click(document.body);
  expect(ui.searchInput.query()).not.toBeInTheDocument();
  expect(ui.searchItemListWrapper.query()).not.toBeInTheDocument();
});

it('selects the results', async () => {
  const user = userEvent.setup();
  renderGlobalSearch();
  await user.click(ui.searchButton.get());

  await user.click(ui.searchInput.get());
  await user.keyboard('son');
  expect(ui.searchItem.getAll()[1]).toHaveClass('active');
  expect(ui.searchItem.getAll()[1]).toHaveTextContent(/SonarQube.*sonarqube/);

  await user.keyboard('{arrowdown}');
  expect(ui.searchItem.getAll()[2]).toHaveClass('active');
  expect(ui.searchItem.getAll()[2]).toHaveTextContent('Sonarcloudsonarcloud');

  await user.keyboard('{arrowdown}');
  expect(ui.searchItem.getAll()[3]).toHaveClass('active');
  expect(ui.searchItem.getAll()[3]).toHaveTextContent('show_more');

  await user.keyboard('{arrowup}');
  expect(ui.searchItem.getAll()[2]).toHaveClass('active');
  expect(ui.searchItem.getAll()[2]).toHaveTextContent('Sonarcloudsonarcloud');

  await user.hover(ui.searchItem.getAll()[1]);
  expect(ui.searchItem.getAll()[1]).not.toHaveClass('active');

  await user.keyboard('{Escape}');
  expect(ui.searchInput.query()).not.toBeInTheDocument();
});

it('load more results', async () => {
  const user = userEvent.setup();
  renderGlobalSearch();
  await user.click(ui.searchButton.get());
  expect(getSuggestions).toHaveBeenCalledWith('', []);

  await user.click(ui.searchInput.get());
  await user.keyboard('foo');
  expect(getSuggestions).toHaveBeenLastCalledWith('foo', []);

  jest.mocked(getSuggestions).mockResolvedValueOnce({
    projects: [],
    results: [
      {
        items: [
          {
            isFavorite: false,
            isRecentlyBrowsed: false,
            key: 'bar',
            match: '<mark>Bar</mark>',
            name: 'Bar',
            project: 'bar',
          },
        ],
        more: 0,
        q: ComponentQualifier.Project,
      },
    ],
  });

  await user.click(ui.showMoreButton.get());
  expect(getSuggestions).toHaveBeenLastCalledWith('foo', [], ComponentQualifier.Project);

  expect(await byRole('menuitem', { name: /^Bar/i }).find()).toHaveAttribute(
    'href',
    '/dashboard?id=bar',
  );
});

it('shows warning about short input', async () => {
  const user = userEvent.setup();
  renderGlobalSearch();
  await user.click(ui.searchButton.get());

  await user.click(ui.searchInput.get());
  await user.keyboard('s');
  expect(screen.getAllByText('search_input.minimum_characters.2')[0]).toBeVisible();

  await user.keyboard('abc');
  expect(screen.queryByText('search_input.minimum_characters.2')).not.toBeInTheDocument();
});

it('should display no results message', async () => {
  const user = userEvent.setup();
  renderGlobalSearch();

  jest.mocked(getSuggestions).mockResolvedValue({
    projects: [],
    results: [
      {
        items: [],
        more: 0,
        q: ComponentQualifier.Project,
      },
    ],
  });

  await user.click(ui.searchButton.get());

  await user.click(ui.searchInput.get());
  await user.keyboard('abcd');

  expect(ui.noResultTextABCD.get()).toBeVisible();
});

it('should open selected', async () => {
  jest.mocked(getSuggestions).mockResolvedValueOnce({
    projects: [],
    results: [
      {
        items: [
          {
            isFavorite: true,
            isRecentlyBrowsed: true,
            key: 'sonarqube',
            match: 'SonarQube',
            name: 'SonarQube',
            project: '',
          },
        ],
        more: 0,
        q: ComponentQualifier.Project,
      },
    ],
  });

  const user = userEvent.setup();
  const router = mockRouter();
  renderComponent(<GlobalSearchWithoutRouter router={router} />);
  await user.click(ui.searchButton.get());

  await user.click(ui.searchInput.get());
  await user.keyboard('{arrowdown}');
  await user.keyboard('{enter}');

  expect(router.push).toHaveBeenCalledWith({
    pathname: '/dashboard',
    search: '?id=sonarqube',
  });
});

function renderGlobalSearch() {
  return renderComponent(<GlobalSearch />);
}
