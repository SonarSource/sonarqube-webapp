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

import { useCurrentUser } from './users';

export interface ArchitectureEntitlement {
  allowed: boolean;
  isLoading: boolean;
}

export function useArchitectureEntitlement(): ArchitectureEntitlement {
  const { isLoggedIn } = useCurrentUser();

  // TODO: temporary — SQS has no entitlement backend yet, so access is granted to any logged-in
  // user (mirrors the SQC adapter's guard for logged-out users, see SONAR-31643). This is the sole
  // gate for architecture add-on access on SQS (see feature-flags.ts, which keeps
  // designArchitectureSquadExtensionPack off). Once Server has a real entitlement check, flip this
  // single return to call it — mirror the SQC adapter's useEntitlementCheckQuery shape.
  return { allowed: isLoggedIn, isLoading: false };
}
