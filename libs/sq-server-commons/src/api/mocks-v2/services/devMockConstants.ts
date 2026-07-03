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
 * Shared constants for the architecture dev-server MSW mocks. Navigate to
 * /project/deviations?id=my-project (or current_architecture / intended_architecture)
 * to hit the architecture pages.
 */
export const PROJECT_KEY = 'my-project';
export const PROJECT_NAME = 'My Project';

/** Synthetic branch UUID: must be non-empty for ArchitectureContainer to enable graph queries. */
export const MAIN_BRANCH_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
