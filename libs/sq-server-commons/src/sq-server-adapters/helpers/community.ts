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

/**
 * SharedCommunityLink entries are consistent across cloud and server.
 * Though they may not necessarily have the same URL,
 * they deal with the same subject matter
 */
export enum SharedCommunityLink {
  ArchitectureManagementResources = '/t/resources-for-architecture-management/177657',
}

const COMMUNITY_URL = 'https://community.sonarsource.com';

/**
 * This function looks like a hook for the purpose of alignment
 * but is not a true hook.
 */
export function useSharedCommunityUrl(to: SharedCommunityLink): string;
export function useSharedCommunityUrl(): (to: SharedCommunityLink) => string;
export function useSharedCommunityUrl(to?: SharedCommunityLink) {
  if (to) {
    return `${COMMUNITY_URL}${to}`;
  }
  return (to: SharedCommunityLink) => `${COMMUNITY_URL}${to}`;
}
