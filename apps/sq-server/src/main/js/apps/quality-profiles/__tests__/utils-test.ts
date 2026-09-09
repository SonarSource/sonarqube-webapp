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

import { Profile } from '~sq-server-commons/types/quality-profiles';
import { sortProfiles } from '~sq-server-commons/utils/quality-profiles-utils';

function createProfile(key: string, parentKey?: string) {
  return { name: key, key, parentKey } as Profile;
}

function createProfileWithName(key: string, name: string, isBuiltIn?: boolean) {
  return { name, key, isBuiltIn } as Profile;
}

describe('#sortProfiles', () => {
  it('should sort when no parents', () => {
    const profile1 = createProfile('profile1');
    const profile2 = createProfile('profile2');
    const profile3 = createProfile('profile3');
    expect(sortProfiles([profile1, profile2, profile3])).toMatchSnapshot();
  });

  it('should sort by name', () => {
    const profile1 = createProfile('profile1');
    const profile2 = createProfile('profile2');
    const profile3 = createProfile('profile3');
    expect(sortProfiles([profile3, profile1, profile2])).toMatchSnapshot();
  });

  it('should sort with children', () => {
    const child1 = createProfile('child1', 'parent');
    const child2 = createProfile('child2', 'parent');
    const parent = createProfile('parent');
    expect(sortProfiles([child1, child2, parent])).toMatchSnapshot();
  });

  it('should sort single branch', () => {
    const profile1 = createProfile('profile1');
    const profile2 = createProfile('profile2', 'profile3');
    const profile3 = createProfile('profile3', 'profile1');
    expect(sortProfiles([profile3, profile2, profile1])).toMatchSnapshot();
  });

  it('sorts partial set of inherited profiles', () => {
    const foo = createProfile('foo', 'bar');
    expect(sortProfiles([foo])).toMatchSnapshot();

    const profile1 = createProfile('profile1', 'x');
    const profile2 = createProfile('profile2');
    const profile3 = createProfile('profile3', 'profile2');
    expect(sortProfiles([profile1, profile2, profile3])).toMatchSnapshot();
  });

  it('should pin the built-in Sonar way family first, in fixed order, ahead of alphabetical', () => {
    const extended = createProfileWithName('extended', 'Sonar way extended', true);
    const zebra = createProfileWithName('zebra', 'Zebra Custom Profile');
    const comprehensive = createProfileWithName('comprehensive', 'Sonar way comprehensive', true);
    const another = createProfileWithName('another', 'Another Custom Profile');
    const core = createProfileWithName('core', 'Sonar way core', true);

    const result = sortProfiles([extended, zebra, comprehensive, another, core]);

    expect(result.map((p) => p.name)).toEqual([
      'Sonar way core',
      'Sonar way extended',
      'Sonar way comprehensive',
      'Another Custom Profile',
      'Zebra Custom Profile',
    ]);
  });

  it('should not pin a custom profile that happens to share a pinned name', () => {
    const builtInCore = createProfileWithName('builtin-core', 'Sonar way core', true);
    const customCore = createProfileWithName('custom-core', 'Sonar way core', false);
    const another = createProfileWithName('another', 'Another Custom Profile');

    const result = sortProfiles([customCore, another, builtInCore]);

    expect(result.map((p) => p.key)).toEqual(['builtin-core', 'another', 'custom-core']);
  });
});
