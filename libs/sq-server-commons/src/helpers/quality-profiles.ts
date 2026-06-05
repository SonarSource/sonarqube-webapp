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

export const QUALITY_PROFILE_SONAR_WAY = 'Sonar way';

export const QUALITY_PROFILE_SONAR_AGENTIC_AI = 'Sonar agentic AI';

const BUILT_IN_PROFILES_HELPER_TEXTS_MAP: Record<string, string> = {
  [QUALITY_PROFILE_SONAR_AGENTIC_AI]: 'quality_profiles.sonar_agentic_ai.help_text',
  [QUALITY_PROFILE_SONAR_WAY]: 'quality_profiles.sonar_way.help_text',
};

export const getBuiltInQualityProfileHelpTextKey = (profile: {
  isBuiltIn?: boolean;
  name: string;
}) => {
  if (profile.isBuiltIn) {
    return BUILT_IN_PROFILES_HELPER_TEXTS_MAP[profile.name];
  }
  return undefined;
};
