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

import { HttpResponse, http } from 'msw';
import { Paging } from '../../../types/paging';
import { HttpStatus } from '../../../types/request';
import { IssueBaseShared, IssueComponentBaseShared } from '../../issues';
import { AbstractServiceMock } from '../AbstractServiceMock';

const ISSUES_SEARCH_PATH = '/api/issues/search';

export interface IssuesServiceData {
  components: IssueComponentBaseShared[];
  issues: Array<Pick<IssueBaseShared, 'component' | 'componentKey' | 'key' | 'message' | 'rule'>>;
  paging: Paging;
}

export class IssuesServiceMock extends AbstractServiceMock<IssuesServiceData> {
  handlers = [
    http.get(ISSUES_SEARCH_PATH, () => {
      return HttpResponse.json(
        {
          components: this.data.components,
          issues: this.data.issues,
          paging: this.data.paging,
        },
        { status: HttpStatus.Ok },
      );
    }),
  ];
}

export const IssuesServiceDefaultDataset: IssuesServiceData = {
  components: [],
  issues: [],
  paging: {
    pageIndex: 1,
    pageSize: 500,
    total: 0,
  },
};
