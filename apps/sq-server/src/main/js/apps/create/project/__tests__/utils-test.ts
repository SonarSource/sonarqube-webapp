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

import { mockLocation } from '~shared/helpers/mocks/router';
import { resolveGithubProjectImportState } from '../utils';

function encodeState(value: object): string {
  return btoa(JSON.stringify(value));
}

describe('resolveGithubProjectImportState', () => {
  it('returns false and leaves the query untouched when there is no state param', () => {
    const location = mockLocation({ query: { mode: 'github' } });

    expect(resolveGithubProjectImportState(location)).toBe(false);
    expect(location.query).toEqual({ mode: 'github' });
  });

  it('returns false and leaves state untouched when it is not valid base64/JSON', () => {
    const location = mockLocation({ query: { state: 'not-valid-base64-json' } });

    expect(resolveGithubProjectImportState(location)).toBe(false);
    expect(location.query.state).toBe('not-valid-base64-json');
  });

  it('returns false instead of throwing when state is valid JSON but decodes to null', () => {
    const state = btoa('null');
    const location = mockLocation({ query: { state } });

    expect(resolveGithubProjectImportState(location)).toBe(false);
    expect(location.query.state).toBe(state);
  });

  it('returns false instead of throwing when state is valid JSON but decodes to a non-object', () => {
    const state = btoa('42');
    const location = mockLocation({ query: { state } });

    expect(resolveGithubProjectImportState(location)).toBe(false);
    expect(location.query.state).toBe(state);
  });

  it('returns false and leaves state untouched when it decodes to an unrelated app', () => {
    const state = encodeState({ app: 'jira' });
    const location = mockLocation({ query: { state } });

    expect(resolveGithubProjectImportState(location)).toBe(false);
    expect(location.query.state).toBe(state);
  });

  it('merges mode and dopSetting and removes state on a minimal github_project_import state', () => {
    const state = encodeState({
      app: 'github_project_import',
      dopSetting: 'conf-github-2',
      mode: 'github',
    });
    const location = mockLocation({ query: { state } });

    expect(resolveGithubProjectImportState(location)).toBe(true);
    expect(location.query).toEqual({ mode: 'github', dopSetting: 'conf-github-2' });
  });

  it('sets mono when the state carries mono: true', () => {
    const state = encodeState({
      app: 'github_project_import',
      dopSetting: 'conf-github-2',
      mode: 'github',
      mono: true,
    });
    const location = mockLocation({ query: { state } });

    resolveGithubProjectImportState(location);

    expect(location.query.mono).toBe('true');
  });

  it('sets redirect when the state carries a redirect', () => {
    const state = encodeState({
      app: 'github_project_import',
      dopSetting: 'conf-github-2',
      mode: 'github',
      redirect: '/some/page',
    });
    const location = mockLocation({ query: { state } });

    resolveGithubProjectImportState(location);

    expect(location.query.redirect).toBe('/some/page');
  });

  it('does not set mono or redirect when absent from the state', () => {
    const state = encodeState({
      app: 'github_project_import',
      dopSetting: 'conf-github-2',
      mode: 'github',
    });
    const location = mockLocation({ query: { state } });

    resolveGithubProjectImportState(location);

    expect(location.query.mono).toBeUndefined();
    expect(location.query.redirect).toBeUndefined();
  });
});
