/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import { shallow } from 'enzyme';
import App from '../App';
import { waitAndUpdate } from '../../../../helpers/testUtils';
import { retrieveComponent } from '../../utils';

jest.mock('../../utils', () => ({
  retrieveComponent: jest.fn().mockResolvedValue({
    breadcrumbs: [],
    component: { qualifier: 'APP' },
    components: [],
    page: 0,
    total: 1
  }),
  retrieveComponentChildren: () => Promise.resolve()
}));

beforeEach(() => {
  (retrieveComponent as jest.Mock<any>).mockClear();
});

it('should have correct title for APP based component', async () => {
  const wrapper = getWrapper();
  await waitAndUpdate(wrapper);
  expect(wrapper.find('HelmetWrapper')).toMatchSnapshot();
});

it('should have correct title for portfolio base component', async () => {
  (retrieveComponent as jest.Mock<any>).mockResolvedValueOnce({
    breadcrumbs: [],
    component: { qualifier: 'VW' },
    components: [],
    page: 0,
    total: 1
  });
  const wrapper = getWrapper();
  await waitAndUpdate(wrapper);
  expect(wrapper.find('HelmetWrapper')).toMatchSnapshot();
});

it('should have correct title for project component', async () => {
  (retrieveComponent as jest.Mock<any>).mockResolvedValueOnce({
    breadcrumbs: [],
    component: { qualifier: 'TRK' },
    components: [],
    page: 0,
    total: 1
  });
  const wrapper = getWrapper();
  await waitAndUpdate(wrapper);
  expect(wrapper.find('HelmetWrapper')).toMatchSnapshot();
});

const getWrapper = () => {
  return shallow(
    <App
      component={{
        breadcrumbs: [],
        name: 'foo',
        key: 'foo',
        organization: 'foo',
        qualifier: 'FOO'
      }}
      location={{ query: { branch: 'b', id: 'foo', line: '7' } }}
    />
  );
};
