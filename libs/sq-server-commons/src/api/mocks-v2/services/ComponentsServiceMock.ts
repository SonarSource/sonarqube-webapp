/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
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

import { http } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import { ComponentQualifier } from '~shared/types/component';
import { PROJECT_KEY, PROJECT_NAME } from './devMockConstants';

interface ComponentsServiceData {
  analysisDate: string;
  componentKey: string;
  componentName: string;
}

export class ComponentsServiceMock extends AbstractServiceMock<ComponentsServiceData> {
  handlers = [
    http.get('/api/components/show', () =>
      this.ok({
        component: {
          key: this.data.componentKey,
          name: this.data.componentName,
          qualifier: ComponentQualifier.Project,
          breadcrumbs: [
            {
              key: this.data.componentKey,
              name: this.data.componentName,
              qualifier: ComponentQualifier.Project,
            },
          ],
          analysisDate: this.data.analysisDate,
        },
      }),
    ),
  ];
}

export const ComponentsServiceDefaultDataset: ComponentsServiceData = {
  analysisDate: '2025-01-01T00:00:00+0000',
  componentKey: PROJECT_KEY,
  componentName: PROJECT_NAME,
};
