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

import { HttpResponse, http } from 'msw';

import { mockMainBranch, mockPullRequest } from '../../../helpers/mocks/branches';
import { BranchBase } from '../../../types/branch-like';
import { HttpStatus } from '../../../types/request';
import { AbstractServiceMock } from '../AbstractServiceMock';

interface BranchesServiceData {
  branches: BranchBase[];
}

export class BranchesServiceMock extends AbstractServiceMock<BranchesServiceData> {
  handlers = [
    http.get('/api/project_branches/list', () => {
      const { branches } = this.data;

      return HttpResponse.json({ branches }, { status: HttpStatus.Ok });
    }),
    http.get('/api/project_pull_requests/list', () => {
      return HttpResponse.json(
        {
          pullRequests: [
            mockPullRequest({ key: 'pr-89', status: { qualityGateStatus: 'ERROR' } }),
            mockPullRequest({ key: 'pr-90', title: 'PR Feature 2' }),
          ],
        },
        { status: HttpStatus.Ok },
      );
    }),
    http.post('/api/project_branches/delete', () =>
      HttpResponse.json(undefined, { status: HttpStatus.Ok }),
    ),
    http.post('/api/project_pull_requests/delete', () =>
      HttpResponse.json(undefined, { status: HttpStatus.Ok }),
    ),
    http.post('/api/project_branches/rename', () =>
      HttpResponse.json(undefined, { status: HttpStatus.Ok }),
    ),
  ];
}

export const BranchesServiceDefaultDataset: BranchesServiceData = {
  branches: [mockMainBranch()],
};
