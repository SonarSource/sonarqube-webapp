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

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const OXLINT_BIN = join(dirname(require.resolve('oxlint/package.json')), 'bin/oxlint');

export const WORKSPACE_ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url))) + sep;

const SAFE_PATH = /^[\w ./@~+-]+$/;

export function resolveInWorkspace(path) {
  const resolvedPath = resolve(WORKSPACE_ROOT, path);
  if (!resolvedPath.startsWith(WORKSPACE_ROOT) || !SAFE_PATH.test(resolvedPath)) {
    throw new Error(`Path is outside the workspace: ${path}`);
  }
  return resolvedPath;
}

export function runOxlint(options, paths, spawnOptions) {
  return spawnSync(
    process.execPath,
    [OXLINT_BIN, ...options, '--', ...paths.map(resolveInWorkspace)],
    { cwd: WORKSPACE_ROOT, ...spawnOptions },
  );
}
