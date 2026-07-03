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

import { http, HttpHandler, HttpResponse } from 'msw';
import { mockComponentTree } from '~shared/api/mocks/data/measures';
import { BranchesServiceMock } from '~shared/api/mocks/services/BranchesServiceMock';
import { MeasuresServiceMock } from '~shared/api/mocks/services/MeasuresServiceMock';
import { mockMainBranch } from '~shared/helpers/mocks/branches';
import { mockComponent } from '~shared/helpers/mocks/component';
import { MetricKey } from '~shared/types/metrics';
import { Feature } from '../../types/features';
import {
  ComponentsServiceDefaultDataset,
  ComponentsServiceMock,
} from './services/ComponentsServiceMock';
import {
  LanguagesServiceDefaultDataset,
  LanguagesServiceMock,
} from './services/LanguagesServiceMock';
import {
  NavigationServiceDefaultDataset,
  NavigationServiceMock,
} from './services/NavigationServiceMock';
import { UsersServiceDefaultDataset, UsersServiceMock } from './services/UsersServiceMock';
import { PROJECT_KEY, PROJECT_NAME } from './services/devMockConstants';

/**
 * Navigate to /project/deviations?id=my-project (or current_architecture /
 * intended_architecture) to hit the architecture pages.
 */
const MY_PROJECT_COMPONENT = mockComponent({ key: PROJECT_KEY, name: PROJECT_NAME });

const developmentHandlers: HttpHandler[] = [
  ...new NavigationServiceMock(NavigationServiceDefaultDataset).handlers,
  ...new UsersServiceMock(UsersServiceDefaultDataset).handlers,
  ...new ComponentsServiceMock(ComponentsServiceDefaultDataset).handlers,

  // IMPORTANT: the main branch MUST carry a branchId (UUID) so that
  // ArchitectureContainer can enable the graph queries. Without it the page
  // shows an empty/loading state indefinitely.
  ...new BranchesServiceMock({
    branches: [mockMainBranch({ name: 'main' })],
    pullRequests: [],
  }).handlers,

  // ncloc_language_distribution drives primaryLanguage; without a supported
  // language ArchitectureContainer shows the "unsupported language" message.
  ...new MeasuresServiceMock({
    components: [mockComponentTree(MY_PROJECT_COMPONENT)],
    measuresByComponent: {
      [PROJECT_KEY]: [
        {
          metric: MetricKey.ncloc_language_distribution,
          value: 'java=32648',
          component: PROJECT_KEY,
        },
      ],
    },
    componentsKeysToIdsRelation: {},
  }).handlers,

  ...new LanguagesServiceMock(LanguagesServiceDefaultDataset).handlers,

  // SQS-only endpoints with no SQC counterpart — kept inline.
  http.get('/api/features/list', () =>
    HttpResponse.json([
      // Architecture-project is the licence gate; it must be present for hasArchitectureFeature.
      Feature.Architecture,
      Feature.BranchSupport,
    ]),
  ),

  // Prevents the "request cannot be processed" toast on the architecture pages.
  http.get('/api/ce/component', () => HttpResponse.json({ queue: [] })),

  http.get('/api/l10n/index', () => HttpResponse.json({ effectiveLocale: 'en-US', messages: {} })),
];

export default developmentHandlers;
