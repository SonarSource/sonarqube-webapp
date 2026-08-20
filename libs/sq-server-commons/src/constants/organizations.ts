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

// SonarQube Server has no organizations. Architecture pages are still scoped to an
// organization id on the backend, so we key them on the default organization — this UUID
// matches the backend's `DefaultOrganizationProvider.ID` and is what the server auto-fills
// via `@OrganizationId` when the parameter is omitted (an empty string and an absent param
// are accepted too, all resolving to the same default org).
//
// Keep this value non-empty. The shared architecture query hooks gate on
// `enabled: Boolean(organizationId)`, so returning '' or undefined here would silently
// disable the org-scoped pages (blank lists, no requests fired) instead of failing loudly.
// Those guards are load-bearing on SonarCloud too — e.g. the project-relationships surface,
// where the org id resolves asynchronously — so don't "simplify" this to ''.
export const DEFAULT_ORGANIZATION_ID = '00000000-0000-4000-0000-000000000000';
