/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
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
import { mockBranch, mockPullRequest } from '../../../../../helpers/mocks/branch-like';
import { mockComponent, mockCurrentUser, mockLoggedInUser } from '../../../../../helpers/testMocks';
import { ComponentNavMeta, getCurrentPage, Props } from '../ComponentNavMeta';

describe('#ComponentNavMeta', () => {
  it('renders meta for a branch', () => {
    expect(
      shallowRender({ branchLike: mockBranch(), currentUser: mockLoggedInUser() })
    ).toMatchSnapshot();
  });

  it('renders meta for pull request', () => {
    expect(
      shallowRender({
        branchLike: mockPullRequest({
          url: 'https://example.com/pull/1234'
        })
      })
    ).toMatchSnapshot();
  });
});

describe('#getCurrentPage', () => {
  it('should return a portfolio page', () => {
    expect(getCurrentPage(mockComponent({ key: 'foo', qualifier: 'VW' }), undefined)).toEqual({
      type: 'PORTFOLIO',
      component: 'foo'
    });
  });

  it('should return an app page', () => {
    expect(
      getCurrentPage(
        mockComponent({ key: 'foo', qualifier: 'APP' }),
        mockBranch({ name: 'develop' })
      )
    ).toEqual({ type: 'APPLICATION', component: 'foo', branch: 'develop' });
  });

  it('should return a project page', () => {
    expect(getCurrentPage(mockComponent(), mockBranch({ name: 'feature/foo' }))).toEqual({
      type: 'PROJECT',
      component: 'my-project',
      branch: 'feature/foo'
    });
  });
});

function shallowRender(props: Partial<Props> = {}) {
  return shallow(
    <ComponentNavMeta
      branchLike={mockBranch()}
      component={mockComponent({ analysisDate: '2017-01-02T00:00:00.000Z', version: '0.0.1' })}
      currentUser={mockCurrentUser()}
      warnings={[]}
      {...props}
    />
  );
}
