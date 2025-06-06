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

import { mockLocation } from '../mocks/router';
import { queryToSearchString } from '../query';
import { searchParamsToQuery } from '../router';
import {
  getComponentIssuesUrl,
  getDeprecatedActiveRulesUrl,
  getHostUrl,
  getPathUrlAsString,
} from '../urls';

const SIMPLE_COMPONENT_KEY = 'sonarqube';
const COMPLEX_COMPONENT_KEY = 'org.sonarsource.sonarqube:sonarqube';
const COMPLEX_COMPONENT_KEY_ENCODED = encodeURIComponent(COMPLEX_COMPONENT_KEY);
const DEFAULT_QUERY = { issueStatuses: 'open' };

describe('#getHostUrl', () => {
  it('should return host url on client side', () => {
    expect(getHostUrl()).toBe('http://localhost');
  });
});

describe('getPathUrlAsString', () => {
  it('should correctly return a path as string url', () => {
    expect(getPathUrlAsString('/text/url')).toBe('/text/url');
    expect(getPathUrlAsString('text/url')).toBe('/text/url');
    expect(getPathUrlAsString(mockLocation({ search: '?search=1', hash: '#hash' }))).toBe(
      '/path?search=1#hash',
    );
    expect(getPathUrlAsString({})).toBe('');
  });
  it('should return component url', () => {
    expect(
      getPathUrlAsString({
        pathname: '/project/overview',
        search: queryToSearchString({ id: SIMPLE_COMPONENT_KEY }),
      }),
    ).toBe('/project/overview?id=' + SIMPLE_COMPONENT_KEY);
  });

  it('should encode component key', () => {
    expect(
      getPathUrlAsString({
        pathname: '/project/overview',
        search: queryToSearchString({ id: COMPLEX_COMPONENT_KEY }),
      }),
    ).toBe('/project/overview?id=' + COMPLEX_COMPONENT_KEY_ENCODED);
  });
});

describe('getComponentIssuesUrl', () => {
  it('should work without parameters', () => {
    expect(getComponentIssuesUrl(SIMPLE_COMPONENT_KEY)).toEqual(
      expect.objectContaining({
        pathname: '/project/issues',
        search: queryToSearchString({ id: SIMPLE_COMPONENT_KEY }),
      }),
    );
  });

  it('should work with parameters', () => {
    expect(getComponentIssuesUrl(SIMPLE_COMPONENT_KEY, DEFAULT_QUERY)).toEqual(
      expect.objectContaining({
        pathname: '/project/issues',
        search: queryToSearchString({
          ...DEFAULT_QUERY,
          id: SIMPLE_COMPONENT_KEY,
        }),
      }),
    );
  });
});

describe('getDeprecatedActiveRulesUrl', () => {
  it('should include query params', () => {
    expect(getDeprecatedActiveRulesUrl({ languages: 'js' })).toEqual({
      pathname: expect.stringMatching(/(\/coding_rules|\/organizations\/undefined\/rules)/),
      search: '?languages=js&activation=true&statuses=DEPRECATED',
    });
  });
  it('should handle empty query', () => {
    expect(getDeprecatedActiveRulesUrl()).toEqual({
      pathname: expect.stringMatching(/(\/coding_rules|\/organizations\/undefined\/rules)/),
      search: '?activation=true&statuses=DEPRECATED',
    });
  });
});

describe('searchParamsToQuery', () => {
  it('should handle arrays and single params', () => {
    const searchParams = new URLSearchParams([
      ['a', 'v1'],
      ['a', 'v2'],
      ['b', 'awesome'],
      ['a', 'v3'],
    ]);

    const result = searchParamsToQuery(searchParams);

    expect(result).toEqual({ a: ['v1', 'v2', 'v3'], b: 'awesome' });
  });
});

describe('queryToSearchString', () => {
  it('should handle query as array', () => {
    expect(
      queryToSearchString([
        ['key1', 'value1'],
        ['key1', 'value2'],
        ['key2', 'value1'],
      ]),
    ).toBe('?key1=value1&key1=value2&key2=value1');
  });

  it('should handle query as string', () => {
    expect(queryToSearchString('a=1')).toBe('?a=1');
  });

  it('should handle query as URLSearchParams', () => {
    expect(queryToSearchString(new URLSearchParams({ a: '1', b: '2' }))).toBe('?a=1&b=2');
  });

  it('should handle all types', () => {
    const query = {
      author: ['GRRM', 'JKR', 'Stross'],
      b1: true,
      b2: false,
      number: 0,
      emptyArray: [],
      normalString: 'hello',
      undef: undefined,
    };

    expect(queryToSearchString(query)).toBe(
      '?author=GRRM&author=JKR&author=Stross&b1=true&b2=false&number=0&normalString=hello',
    );
  });

  it('should handle an missing query', () => {
    expect(queryToSearchString()).toBeUndefined();
  });
});
