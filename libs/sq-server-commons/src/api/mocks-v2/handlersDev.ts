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
import { AlmKeys } from '../../types/alm-settings';
import { PermissionCheckResource, PermissionCheckStatus } from '../../types/dop-translation';
import { Feature } from '../../types/features';
import { BillingServiceDefaultDataset, BillingServiceMock } from '../mocks/BillingServiceMock';
import { PermissionChecksServiceMock } from '../mocks/PermissionChecksServiceMock';
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

const MY_PROJECT_COMPONENT = mockComponent({ key: PROJECT_KEY, name: PROJECT_NAME });

// Unix timestamp for 2023-11-14T22:13:20Z — stable placeholder for dev mock data.
const MOCK_CHECKED_AT_TIMESTAMP = 1_700_000_000_000;

function mockDopCheck(
  key: string,
  type: AlmKeys,
  status: PermissionCheckStatus,
): PermissionCheckResource {
  return { checkedAt: MOCK_CHECKED_AT_TIMESTAMP, key, type, status };
}

/**
 * Reproduces the SONAR-32262 scenario: many configured DOPs at once, in deliberately
 * unsorted order and with a very long Azure key, so the instance-admin banner can be
 * checked for SUFFICIENT filtering, severity ordering, the Show/Hide disclosure and
 * key-column truncation.
 */
const DEV_PERMISSION_CHECKS: PermissionCheckResource[] = [
  mockDopCheck('github-ok-1', AlmKeys.GitHub, PermissionCheckStatus.Sufficient),
  mockDopCheck('bitbucket-ci', AlmKeys.BitbucketServer, PermissionCheckStatus.CheckFailed),
  mockDopCheck('github-ok-2', AlmKeys.GitHub, PermissionCheckStatus.Sufficient),
  mockDopCheck('bitbucket-cloud-main', AlmKeys.BitbucketCloud, PermissionCheckStatus.CheckFailed),
  mockDopCheck(
    'azure-server-2020-ado-server-2020-test-default-collection',
    AlmKeys.Azure,
    PermissionCheckStatus.Unknown,
  ),
  mockDopCheck('github-legacy', AlmKeys.GitHub, PermissionCheckStatus.CheckFailed),
  mockDopCheck('gitlab-selfhosted', AlmKeys.GitLab, PermissionCheckStatus.UnsupportedTokenType),
  mockDopCheck('github-ok-3', AlmKeys.GitHub, PermissionCheckStatus.Sufficient),
  mockDopCheck('github-missing-scopes', AlmKeys.GitHub, PermissionCheckStatus.Insufficient),
  mockDopCheck('azure-cloud', AlmKeys.Azure, PermissionCheckStatus.CheckFailed),
  mockDopCheck('gitlab-saas', AlmKeys.GitLab, PermissionCheckStatus.CheckFailed),
];

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

  // The AI capabilities admin routes sit behind FeatureAvailabilityGuard, which reads
  // /api/v2/entitlements/purchasable-features. An unlicensed local instance returns nothing
  // there, so the guard renders NotFound and /admin/agent/remediation 404s. Mocking billing
  // makes the route resolve; the permission checks then drive the banner under test.
  ...new BillingServiceMock(BillingServiceDefaultDataset).handlers,
  ...new PermissionChecksServiceMock({
    response: { permissionChecks: DEV_PERMISSION_CHECKS },
  }).handlers,

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
