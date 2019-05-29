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
import { shallow } from 'enzyme';
import ProjectKeyInput from '../ProjectKeyInput';
import { doesComponentExists } from '../../../../api/components';
import { waitAndUpdate } from '../../../../helpers/testUtils';

jest.mock('../../../../api/components', () => ({
  doesComponentExists: jest.fn().mockResolvedValue(false)
}));

beforeEach(() => {
  (doesComponentExists as jest.Mock<any>).mockClear();
});

it('should render correctly', async () => {
  const wrapper = shallow(<ProjectKeyInput initialValue="key" onChange={jest.fn()} />);
  expect(wrapper).toMatchSnapshot();
  wrapper.setState({ touched: true });
  await waitAndUpdate(wrapper);
  expect(wrapper.find('ValidationInput').prop('isValid')).toBe(true);
});

it('should not display any status when the key is not defined', async () => {
  const wrapper = shallow(<ProjectKeyInput onChange={jest.fn()} />);
  await waitAndUpdate(wrapper);
  expect(wrapper.find('ValidationInput').prop('isInvalid')).toBe(false);
  expect(wrapper.find('ValidationInput').prop('isValid')).toBe(false);
});

it('should have an error when the key is invalid', async () => {
  const wrapper = shallow(
    <ProjectKeyInput initialValue="KEy-with#speci@l_char" onChange={jest.fn()} />
  );
  await waitAndUpdate(wrapper);
  expect(wrapper.find('ValidationInput').prop('isInvalid')).toBe(true);
});

it('should have an error when the key already exists', async () => {
  (doesComponentExists as jest.Mock<any>).mockResolvedValue(true);
  const wrapper = shallow(<ProjectKeyInput initialValue="" onChange={jest.fn()} />);
  await waitAndUpdate(wrapper);
  expect(wrapper.find('ValidationInput').prop('isInvalid')).toBe(true);
});
