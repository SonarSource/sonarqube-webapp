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

import { reportError } from '~adapters/helpers/report-error';

// Caps a real violation to one Sentry event per message, however many nodes/edges/renders re-trigger it.
const reportedMessages = new Set<string>();

/**
 * Like `ensure`, but for a render path (component body or a `useMemo` run every
 * render): reports non-fatally instead of throwing, returning `fallback` so
 * rendering continues with a real, typed value. Only for invariants that should
 * never be false - if the value can legitimately be absent, use `isDefined` instead.
 *
 * Kept out of `./types`, which is a dependency-free leaf reachable from Web Worker
 * entry points; the reportError import must not leak into it.
 *
 * `message` must be a constant, not interpolated with an id - reports dedupe per
 * exact message, and a constant message is what lets Sentry group occurrences into
 * one issue. Put ids in `captureContext.extra` instead.
 */
export function ensureOrReport<T>(
  value: T | undefined | null,
  fallback: T,
  message: string,
  captureContext?: Record<string, unknown>,
): T {
  if (value === undefined || value === null) {
    if (!reportedMessages.has(message)) {
      reportedMessages.add(message);
      reportError(message, captureContext);
    }
    return fallback;
  }

  return value;
}
