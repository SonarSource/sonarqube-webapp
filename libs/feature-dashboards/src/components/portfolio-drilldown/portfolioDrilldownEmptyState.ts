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

export enum PortfolioDrilldownEmptyState {
  NoComputedRating = 'no-computed-rating',
  NoData = 'no-data',
  Permissions = 'permissions',
  ZeroIssueCount = 'zero-issue-count',
}

interface PortfolioDrilldownEmptyStateSignals {
  hasNoAccessibleProjects?: boolean;
  hasNoComputedRating?: boolean;
  hasNoData?: boolean;
  hasZeroIssueCount?: boolean;
}

/**
 * Resolves mutually competing breakdown empty states in product-independent priority order.
 * Permission loss is the most actionable cause; missing rating/data then take precedence over a
 * legitimate zero because they explain why the value cannot be interpreted as a measured zero.
 */
export function resolvePortfolioDrilldownEmptyState(
  signals: Readonly<PortfolioDrilldownEmptyStateSignals>,
): PortfolioDrilldownEmptyState | undefined {
  if (signals.hasNoAccessibleProjects) {
    return PortfolioDrilldownEmptyState.Permissions;
  }

  if (signals.hasNoComputedRating) {
    return PortfolioDrilldownEmptyState.NoComputedRating;
  }

  if (signals.hasNoData) {
    return PortfolioDrilldownEmptyState.NoData;
  }

  if (signals.hasZeroIssueCount) {
    return PortfolioDrilldownEmptyState.ZeroIssueCount;
  }

  return undefined;
}
