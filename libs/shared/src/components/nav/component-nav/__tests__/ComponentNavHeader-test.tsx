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

import { fireEvent } from '@testing-library/react';
import { RecentHistory } from '../../../../helpers/recent-history';
import { renderWithRouter } from '../../../../helpers/test-utils';
import { byRole } from '../../../../helpers/testSelector';
import { ComponentQualifier, LightComponent } from '../../../../types/component';
import { ComponentNavHeader } from '../ComponentNavHeader';

jest.mock('../../../../helpers/recent-history', () => ({
  RecentHistory: {
    get: jest.fn(),
  },
}));

const component: LightComponent = {
  key: 'my-component',
  name: 'MyComponent',
  qualifier: ComponentQualifier.Project,
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('keeps every recently browsed item when no recentHistoryFilter is provided', async () => {
  jest
    .mocked(RecentHistory.get)
    .mockReturnValue([{ key: 'other', name: 'Other', qualifier: ComponentQualifier.Portfolio }]);

  renderWithRouter(<ComponentNavHeader allProjectsUrl="/projects" component={component} />);

  fireEvent.keyDown(byRole('button', { name: /MyComponent/ }).get(), { key: 'ArrowDown' });

  expect(await byRole('menu').find()).toBeInTheDocument();
  expect(byRole('menuitem', { name: /Other/ }).get()).toBeInTheDocument();
});

it('excludes recently browsed items rejected by a custom recentHistoryFilter', async () => {
  jest.mocked(RecentHistory.get).mockReturnValue([
    { key: 'keep', name: 'Keep', qualifier: ComponentQualifier.Portfolio },
    { key: 'reject', name: 'Reject', qualifier: ComponentQualifier.Project },
  ]);

  renderWithRouter(
    <ComponentNavHeader
      allProjectsUrl="/projects"
      component={component}
      recentHistoryFilter={(history) => history.key === 'keep'}
    />,
  );

  fireEvent.keyDown(byRole('button', { name: /MyComponent/ }).get(), { key: 'ArrowDown' });

  expect(await byRole('menu').find()).toBeInTheDocument();
  expect(byRole('menuitem', { name: /Keep/ }).get()).toBeInTheDocument();
  expect(byRole('menuitem', { name: /Reject/ }).query()).not.toBeInTheDocument();
});
