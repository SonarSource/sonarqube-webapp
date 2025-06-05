/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { mockComponent } from '../../../helpers/mocks/component';
import { ComponentQualifier, LightComponent } from '../../../types/component';

export interface ComponentTree {
  ancestors: LightComponent[];
  children: ComponentTree[];
  component: LightComponent;
}

type ComponentHierarchy = { [Key: string]: ComponentHierarchy | null };

export const mockComponentTreeFromHierarchy = (
  componentKey: string,
  ancestors: LightComponent[],
  componentHierarchy: ComponentHierarchy,
): ComponentTree => {
  const component = mockComponent({
    key: (ancestors.length ? ancestors[ancestors.length - 1].key + ':' : '') + componentKey,
    name: componentKey,
    qualifier: ComponentQualifier.Directory,
  });

  return {
    component,
    ancestors,
    children: Object.entries(componentHierarchy).map(([key, value]): ComponentTree => {
      if (value) {
        return mockComponentTreeFromHierarchy(key, [...ancestors, component], value);
      }
      return {
        component: mockComponent({
          key: `${component.key}:${key}`,
          name: key,
          qualifier: ComponentQualifier.File,
        }),
        ancestors: [...ancestors, component],
        children: [],
      };
    }),
  };
};

export const mockComponentTree = (baseComponent = mockComponent()): ComponentTree => {
  const FOLDER_KEY = 'src';
  const folderComponent = mockComponent({
    key: `${baseComponent.key}:${FOLDER_KEY}`,
    name: FOLDER_KEY,

    qualifier: ComponentQualifier.Project,
  });

  const mockFileComponent = (name: string) =>
    mockComponent({
      key: `${baseComponent.key}:${folderComponent.key}:${name}`,
      name,
      qualifier: ComponentQualifier.File,
    });
  return {
    component: baseComponent,
    ancestors: [],
    children: [
      {
        component: folderComponent,
        ancestors: [baseComponent],
        children: [
          {
            component: mockFileComponent('file1'),
            ancestors: [baseComponent, folderComponent],
            children: [],
          },
          {
            component: mockFileComponent('file2'),
            ancestors: [baseComponent, folderComponent],
            children: [],
          },
          {
            component: mockFileComponent('file3'),
            ancestors: [baseComponent, folderComponent],
            children: [],
          },
          {
            component: mockFileComponent('file4'),
            ancestors: [baseComponent, folderComponent],
            children: [],
          },
          {
            component: mockFileComponent('file5'),
            ancestors: [baseComponent, folderComponent],
            children: [],
          },
          {
            component: mockFileComponent('file6'),
            ancestors: [baseComponent],
            children: [],
          },
        ],
      },
    ],
  };
};
