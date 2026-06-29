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

import * as v from 'valibot';
import { ApiResourceUuidSchema, assertApiResourceUuid } from '../api-resource-validation';

describe('ApiResourceUuidSchema (SSF-982)', () => {
  it.each([['123e4567-e89b-12d3-a456-426614174000'], ['123E4567-E89B-12D3-A456-426614174000']])(
    'accepts safe id %s',
    (id) => {
      expect(v.safeParse(ApiResourceUuidSchema, id).success).toBe(true);
      expect(assertApiResourceUuid(id, 'portfolioId')).toBe(true);
    },
  );

  it.each([
    ['portfolio-id-1'],
    ['myorg:my-portfolio.v2'],
    ['../../arbitrary/path'],
    [String.raw`..\arbitrary\path`],
    ['%2e%2e%2f'],
    ['123e4567-e89b-12d3-a456-42661417400'],
    ['123e4567-e89b-12d3-a456-4266141740000'],
    ['\tportfolio-id'],
    ['portfolio\x7f'],
    [''],
  ])('rejects unsafe id %j', (id) => {
    expect(v.safeParse(ApiResourceUuidSchema, id).success).toBe(false);
    expect(assertApiResourceUuid(id, 'portfolioId')).toBe(false);
  });

  it('rejects null and undefined for helper', () => {
    expect(assertApiResourceUuid(null, 'portfolioId')).toBe(false);
    expect(assertApiResourceUuid(undefined, 'portfolioId')).toBe(false);
  });

  it('returns false for backend-aligned invalid id example', () => {
    expect(assertApiResourceUuid('maliciousdelicious', 'portfolioId')).toBe(false);
  });
});
