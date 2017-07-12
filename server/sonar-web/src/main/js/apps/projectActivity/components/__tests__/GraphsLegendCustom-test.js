/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
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
import React from 'react';
import { shallow } from 'enzyme';
import GraphsLegendCustom from '../GraphsLegendCustom';

const SERIES = [
  { name: 'bugs', translatedName: 'Bugs', style: '2', data: [{ x: 1, y: 1 }] },
  {
    name: 'my_metric',
    translatedName: 'metric.my_metric.name',
    style: '1',
    data: [{ x: 1, y: 1 }]
  },
  { name: 'foo', translatedName: 'Foo', style: '0', data: [] }
];

const METRICS = [
  { key: 'bugs', name: 'Bugs' },
  { key: 'my_metric', name: 'My Metric', custom: true }
];

it('should render correctly the list of series', () => {
  expect(
    shallow(<GraphsLegendCustom metrics={METRICS} removeMetric={() => {}} series={SERIES} />)
  ).toMatchSnapshot();
});
