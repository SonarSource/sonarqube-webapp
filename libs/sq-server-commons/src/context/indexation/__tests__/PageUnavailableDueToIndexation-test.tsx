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

import { byRole } from '~shared/helpers/testSelector';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { IndexationContext } from '../IndexationContext';
import { PageUnavailableDueToIndexation } from '../PageUnavailableDueToIndexation';

it('should render correctly', () => {
  renderPageUnavailableToIndexation();

  expect(byRole('link', { name: /learn_more/ }).get()).toBeInTheDocument();
});

it('should not refresh the page once the indexation is complete if there were failures', () => {
  const reload = jest.fn();

  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      reload,
      // trick the MemoryRouter into thinking this is an internal link, otherwise it throws a warning
      href: 'https://docs.sonarsource.com/',
    },
  });

  const { rerender } = renderPageUnavailableToIndexation();

  expect(reload).not.toHaveBeenCalled();

  rerender(
    <IndexationContext.Provider value={{ status: { hasFailures: true, isCompleted: true } }}>
      <PageUnavailableDueToIndexation />
    </IndexationContext.Provider>,
  );

  expect(reload).not.toHaveBeenCalled();
});

it('should refresh the page once the indexation is complete if there were NO failures', () => {
  const reload = jest.fn();

  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      reload,
      // trick the MemoryRouter into thinking this is an internal link, otherwise it throws a warning
      href: 'https://docs.sonarsource.com/',
    },
  });

  const { rerender } = renderPageUnavailableToIndexation();

  expect(reload).not.toHaveBeenCalled();

  rerender(
    <IndexationContext.Provider value={{ status: { hasFailures: false, isCompleted: true } }}>
      <PageUnavailableDueToIndexation />
    </IndexationContext.Provider>,
  );

  expect(reload).toHaveBeenCalled();
});

function renderPageUnavailableToIndexation() {
  return renderComponent(
    <IndexationContext.Provider
      value={{
        status: {
          completedCount: 23,
          hasFailures: false,
          isCompleted: false,
          total: 42,
        },
      }}
    >
      <PageUnavailableDueToIndexation />
    </IndexationContext.Provider>,
  );
}
