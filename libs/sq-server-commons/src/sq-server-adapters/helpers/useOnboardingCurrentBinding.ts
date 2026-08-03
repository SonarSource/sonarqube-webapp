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

import { OnboardingCurrentBinding } from '~shared/types/onboarding';

/**
 * SQ-Server has no organizations, and DevOps platform configurations are instance-wide rather than
 * bound to one DevOps organization, so there is no "organization → DevOps organization" pair to
 * show. Always `undefined`, which tells callers to omit the current-binding row.
 */
export function useOnboardingCurrentBinding(): OnboardingCurrentBinding | undefined {
  return undefined;
}
