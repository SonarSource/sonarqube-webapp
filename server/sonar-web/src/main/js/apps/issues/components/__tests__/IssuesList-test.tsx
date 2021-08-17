/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
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
import { mockIssue } from '../../../../helpers/testMocks';
import { waitAndUpdate } from '../../../../sonar-ui-common/helpers/testUtils';
import IssuesList from '../IssuesList';

it('should render correctly', async () => {
  jest.useFakeTimers();

  const wrapper = shallowRender();
  expect(wrapper).toMatchSnapshot();
  jest.runAllTimers();
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
});

function shallowRender(overrides: Partial<IssuesList['props']> = {}) {
  return shallow(
    <IssuesList
      branchLike={undefined}
      checked={[]}
      component={undefined}
      issues={[mockIssue(), mockIssue(false, { key: 'AVsae-CQS-9G3txfbFN3' })]}
      onFilterChange={jest.fn()}
      onIssueChange={jest.fn()}
      onIssueCheck={jest.fn()}
      onIssueClick={jest.fn()}
      onPopupToggle={jest.fn()}
      openPopup={undefined}
      selectedIssue={undefined}
      {...overrides}
    />
  );
}
