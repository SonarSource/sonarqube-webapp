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
 * Gates the whole Vortex dashboard page. Lives in `libs/shared` (not re-exported from
 * `feature-vortex-dashboard`) because `sq-server-adapters` sits inside `sq-server-commons`
 * (`visibility:public`) and cannot import from `feature-vortex-dashboard`
 * (`visibility:private`) — see `~adapters/queries/vortex-entitlement` on each platform.
 *
 * Server derives this from `usePurchasableFeatureQuery`; Cloud from cag-hub's
 * `GET /cag/cag-entitlement/{organizationId}`. The two sources don't line up state-for-state
 * (Hub's `disabled` reason is Server-only, and Hub's `blocked` reason is the only way Server's
 * "purchased but not enabled" state surfaces on Cloud) — this shape only exposes what both sides
 * can agree on.
 */
export interface VortexEntitlement {
  /** Usable right now. */
  isEnabled: boolean;
  isError: boolean;
  isLoading: boolean;
  /** Has an access path, independent of current consumption/availability. */
  isPurchased: boolean;
  refetch: () => void;
}
