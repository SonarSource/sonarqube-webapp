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

import type { Issue } from 'knip';
import { buildSonarReport } from '../knip-sonarqube-reporter';

describe('knip-sonarqube-reporter', () => {
  const cwd = '/repo';

  it('maps knip exports to Sonar external issue format', () => {
    const issue: Issue = {
      col: 10,
      filePath: `${cwd}/libs/shared/src/foo.ts`,
      fixes: [],
      line: 5,
      severity: 'error',
      symbol: 'unusedHelper',
      type: 'exports',
      workspace: '.',
    };

    const report = buildSonarReport([{ issueType: 'exports', issues: [issue] }], cwd);

    expect(report.rules).toEqual([
      expect.objectContaining({
        description: 'An exported symbol has no references in configured production code.',
        engineId: 'knip',
        id: 'knip:exports',
        impacts: [{ severity: 'LOW', softwareQuality: 'MAINTAINABILITY' }],
        name: 'Unreferenced production export',
        severity: 'MINOR',
      }),
    ]);
    expect(report.issues).toEqual([
      {
        primaryLocation: {
          filePath: 'libs/shared/src/foo.ts',
          message:
            'Unreferenced production export "unusedHelper": it has no references in configured production code in libs/shared/src/foo.ts.',
          textRange: {
            endColumn: 10,
            endLine: 5,
            startColumn: 9,
            startLine: 5,
          },
        },
        ruleId: 'knip:exports',
      },
    ]);
  });

  it('describes unused production files as dead code', () => {
    const report = buildSonarReport(
      [
        {
          issueType: 'files',
          issues: [
            {
              filePath: `${cwd}/libs/shared/src/unused.ts`,
              fixes: [],
              severity: 'error',
              symbol: 'libs/shared/src/unused.ts',
              type: 'files',
              workspace: '.',
            },
          ],
        },
      ],
      cwd,
    );

    expect(report.rules).toEqual([
      expect.objectContaining({
        description:
          'A production file is not reachable from any configured production entry point.',
        id: 'knip:files',
        name: 'Dead production file',
      }),
    ]);
    expect(report.issues[0].primaryLocation.message).toBe(
      'Dead production code: file "libs/shared/src/unused.ts" is not reachable from any configured production entry point.',
    );
  });

  it('keeps all product paths in one shared report', () => {
    const report = buildSonarReport(
      [
        {
          issueType: 'files',
          issues: [
            {
              filePath: `${cwd}/apps/sq-server/src/unused.ts`,
              fixes: [],
              severity: 'error',
              symbol: 'apps/sq-server/src/unused.ts',
              type: 'files',
              workspace: '.',
            },
            {
              filePath: `${cwd}/private/apps/sq-cloud/src/unused.ts`,
              fixes: [],
              severity: 'error',
              symbol: 'private/apps/sq-cloud/src/unused.ts',
              type: 'files',
              workspace: '.',
            },
          ],
        },
      ],
      cwd,
    );

    expect(report.issues.map((issue) => issue.primaryLocation.filePath).sort()).toEqual([
      'apps/sq-server/src/unused.ts',
      'private/apps/sq-cloud/src/unused.ts',
    ]);
  });
});
