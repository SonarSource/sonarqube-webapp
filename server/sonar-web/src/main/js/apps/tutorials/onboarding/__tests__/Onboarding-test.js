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
// @flow
import React from 'react';
import { shallow, mount } from 'enzyme';
import Onboarding from '../Onboarding';
import { click, doAsync } from '../../../../helpers/testUtils';
import { getInstance, isSonarCloud } from '../../../../helpers/system';

jest.mock('../../../../api/users', () => ({
  skipOnboarding: () => Promise.resolve()
}));

jest.mock('../../../../helpers/system', () => ({
  getInstance: jest.fn(),
  isSonarCloud: jest.fn()
}));

const currentUser = { login: 'admin', isLoggedIn: true };

it('guides for on-premise', () => {
  getInstance.mockImplementation(() => 'SonarQube');
  isSonarCloud.mockImplementation(() => false);
  const wrapper = shallow(
    <Onboarding
      className="modal-container"
      currentUser={currentUser}
      onFinish={jest.fn()}
      organizationsEnabled={false}
    />
  );
  expect(wrapper).toMatchSnapshot();

  // $FlowFixMe
  wrapper.instance().handleTokenDone('abcd1234');
  wrapper.update();
  expect(wrapper).toMatchSnapshot();
});

it('guides for sonarcloud', () => {
  getInstance.mockImplementation(() => 'SonarCloud');
  isSonarCloud.mockImplementation(() => true);
  const wrapper = shallow(
    <Onboarding currentUser={currentUser} onFinish={jest.fn()} organizationsEnabled={true} />
  );
  expect(wrapper).toMatchSnapshot();

  // $FlowFixMe
  wrapper.instance().handleOrganizationDone('my-org');
  wrapper.update();
  expect(wrapper).toMatchSnapshot();

  // $FlowFixMe
  wrapper.instance().handleTokenDone('abcd1234');
  wrapper.update();
  expect(wrapper).toMatchSnapshot();
});

it('finishes', () => {
  getInstance.mockImplementation(() => 'SonarQube');
  isSonarCloud.mockImplementation(() => false);
  const onFinish = jest.fn();
  const wrapper = mount(
    <Onboarding currentUser={currentUser} onFinish={onFinish} organizationsEnabled={false} />
  );
  click(wrapper.find('.js-skip'));
  return doAsync(() => {
    expect(onFinish).toBeCalled();
  });
});
