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

import userEvent from '@testing-library/user-event';
import { byRole, byText } from '~shared/helpers/testSelector';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AppState } from '~sq-server-commons/types/appstate';
import GlobalNavMore from '../GlobalNavMore';

it('renders nothing when there is no plugin page', () => {
  renderGlobalNavMore();

  expect(byText('more').query()).not.toBeInTheDocument();
});

it('renders nothing when only the portfolios extension is present', () => {
  renderGlobalNavMore(
    mockAppState({ globalPages: [{ key: 'governance/portfolios', name: 'Portfolios' }] }),
  );

  expect(byText('more').query()).not.toBeInTheDocument();
});

it('renders plugin global pages', async () => {
  renderGlobalNavMore(mockAppState({ globalPages: [{ key: 'foo', name: 'Foo' }] }));

  await userEvent.setup().click(await byText('more').find());

  expect(byRole('menuitem', { name: 'Foo' }).get()).toHaveAttribute('href', '/extension/foo');
});

function renderGlobalNavMore(appState: AppState = mockAppState({ globalPages: [] })) {
  renderApp('/', <GlobalNavMore />, { appState });
}
