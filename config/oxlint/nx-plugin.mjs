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

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const LINT_TARGETS = ['lint', 'lint-report', 'lint-files'];

function hasLintableSources(projectFile, workspaceRoot) {
  const projectRoot = join(workspaceRoot, dirname(projectFile));
  if (existsSync(join(projectRoot, 'src'))) {
    return true;
  }
  const { targets = {} } = JSON.parse(readFileSync(join(workspaceRoot, projectFile), 'utf8'));
  return LINT_TARGETS.some((target) => target in targets);
}

export const createNodesV2 = [
  '**/project.json',
  (projectFiles, _options, context) =>
    projectFiles
      .filter((projectFile) => hasLintableSources(projectFile, context.workspaceRoot))
      .map((projectFile) => [
        projectFile,
        {
          projects: {
            [dirname(projectFile)]: {
              targets: Object.fromEntries(
                LINT_TARGETS.map((target) => [
                  target,
                  { executor: 'nx:run-commands', metadata: { technologies: ['oxlint'] } },
                ]),
              ),
            },
          },
        },
      ]),
];
