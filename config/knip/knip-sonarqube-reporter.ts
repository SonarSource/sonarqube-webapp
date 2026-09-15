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
 * Knip custom reporter that writes SonarQube's generic external-issues JSON format.
 * A single report is shared by sq-cloud and sq-server scans; each Sonar analysis
 * imports only issues on files in its own sonar.sources / inclusions / exclusions.
 * @see https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/importing-external-issues/generic-issue-data
 */

import type { Issue, IssueType, Reporter } from 'knip';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';

const OUTPUT_PATH = 'build/reports/knip/external-issues.json';
const ENGINE_ID = 'knip';

type SonarImpactSeverity = 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type SonarStandardSeverity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

type SonarRule = {
  id: string;
  name: string;
  description: string;
  engineId: string;
  cleanCodeAttribute: string;
  type: 'CODE_SMELL';
  severity: SonarStandardSeverity;
  impacts: Array<{ softwareQuality: 'MAINTAINABILITY'; severity: SonarImpactSeverity }>;
};

type SonarIssue = {
  ruleId: string;
  primaryLocation: {
    message: string;
    filePath: string;
    textRange: {
      startLine: number;
      endLine: number;
      startColumn?: number;
      endColumn?: number;
    };
  };
};

export type SonarExternalIssuesReport = {
  issues: SonarIssue[];
  rules: SonarRule[];
};

const ISSUE_TYPE_META: Record<
  IssueType,
  { name: string; description: string; impact: SonarImpactSeverity }
> = {
  binaries: {
    name: 'Unlisted binary',
    description:
      'A binary is referenced in configuration or scripts but is not listed in package.json.',
    impact: 'MEDIUM',
  },
  catalog: {
    name: 'Unused catalog entry',
    description: 'A dependency catalog entry is not referenced by any workspace.',
    impact: 'LOW',
  },
  dependencies: {
    name: 'Unused production dependency',
    description:
      'A production dependency is listed in package.json but is not referenced by configured production code.',
    impact: 'MEDIUM',
  },
  devDependencies: {
    name: 'Unused development dependency',
    description:
      'A development dependency is listed in package.json but is not referenced by configured development code.',
    impact: 'LOW',
  },
  duplicates: {
    name: 'Duplicate export',
    description: 'The same export is defined more than once in the project graph.',
    impact: 'MEDIUM',
  },
  enumMembers: {
    name: 'Unreferenced production enum member',
    description: 'An exported enum member has no references in configured production code.',
    impact: 'LOW',
  },
  exports: {
    name: 'Unreferenced production export',
    description: 'An exported symbol has no references in configured production code.',
    impact: 'LOW',
  },
  files: {
    name: 'Dead production file',
    description: 'A production file is not reachable from any configured production entry point.',
    impact: 'HIGH',
  },
  namespaceMembers: {
    name: 'Unreferenced production namespace member',
    description: 'An exported namespace member has no references in configured production code.',
    impact: 'LOW',
  },
  nsExports: {
    name: 'Unreferenced production namespace export',
    description:
      'A namespace export is not referenced even though its namespace is used by configured production code.',
    impact: 'LOW',
  },
  nsTypes: {
    name: 'Unreferenced production namespace type',
    description:
      'An exported namespace type is not referenced even though its namespace is used by configured production code.',
    impact: 'LOW',
  },
  optionalPeerDependencies: {
    name: 'Referenced optional peer dependency',
    description: 'An optional peer dependency is referenced but is not declared as expected.',
    impact: 'LOW',
  },
  types: {
    name: 'Unreferenced production type',
    description: 'An exported type has no references in configured production code.',
    impact: 'LOW',
  },
  unlisted: {
    name: 'Unlisted dependency',
    description: 'A dependency is imported but is not listed in package.json.',
    impact: 'HIGH',
  },
  unresolved: {
    name: 'Unresolved import',
    description: 'An import cannot be resolved from the project graph.',
    impact: 'HIGH',
  },
};

function getRuleId(issueType: IssueType): string {
  return `${ENGINE_ID}:${issueType}`;
}

function toStandardSeverity(severity: SonarImpactSeverity): SonarStandardSeverity {
  switch (severity) {
    case 'BLOCKER':
      return 'BLOCKER';
    case 'HIGH':
      return 'CRITICAL';
    case 'MEDIUM':
      return 'MAJOR';
    case 'LOW':
      return 'MINOR';
    case 'INFO':
      return 'INFO';
  }
}

function toRelativePath(filePath: string, cwd: string): string {
  return relative(cwd, filePath).replaceAll('\\', '/');
}

function formatSymbol(symbol: string, parentSymbol?: string): string {
  return `"${symbol}"${parentSymbol ? ` (${parentSymbol})` : ''}`;
}

