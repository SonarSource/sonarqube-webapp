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
 * Server talks to cag-hub through the `/cag` prefix directly. Cloud goes through the same hub
 * behind the `/context` prefix (see CAG-1127); `CagHubPathPrefixFilter` re-prefixes both onto the
 * same `/cag/**` routes server-side, so these are the only platform difference the impact reads
 * need. CAG-1147 (moving Cloud's ROI reads back onto `/cag`) only touches the Cloud file above.
 */
export const GUIDE_METRICS_PATH = '/cag/impact/guide-metrics';
export const VERIFY_METRICS_PATH = '/cag/impact/verify-metrics';
export const PROJECT_ACTIVITY_PATH = '/cag/impact/project-activity';
export const PROJECTS_PATH = '/cag/impact/projects';
