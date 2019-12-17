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
import { mockDetailledHotspot } from '../../../../helpers/mocks/security-hotspots';
import { mockCurrentUser, mockLoggedInUser, mockUser } from '../../../../helpers/testMocks';
import { HotspotViewerRenderer, HotspotViewerRendererProps } from '../HotspotViewerRenderer';

it('should render correctly', () => {
  const wrapper = shallowRender();
  expect(wrapper).toMatchSnapshot();
  expect(shallowRender({ hotspot: undefined })).toMatchSnapshot('no hotspot');
  expect(
    shallowRender({ hotspot: mockDetailledHotspot({ assignee: mockUser({ active: false }) }) })
  ).toMatchSnapshot('deleted assignee');
  expect(shallowRender()).toMatchSnapshot('anonymous user');
  expect(shallowRender({ currentUser: mockLoggedInUser() })).toMatchSnapshot('user logged in');
});

function shallowRender(props?: Partial<HotspotViewerRendererProps>) {
  return shallow(
    <HotspotViewerRenderer
      currentUser={mockCurrentUser()}
      hotspot={mockDetailledHotspot()}
      loading={false}
      onUpdateHotspot={jest.fn()}
      securityCategories={{ 'sql-injection': { title: 'SQL injection' } }}
      {...props}
    />
  );
}
