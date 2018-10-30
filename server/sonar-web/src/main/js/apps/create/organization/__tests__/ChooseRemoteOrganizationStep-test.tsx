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
import { ChooseRemoteOrganizationStep } from '../ChooseRemoteOrganizationStep';
import { mockRouter, submit } from '../../../../helpers/testUtils';

it('should render', () => {
  expect(shallowRender()).toMatchSnapshot();
});

it('should display an alert message', () => {
  expect(shallowRender({ almInstallId: 'foo' }).find('Alert')).toMatchSnapshot();
});

it('should display unbound installations', () => {
  const installation = { installationId: '12345', key: 'foo', name: 'Foo' };
  const push = jest.fn();
  const wrapper = shallowRender({
    almUnboundApplications: [installation],
    router: mockRouter({ push })
  });
  expect(wrapper).toMatchSnapshot();

  wrapper.find('Select').prop<Function>('onChange')(installation);
  submit(wrapper.find('form'));
  expect(push).toHaveBeenCalledWith({
    pathname: '/create-organization',
    query: { installation_id: installation.installationId } // eslint-disable-line camelcase
  });
});

it('should display already bound alert message', () => {
  expect(
    shallowRender({
      almInstallId: 'foo',
      almOrganization: { avatar: 'foo-avatar', key: 'foo', name: 'Foo', personal: false },
      boundOrganization: { avatar: 'bound-avatar', key: 'bound', name: 'Bound' }
    }).find('Alert')
  ).toMatchSnapshot();
});

function shallowRender(props: Partial<ChooseRemoteOrganizationStep['props']> = {}) {
  return shallow(
    // @ts-ignore avoid passing everything from WithRouterProps
    <ChooseRemoteOrganizationStep
      almApplication={{
        backgroundColor: 'blue',
        iconPath: 'icon/path',
        installationUrl: 'https://alm.application.url',
        key: 'github',
        name: 'GitHub'
      }}
      almUnboundApplications={[]}
      router={mockRouter()}
      {...props}
    />
  ).dive();
}
