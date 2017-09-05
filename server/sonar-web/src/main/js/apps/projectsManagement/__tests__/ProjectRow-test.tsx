/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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
import ProjectRow from '../ProjectRow';
import { Visibility } from '../utils';
import { click } from '../../../helpers/testUtils';

const project = {
  key: 'project',
  name: 'Project',
  qualifier: 'TRK',
  visibility: Visibility.Private
};

it('renders', () => {
  expect(shallowRender()).toMatchSnapshot();
});

it('checks project', () => {
  const onProjectCheck = jest.fn();
  const wrapper = shallowRender({ onProjectCheck });
  wrapper.find('Checkbox').prop<Function>('onCheck')(false);
  expect(onProjectCheck).toBeCalledWith(project, false);
});

it('applies permission template', () => {
  const onApplyTemplateClick = jest.fn();
  const wrapper = shallowRender({ onApplyTemplateClick });
  click(wrapper.find('.js-apply-template'));
  expect(onApplyTemplateClick).toBeCalledWith(project);
});

function shallowRender(props?: any) {
  return shallow(
    <ProjectRow
      onApplyTemplateClick={jest.fn()}
      onProjectCheck={jest.fn()}
      project={project}
      selected={true}
      {...props}
    />
  );
}