function createIssueMessage(
  issue: Issue,
  issueType: IssueType,
  relativeFilePath: string,
  symbol: string,
): string {
  const formattedSymbol = formatSymbol(symbol, issue.parentSymbol);

  switch (issueType) {
    case 'binaries':
      return `Unlisted binary ${formattedSymbol}: it is referenced in configuration or scripts but is not listed in package.json.`;
    case 'catalog':
      return `Unused catalog entry ${formattedSymbol}: it is not referenced by any workspace.`;
    case 'dependencies':
      return `Unused production dependency ${formattedSymbol}: it is not referenced by configured production code.`;
    case 'devDependencies':
      return `Unused development dependency ${formattedSymbol}: it is not referenced by configured development code.`;
    case 'duplicates':
      return `Duplicate export ${formattedSymbol} in ${relativeFilePath}.`;
    case 'enumMembers':
      return `Unreferenced production enum member ${formattedSymbol}: it has no references in configured production code in ${relativeFilePath}.`;
    case 'exports':
      return `Unreferenced production export ${formattedSymbol}: it has no references in configured production code in ${relativeFilePath}.`;
    case 'files':
      return `Dead production code: file "${relativeFilePath}" is not reachable from any configured production entry point.`;
    case 'namespaceMembers':
      return `Unreferenced production namespace member ${formattedSymbol}: it has no references in configured production code in ${relativeFilePath}.`;
    case 'nsExports':
      return `Unreferenced production namespace export ${formattedSymbol}: it has no references in configured production code in ${relativeFilePath}.`;
    case 'nsTypes':
      return `Unreferenced production namespace type ${formattedSymbol}: it has no references in configured production code in ${relativeFilePath}.`;
    case 'optionalPeerDependencies':
      return `Referenced optional peer dependency ${formattedSymbol} is not declared as expected in ${relativeFilePath}.`;
    case 'types':
      return `Unreferenced production type ${formattedSymbol}: it has no references in configured production code in ${relativeFilePath}.`;
    case 'unlisted':
      return `Unlisted dependency ${formattedSymbol}: it is imported but is not listed in package.json.`;
    case 'unresolved':
      return `Unresolved import ${formattedSymbol} in ${relativeFilePath}: it cannot be resolved from the project graph.`;
  }
}

function createTextRange(line?: number, col?: number) {
  const startLine = line ?? 1;

  if (col === undefined) {
    return {
      endLine: startLine,
      startLine,
    };
  }

  // Knip columns are 1-based; Sonar generic issue columns are 0-based offsets.
  const startColumn = Math.max(col - 1, 0);

  return {
    endColumn: startColumn + 1,
    endLine: startLine,
    startColumn,
    startLine,
  };
}

function createSonarIssue(
  issue: Issue,
  issueType: IssueType,
  cwd: string,
  symbolOverride?: { col?: number; line?: number; symbol: string },
): SonarIssue {
  const relativeFilePath = toRelativePath(issue.filePath, cwd);
  const symbol = symbolOverride?.symbol ?? issue.symbol;
  const line = symbolOverride?.line ?? issue.line;
  const col = symbolOverride?.col ?? issue.col;
  const message = createIssueMessage(issue, issueType, relativeFilePath, symbol);

  return {
    primaryLocation: {
      filePath: relativeFilePath,
      message,
      textRange: createTextRange(line, col),
    },
    ruleId: getRuleId(issueType),
  };
}

export function buildSonarReport(
  issuesByType: Array<{ issueType: IssueType; issues: Issue[] }>,
  cwd: string,
): SonarExternalIssuesReport {
  const rulesById = new Map<string, SonarRule>();
  const sonarIssues: SonarIssue[] = [];

  for (const { issueType, issues } of issuesByType) {
    const meta = ISSUE_TYPE_META[issueType];
    const ruleId = getRuleId(issueType);

    if (!rulesById.has(ruleId)) {
      rulesById.set(ruleId, {
        cleanCodeAttribute: 'FOCUSED',
        description: meta.description,
        engineId: ENGINE_ID,
        id: ruleId,
        impacts: [{ severity: meta.impact, softwareQuality: 'MAINTAINABILITY' }],
        name: meta.name,
        severity: toStandardSeverity(meta.impact),
        type: 'CODE_SMELL',
      });
    }

    for (const issue of issues) {
      if (issue.isFixed || issue.severity === 'off') {
        continue;
      }

      if (issueType === 'duplicates' && issue.symbols) {
        for (const symbol of issue.symbols) {
          sonarIssues.push(
            createSonarIssue(issue, issueType, cwd, {
              col: symbol.col,
              line: symbol.line,
              symbol: symbol.symbol,
            }),
          );
        }
        continue;
      }

      sonarIssues.push(createSonarIssue(issue, issueType, cwd));
    }
  }

  sonarIssues.sort(
    (a, b) =>
      a.primaryLocation.filePath.localeCompare(b.primaryLocation.filePath) ||
      a.primaryLocation.textRange.startLine - b.primaryLocation.textRange.startLine ||
      a.ruleId.localeCompare(b.ruleId),
  );

  return {
    issues: sonarIssues,
    rules: [...rulesById.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function flattenKnipIssues(
  issues: Parameters<Reporter>[0]['issues'],
  issueType: IssueType,
): Issue[] {
  const bucket = issues[issueType];

  if (bucket instanceof Set) {
    return [...bucket].map(
      (filePath) =>
        ({
          filePath,
          fixes: [],
          severity: 'error',
          symbol: filePath,
          type: issueType,
        }) as Issue,
    );
  }

  return Object.values(bucket).flatMap((issuesBySymbol) => Object.values(issuesBySymbol));
}

function writeReport(outputPath: string, report: SonarExternalIssuesReport): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

const sonarqubeReporter: Reporter = ({ cwd, issues, report }) => {
  const issuesByType = Object.entries(report)
    .filter(([, isEnabled]) => isEnabled)
    .map(([issueType]) => ({
      issueType: issueType as IssueType,
      issues: flattenKnipIssues(issues, issueType as IssueType),
    }))
    .filter(({ issues: typeIssues }) => typeIssues.length > 0);

  writeReport(OUTPUT_PATH, buildSonarReport(issuesByType, cwd));
};

export default sonarqubeReporter;
