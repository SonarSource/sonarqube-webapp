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

import { differenceInYears } from 'date-fns';
import { isEqual, sortBy } from 'lodash';
import { RuleCompare } from '../api/quality-profiles';
import { PROFILE_COMPARE_PATH, PROFILE_PATH } from '../constants/paths';
import { isValidDate, parseDate } from '../helpers/dates';
import { queryToSearchString } from '../sonar-aligned/helpers/urls';
import { BaseProfile, Profile } from '../types/quality-profiles';

/**
 * The "Sonar way" family is shown before any other profile for a given language, in this fixed order; everything
 * else falls back to alphabetical order by name. Mirrors the backend's `SearchAction.PINNED_DISPLAY_NAME_ORDER`.
 */
const PINNED_PROFILE_NAME_ORDER = [
  'Sonar way core',
  'Sonar way extended',
  'Sonar way comprehensive',
];

function pinnedProfileNameRank(profile: BaseProfile) {
  if (!profile.isBuiltIn) {
    // a custom profile must never be pinned, even if it happens to be named e.g. "Sonar way core"
    return PINNED_PROFILE_NAME_ORDER.length;
  }
  const index = PINNED_PROFILE_NAME_ORDER.indexOf(profile.name);
  return index === -1 ? PINNED_PROFILE_NAME_ORDER.length : index;
}

export function sortProfiles(profiles: BaseProfile[]): Profile[] {
  const result: Profile[] = [];
  const sorted = sortBy(profiles, [pinnedProfileNameRank, 'name']);

  function retrieveChildren(parent: BaseProfile | null) {
    return sorted.filter(
      (p) =>
        (parent == null && p.parentKey == null) || (parent != null && p.parentKey === parent.key),
    );
  }

  function putProfile(profile: BaseProfile | null = null, depth = 1) {
    const children = retrieveChildren(profile);

    if (profile != null) {
      result.push({ ...profile, childrenCount: children.length, depth });
    }

    children.forEach((child) => {
      putProfile(child, depth + 1);
    });
  }

  sorted
    .filter(
      (profile) =>
        profile.parentKey == null || sorted.find((p) => p.key === profile.parentKey) == null,
    )
    .forEach((profile) => {
      putProfile(profile);
    });

  return result;
}

export function isStagnant(profile: Profile): boolean {
  if (profile.rulesUpdatedAt) {
    const updateDate = parseDate(profile.rulesUpdatedAt);
    if (isValidDate(updateDate)) {
      return differenceInYears(new Date(), updateDate) >= 1;
    }
  }
  return false;
}

export const getProfilesForLanguagePath = (language: string) => ({
  pathname: PROFILE_PATH,
  search: queryToSearchString({ language }),
});

export const getProfileComparePath = (name: string, language: string, withKey?: string) => {
  const query = { language, name };
  if (withKey) {
    Object.assign(query, { withKey });
  }
  return {
    pathname: PROFILE_COMPARE_PATH,
    search: queryToSearchString(query),
  };
};

export const getProfileChangelogPath = (
  name: string,
  language: string,
  filter?: { since?: string; to?: string },
) => {
  const query = { language, name };
  if (filter) {
    if (filter.since) {
      Object.assign(query, { since: filter.since });
    }
    if (filter.to) {
      Object.assign(query, { to: filter.to });
    }
  }
  return {
    pathname: `${PROFILE_PATH}/changelog`,
    search: queryToSearchString(query),
  };
};

export const isProfileComparePath = (pathname: string): boolean => {
  return pathname === PROFILE_COMPARE_PATH;
};

export const filterModifiedCompareResultsByMode = (
  modified: Array<RuleCompare & Required<Pick<RuleCompare, 'left' | 'right'>>>,
  isStandardMode: boolean,
) => {
  return modified.filter(({ left, right }) => {
    if (!isEqual(left.params, right.params)) {
      return true;
    }

    if (isStandardMode) {
      return left.severity !== right.severity;
    }

    return !isEqual(left.impacts, right.impacts);
  });
};
