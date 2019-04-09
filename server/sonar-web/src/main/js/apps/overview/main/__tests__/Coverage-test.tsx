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
import * as React from 'react';
import { render } from 'enzyme';
import Coverage from '../Coverage';
import { ComposedProps } from '../enhance';
import {
  mockComponent,
  mockMainBranch,
  mockMeasureEnhanced,
  mockMetric
} from '../../../../helpers/testMocks';

it('should render correctly', () => {
  expect(shallowRender()).toMatchSnapshot();
});

function shallowRender(props: Partial<ComposedProps> = {}) {
  return render(
    <Coverage
      branchLike={mockMainBranch()}
      component={mockComponent()}
      leakPeriod={{ index: 1 } as T.Period}
      measures={[
        mockMeasureEnhanced(),
        mockMeasureEnhanced({
          metric: mockMetric({
            id: 'new_lines_to_cover',
            key: 'new_lines_to_cover',
            name: 'New Lines to Cover',
            type: 'INT'
          }),
          value: '52'
        }),
        mockMeasureEnhanced({
          metric: mockMetric({
            id: 'new_coverage',
            key: 'new_coverage',
            name: 'New Coverage'
          }),
          value: '85.0'
        }),
        mockMeasureEnhanced({
          metric: mockMetric({
            id: 'tests',
            key: 'tests',
            name: 'Unit Tests',
            type: 'INT'
          }),
          value: '15'
        })
      ]}
      {...props}
    />
  );
}
