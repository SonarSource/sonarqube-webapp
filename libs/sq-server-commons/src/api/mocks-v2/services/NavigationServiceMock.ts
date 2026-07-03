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
import { EditionKey } from '../../../types/editions';
import { PROJECT_KEY, PROJECT_NAME } from './devMockConstants';

interface NavigationServiceData {
  componentKey: string;
  componentName: string;
}

export class NavigationServiceMock extends AbstractServiceMock<NavigationServiceData> {
  handlers = [
    http.get('/api/navigation/global', () =>
      this.ok({
        edition: EditionKey.enterprise,
        productionDatabase: true,
        qualifiers: [ComponentQualifier.Project],
        settings: {
          'sonar.lf.enableGravatar': 'false',
        },
        version: '25.1.0',
        versionEOL: '2027-01-01',
        documentationUrl: 'https://docs.sonarsource.com/sonarqube-server/25.1',
      }),
    ),

    http.get('/api/navigation/component', () =>
      this.ok({
        key: this.data.componentKey,
        name: this.data.componentName,
        breadcrumbs: [
          {
            key: this.data.componentKey,
            name: this.data.componentName,
            qualifier: ComponentQualifier.Project,
          },
        ],
        configuration: { showSettings: true },
      }),
    ),
  ];
}

export const NavigationServiceDefaultDataset: NavigationServiceData = {
  componentKey: PROJECT_KEY,
  componentName: PROJECT_NAME,
};
