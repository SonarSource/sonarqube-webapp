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

import { ANY_PROJECTS_FILTER, OnboardingDevopsPlatform } from '~shared/types/onboarding';
import {
  DevopsConfigurationRow,
  filterDevopsConfigurationRows,
  sliceDevopsConfigurationRows,
} from '../devopsConfigurationRows';

const GITHUB_MAIN: DevopsConfigurationRow = {
  alm: OnboardingDevopsPlatform.Github,
  id: 'gh-1',
  imported: 12,
  key: 'GitHub Main',
};

const GITHUB_LEGACY: DevopsConfigurationRow = {
  alm: OnboardingDevopsPlatform.Github,
  id: 'gh-2',
  imported: 0,
  key: 'GitHub Legacy',
};

const GITLAB_MAIN: DevopsConfigurationRow = {
  alm: OnboardingDevopsPlatform.Gitlab,
  id: 'gl-1',
  imported: undefined,
  key: 'GitLab Main',
};

const ROWS = [GITHUB_MAIN, GITHUB_LEGACY, GITLAB_MAIN];

const NO_FILTERS = { platform: ANY_PROJECTS_FILTER, query: '' } as const;

describe('filterDevopsConfigurationRows', () => {
  it('keeps every configuration when nothing is asked of it', () => {
    expect(filterDevopsConfigurationRows(ROWS, NO_FILTERS)).toEqual(ROWS);
  });

  it.each([
    ['a differently-cased name', 'github main'],
    ['a fragment of the name', 'Legac'],
    ['surrounding whitespace', '  gitlab  '],
  ])('matches the configuration name by %s', (_, query) => {
    expect(filterDevopsConfigurationRows(ROWS, { ...NO_FILTERS, query })).toHaveLength(1);
  });

  it('matches nothing rather than everything when the search has no hit', () => {
    expect(filterDevopsConfigurationRows(ROWS, { ...NO_FILTERS, query: 'bitbucket' })).toEqual([]);
  });

  it('narrows to a single platform', () => {
    expect(
      filterDevopsConfigurationRows(ROWS, {
        ...NO_FILTERS,
        platform: OnboardingDevopsPlatform.Github,
      }),
    ).toEqual([GITHUB_MAIN, GITHUB_LEGACY]);
  });

  it('applies the search and the platform together', () => {
    expect(
      filterDevopsConfigurationRows(ROWS, {
        platform: OnboardingDevopsPlatform.Github,
        query: 'main',
      }),
    ).toEqual([GITHUB_MAIN]);
  });
});

describe('sliceDevopsConfigurationRows', () => {
  it('returns the rows of the requested page', () => {
    expect(sliceDevopsConfigurationRows(ROWS, 2, 2)).toEqual([GITLAB_MAIN]);
  });

  it('returns nothing past the last page rather than wrapping around', () => {
    expect(sliceDevopsConfigurationRows(ROWS, 4, 2)).toEqual([]);
  });

  it('returns every row when the page is larger than the list', () => {
    expect(sliceDevopsConfigurationRows(ROWS, 1, 10)).toEqual(ROWS);
  });
});
