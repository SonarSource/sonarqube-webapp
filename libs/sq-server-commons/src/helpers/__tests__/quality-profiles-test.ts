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

import {
  QUALITY_PROFILE_SONAR_AGENTIC_AI,
  QUALITY_PROFILE_SONAR_WAY,
  getBuiltInQualityProfileHelpTextKey,
} from '../quality-profiles';

describe('getBuiltInQualityProfileHelpTextKey', () => {
  it('should return help text key for built-in agentic profile', () => {
    const result = getBuiltInQualityProfileHelpTextKey({
      isBuiltIn: true,
      name: QUALITY_PROFILE_SONAR_AGENTIC_AI,
    });

    expect(result).toBe('quality_profiles.sonar_agentic_ai.help_text');
  });

  it('should return help text key for built-in Sonar way profile', () => {
    const result = getBuiltInQualityProfileHelpTextKey({
      isBuiltIn: true,
      name: QUALITY_PROFILE_SONAR_WAY,
    });

    expect(result).toBe('quality_profiles.sonar_way.help_text');
  });

  it('should return undefined for non-built-in profile', () => {
    const result = getBuiltInQualityProfileHelpTextKey({
      isBuiltIn: false,
      name: QUALITY_PROFILE_SONAR_WAY,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for built-in profile with unknown name', () => {
    const result = getBuiltInQualityProfileHelpTextKey({
      isBuiltIn: true,
      name: 'Custom Profile',
    });

    expect(result).toBeUndefined();
  });

  it(`should return undefined when isBuiltIn is false and name is ${QUALITY_PROFILE_SONAR_AGENTIC_AI}`, () => {
    const result = getBuiltInQualityProfileHelpTextKey({
      isBuiltIn: false,
      name: QUALITY_PROFILE_SONAR_AGENTIC_AI,
    });

    expect(result).toBeUndefined();
  });
});
