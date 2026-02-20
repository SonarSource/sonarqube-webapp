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
import { SourceLine } from '../../../types/source';
import { AbstractServiceMock } from '../AbstractServiceMock';

interface SourceServiceData {
  sources: {
    [componentKey: string]: SourceLine[];
  };
}

export class SourceServiceMock extends AbstractServiceMock<SourceServiceData> {
  handlers = [
    http.get('/api/sources/lines', ({ request }) => {
      const params = this.getQueryParams(request);
      const key = params.get('key');
      const from = params.get('from');
      const to = params.get('to');

      if (!key || !from || !to) {
        return this.errors('Key, from and to are required');
      }
      if (!this.data.sources[key]) {
        return this.ok({ sources: [] });
      }
      if (Number(from) > Number(to)) {
        return this.errors('From is greater than to');
      }
      if (Number(from) < 1) {
        return this.errors('From is less than 1');
      }
      return this.ok({ sources: this.data.sources[key].slice(Number(from) - 1, Number(to)) });
    }),
  ];
}

export const SourceServiceDefaultDataset: SourceServiceData = {
  sources: {
    component1: [
      { line: 1, code: 'console.log("Hello, world!");' },
      { line: 2, code: 'console.log("Hello, world!");' },
    ],
    component2: [
      { line: 1, code: 'console.log("Hello, world!");' },
      { line: 2, code: 'console.log("Hello, world!");' },
    ],
  },
};
