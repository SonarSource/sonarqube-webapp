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

export function isDefined<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null;
}

export function isStringDefined<T extends string>(x: T | undefined | null): x is T {
  return isDefined(x) && x !== '';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Narrows a possibly-nullish value to its non-nullable type, throwing when the
 * invariant is violated.
 *
 * Use for values that cannot legitimately be absent, in place of a `!` non-null
 * assertion: this fails at the violation with a readable message instead of
 * failing later as `Cannot read properties of undefined`.
 *
 * For values that CAN legitimately be absent, narrow with `isDefined` and handle
 * the empty case instead.
 *
 * Never use this in a React render path (component body, or a `useMemo` that runs
 * on every render): the throw is intercepted by the nearest error boundary before
 * it ever reaches a global handler, so nothing gets reported - it just silently
 * unmounts that route's content. Use `ensureOrReport` (in `./ensureOrReport`)
 * there instead.
 *
 * Deliberately kept in this file, dependency-free: `types.ts` is a near-universal
 * leaf import (including from Web Worker entry points), so it must never pull in
 * app-level code like the reportError adapter - that's why ensureOrReport lives in
 * its own file instead of alongside this one.
 */
export function ensure<T>(value: T | undefined | null, message: string): NonNullable<T> {
  if (value === undefined || value === null) {
    // Outside a render path, an uncaught throw does reach the global handler and gets reported.
    throw new Error(message);
  }

  return value;
}
