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
import { renderStepContent } from '../../jenkins/test-utils';
import { BuildTools } from '../types';
import YmlFileStep, { YmlFileStepProps } from '../YmlFileStep';

it('should render correctly', () => {
  const wrapper = shallowRender();
  expect(wrapper).toMatchSnapshot('Step wrapper');
  expect(renderStepContent(wrapper)).toMatchSnapshot('initial content');
});

it.each([[BuildTools.Maven], [BuildTools.Gradle], [BuildTools.Other]])(
  'should render correctly for build tool %s',
  buildTool => {
    expect(renderStepContent(shallowRender({ buildTool }))).toMatchSnapshot();
  }
);

function shallowRender(props: Partial<YmlFileStepProps> = {}) {
  return shallow<YmlFileStepProps>(<YmlFileStep open={true} {...props} />);
}
