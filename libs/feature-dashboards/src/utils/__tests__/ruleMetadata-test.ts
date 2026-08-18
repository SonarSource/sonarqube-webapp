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

import { searchRulesResponseToRuleMetadata } from '../ruleMetadata';

function mockResponse(rules: ReadonlyArray<{ key: string; langName?: string; name: string }>) {
  return { rules };
}

describe('searchRulesResponseToRuleMetadata', () => {
  it('returns empty metadata when the response is missing or has no rules', () => {
    expect(searchRulesResponseToRuleMetadata(undefined)).toEqual({});
    expect(searchRulesResponseToRuleMetadata(mockResponse([]))).toEqual({});
  });

  it('maps name and langName keyed by rule key', () => {
    const metadata = searchRulesResponseToRuleMetadata(
      mockResponse([
        { key: 'java:S1', langName: 'Java', name: 'Rule one' },
        { key: 'ts:S2', name: 'Rule two' },
      ]),
    );

    expect(metadata).toEqual({
      'java:S1': { langName: 'Java', name: 'Rule one' },
      'ts:S2': { langName: undefined, name: 'Rule two' },
    });
  });
});
