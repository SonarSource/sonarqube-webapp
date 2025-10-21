/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { getStateCallbackRedirectTo } from '~adapters/helpers/state-callback-handler';
import { renderWithRouter } from '../../helpers/test-utils';
import StateCallbackHandler from '../StateCallbackHandler';
import { useLocation } from '../hoc/withRouter';

jest.mock('~adapters/helpers/state-callback-handler', () => ({
  getStateCallbackRedirectTo: jest.fn(),
}));
jest.mock('../hoc/withRouter', () => ({
  useLocation: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('should correctly handle search params', () => {
  jest.mocked(useLocation).mockReturnValue({
    pathname: '/login',
    search: '?key=value&test=foo',
    hash: '',
    state: {},
    key: '',
    query: {},
  });

  renderStateCallbackHandler();

  expect(getStateCallbackRedirectTo).toHaveBeenCalled();
  const searchParamsPassedToGetStateCallbackRedirectTo = jest.mocked(getStateCallbackRedirectTo)
    .mock.calls[0][0];
  expect(searchParamsPassedToGetStateCallbackRedirectTo.get('key')).toBe('value');
  expect(searchParamsPassedToGetStateCallbackRedirectTo.get('test')).toBe('foo');
});

function renderStateCallbackHandler() {
  return renderWithRouter(<StateCallbackHandler />);
}
