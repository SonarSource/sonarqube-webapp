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

import {
  Location as LocationRouter,
  NavigateFunction,
  NavigateOptions,
  URLSearchParamsInit,
} from 'react-router';

export type RawQuery = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- query params stay loosely typed until each screen parses them into its own domain model.

export type RouterNavigationTarget = string | Partial<Location>;
export type RouterNavigationOptions = Omit<NavigateOptions, 'replace'>;

export interface Location extends LocationRouter {
  query: RawQuery;
}

export interface Router {
  /**
   * Raw React Router navigation for the few cases that intentionally need delta navigation or the
   * promise-capable navigate semantics exposed by data routers.
   */
  navigate: NavigateFunction;
  push: (location: RouterNavigationTarget, navigateOptions?: RouterNavigationOptions) => void;
  replace: (location: RouterNavigationTarget, navigateOptions?: RouterNavigationOptions) => void;
  searchParams: URLSearchParams;
  setSearchParams: (
    nextInit: URLSearchParamsInit,
    navigateOptions?: { replace?: boolean; state?: unknown },
  ) => void;
}
