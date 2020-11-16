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
import ListFooter from 'sonar-ui-common/components/controls/ListFooter';
import { mockAzureProject } from '../../../../helpers/mocks/alm-integrations';
import AzureProjectAccordion from '../AzureProjectAccordion';
import AzureProjectsList, { AzureProjectsListProps } from '../AzureProjectsList';

it('should render correctly', () => {
  expect(shallowRender({})).toMatchSnapshot('default');
  expect(shallowRender({ projects: [] })).toMatchSnapshot('empty');
});

it('should handle pagination', () => {
  const projects = new Array(21)
    .fill(1)
    .map((_, i) => mockAzureProject({ key: `project-${i}`, name: `Project #${i}` }));

  const wrapper = shallowRender({ projects });

  expect(wrapper.find(AzureProjectAccordion)).toHaveLength(10);

  wrapper.find(ListFooter).props().loadMore!();

  expect(wrapper.find(AzureProjectAccordion)).toHaveLength(20);
});

function shallowRender(overrides: Partial<AzureProjectsListProps> = {}) {
  const project = mockAzureProject();

  return shallow(
    <AzureProjectsList
      loadingRepositories={{}}
      onOpenProject={jest.fn()}
      projects={[project]}
      repositories={{ [project.key]: [] }}
      {...overrides}
    />
  );
}
