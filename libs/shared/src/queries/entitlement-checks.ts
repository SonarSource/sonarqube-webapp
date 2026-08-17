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

import { UseQueryResult } from '@tanstack/react-query';
import { EntitlementCheck, EntitlementCheckFeatureKey, ResourceType } from '../types/billing';
import { QueryOptionsType } from './common';

export interface EntitlementCheckParams {
  featureKey: EntitlementCheckFeatureKey;
  /** Accepted for SQC parity; a server instance has a single implicit resource. */
  resourceId?: string;
  resourceType?: ResourceType;
}

/**
 * Module-level so the reference stays stable across renders, which is what lets
 * `useQueries` memoize the combined result instead of rebuilding it every render.
 */
export function combineEntitlementChecks(results: UseQueryResult<EntitlementCheck>[]) {
  const data: EntitlementCheck[] = [];
  for (const result of results) {
    if (result.data) {
      data.push(result.data);
    }
  }

  return {
    data,
    isError: results.some((result) => result.isError),
    isFetching: results.some((result) => result.isFetching),
    isPending: results.some((result) => result.isPending),
    isLoading: results.some((result) => result.isLoading),
  };
}

/** Community has no billing backend, so every feature resolves as not entitled. */
export function notEntitled(featureKey: EntitlementCheckFeatureKey): EntitlementCheck {
  return { featureKey, entitled: false, consumption: null, value: null, excludedValues: [] };
}

export type EntitlementCheckQueryFunctionType = <SelectType = EntitlementCheck>(
  params: EntitlementCheckParams,
  options?: QueryOptionsType<EntitlementCheck, Error, SelectType, (string | undefined)[]>,
) => UseQueryResult<SelectType>;
