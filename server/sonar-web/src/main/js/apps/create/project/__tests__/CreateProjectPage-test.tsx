/*
 * SonarQube
 * Copyright (C) 2009-2020 SonarSource SA
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

import { shallow } from 'enzyme';
import * as React from 'react';
import { getAlmSettings } from '../../../../api/alm-settings';
import { mockLocation, mockLoggedInUser, mockRouter } from '../../../../helpers/testMocks';
import { AlmKeys } from '../../../../types/alm-settings';
import { CreateProjectPage } from '../CreateProjectPage';
import { CreateProjectModes } from '../types';

jest.mock('../../../../api/alm-settings', () => ({
  getAlmSettings: jest.fn().mockResolvedValue([{ alm: AlmKeys.Bitbucket, key: 'foo' }])
}));

beforeEach(jest.clearAllMocks);

it('should render correctly', () => {
  expect(shallowRender()).toMatchSnapshot();
  expect(getAlmSettings).toBeCalled();
});

it('should render correctly if no branch support', () => {
  expect(shallowRender({ appState: { branchesEnabled: false } })).toMatchSnapshot();
  expect(getAlmSettings).not.toBeCalled();
});

it('should render correctly if the manual method is selected', () => {
  const push = jest.fn();
  const location = { query: { mode: CreateProjectModes.Manual } };
  const wrapper = shallowRender({ router: mockRouter({ push }) });

  wrapper.instance().handleModeSelect(CreateProjectModes.Manual);
  expect(push).toBeCalledWith(expect.objectContaining(location));

  expect(wrapper.setProps({ location: mockLocation(location) })).toMatchSnapshot();
});

it('should render correctly if the BBS method is selected', () => {
  const push = jest.fn();
  const location = { query: { mode: CreateProjectModes.BitbucketServer } };
  const wrapper = shallowRender({ router: mockRouter({ push }) });

  wrapper.instance().handleModeSelect(CreateProjectModes.BitbucketServer);
  expect(push).toBeCalledWith(expect.objectContaining(location));

  expect(wrapper.setProps({ location: mockLocation(location) })).toMatchSnapshot();
});

it('should render correctly if the GitHub method is selected', () => {
  const push = jest.fn();
  const location = { query: { mode: CreateProjectModes.GitHub } };
  const wrapper = shallowRender({ router: mockRouter({ push }) });

  wrapper.instance().handleModeSelect(CreateProjectModes.GitHub);
  expect(push).toBeCalledWith(expect.objectContaining(location));

  expect(wrapper.setProps({ location: mockLocation(location) })).toMatchSnapshot();
});

function shallowRender(props: Partial<CreateProjectPage['props']> = {}) {
  return shallow<CreateProjectPage>(
    <CreateProjectPage
      appState={{ branchesEnabled: true }}
      currentUser={mockLoggedInUser()}
      location={mockLocation()}
      router={mockRouter()}
      {...props}
    />
  );
}
