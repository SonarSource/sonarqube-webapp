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

import { cloneDeep } from 'lodash';
import { DefaultBodyType, HttpResponse, JsonBodyType, RequestHandler, StrictRequest } from 'msw';
import { HttpStatus } from '../../types/request';

type Literal<T> = T extends string ? (string extends T ? never : T) : never;

type Paginate<T, A extends string> = {
  [at in `${A}`]: T[];
} & {
  p: number;
  ps: number;
  total: number;
};

export abstract class AbstractServiceMock<T = {}> {
  private readonly initialData: T;
  data: T;
  handlers: RequestHandler[] = [];

  constructor(initData: T) {
    this.initialData = cloneDeep(initData);
    this.data = cloneDeep(this.initialData);
  }

  getHandlers() {
    return this.handlers;
  }

  paginateResponse<T, A extends string>(
    attribute: Literal<A>,
    data: T[],
    page = 1,
    ps = 50,
  ): Paginate<T, typeof attribute> {
    return {
      p: page,
      ps,
      total: data.length,
      [attribute]: data.slice((page - 1) * ps, page * ps),
    } as Paginate<T, typeof attribute>;
  }

  ok<T extends JsonBodyType>(body: T) {
    return HttpResponse.json(body, {
      status: HttpStatus.Ok,
    });
  }

  errors<T extends JsonBodyType>(...args: string[]) {
    return this.errorsWithStatus<T>(HttpStatus.NotFound, ...args);
  }

  errorsWithStatus<T extends JsonBodyType>(status: HttpStatus, ...args: string[]) {
    return HttpResponse.json<T>(
      {
        errors: args.map((msg) => ({ msg })),
      } as unknown as T,
      { status },
    );
  }

  getQueryParams(request: StrictRequest<DefaultBodyType>) {
    return new URL(request.url).searchParams;
  }

  reset() {
    this.data = cloneDeep(this.initialData);
  }
}
