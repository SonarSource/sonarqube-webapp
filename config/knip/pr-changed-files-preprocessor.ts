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
 * Knip PR-scoped preprocessor
 *
 * Knip scans the monorepo (see `knip.json`) and reports problems such as unused files,
 * unused exports, and unused dependencies. In CI we run it via `yarn knip:ci`, which uses
 * the `github-actions` reporter to attach findings as PR review annotations.
 *
 * A full Knip run surfaces hundreds of pre-existing issues. Showing all of them on every
 * PR would be noisy and discouraging. This module is a Knip "preprocessor": a hook that
 * runs after analysis and before reporting, letting us reshape the result set.
 *
 * Pipeline:  knip analysis  →  preprocessor (this file)  →  github-actions reporter
 *
 * When `KNIP_BASE_REF` is set (CI only), we keep an issue only if its `filePath` appears in
 * the PR diff. That way annotations land on files the author actually touched — e.g. a new
 * unused export in a file they edited, or a file they added that Knip flags as unreachable.
 * Locally `yarn knip` does not set `KNIP_BASE_REF`, so this file is a no-op and you see
 * the full report.
 *
 * Wired from `package.json`: `knip --preprocessor ./config/knip/pr-changed-files-preprocessor.ts`
 * CI sets `KNIP_BASE_REF=origin/<base>` in `.github/workflows/knip.yml`.
 */

import type { Issue, Issues, Preprocessor, ReporterOptions } from 'knip';
import { execSync } from 'node:child_process';
import { relative } from 'node:path';

// Every Knip report category uses the same nested shape (`IssueRecords`):
//   category → source file → symbol name → Issue
// e.g. `exports['src/foo.ts']['myHelper']` is one unused-export finding in foo.ts.
// The `files` category follows this shape too (symbol is the file path itself).
const ISSUE_TYPES = [
  'files',
  'dependencies',
  'devDependencies',
  'optionalPeerDependencies',
  'unlisted',
  'binaries',
  'unresolved',
  'exports',
  'nsExports',
  'types',
  'nsTypes',
  'enumMembers',
  'namespaceMembers',
  'duplicates',
  'catalog',
] as const;

type IssueType = (typeof ISSUE_TYPES)[number];

function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}

function getChangedFiles(baseRef: string, cwd: string): Set<string> {
  // `baseRef...HEAD` is a three-dot diff: commits on this branch since it diverged from the base.
  // Matches what GitHub shows as the PR diff, not a two-dot `base..HEAD` range.
  // `--diff-filter=ACMRT` skips pure deletions/renames-only — we can only annotate files that exist.
  const output = execSync(`git diff --name-only --diff-filter=ACMRT ${baseRef}...HEAD`, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return new Set(
    output
      .split('\n')
      .map((filePath) => filePath.trim())
      .filter(Boolean)
      .map(normalizePath),
  );
}

function isChangedFile(filePath: string, changedFiles: Set<string>, cwd: string): boolean {
  // Knip stores absolute paths on `Issue.filePath`; `git diff` returns repo-relative paths.
  const relativePath = normalizePath(relative(cwd, filePath));

  return changedFiles.has(relativePath);
}

function filterIssues(issues: Issues, changedFiles: Set<string>, cwd: string): Issues {
  const filteredIssues = {} as Issues;

  for (const issueType of ISSUE_TYPES) {
    const issueRecords = issues[issueType];
    const nextIssueRecords: Issues[IssueType] = {};

    // Walk each file that has findings, then each symbol within that file.
    for (const [recordKey, issuesBySymbol] of Object.entries(issueRecords)) {
      const nextIssuesBySymbol: Record<string, Issue> = {};

      for (const [symbol, issue] of Object.entries(issuesBySymbol)) {
        // Keep the issue when the file it points at was changed in this PR.
        // - exports/types/… → `filePath` is where the unused symbol is declared
        // - files → `filePath` is the unused file itself
        // - dependencies/… → `filePath` is usually package.json (only shown if that file changed)
        if (isChangedFile(issue.filePath, changedFiles, cwd)) {
          nextIssuesBySymbol[symbol] = issue;
        }
      }

      if (Object.keys(nextIssuesBySymbol).length > 0) {
        nextIssueRecords[recordKey] = nextIssuesBySymbol;
      }
    }

    filteredIssues[issueType] = nextIssueRecords;
  }

  return filteredIssues;
}

function countIssues(issues: Issues): ReporterOptions['counters'] {
  // Knip passes per-category counts to reporters (e.g. "Unused exports (3)" in the log).
  // Recompute after filtering so titles match the reduced issue set.
  const counters = {
    processed: 0,
    total: 0,
  } as ReporterOptions['counters'];

  for (const issueType of ISSUE_TYPES) {
    const count = Object.values(issues[issueType]).reduce(
      (sum, issuesBySymbol) => sum + Object.keys(issuesBySymbol).length,
      0,
    );

    counters[issueType] = count;
    counters.total += count;
  }

  return counters;
}

const preprocessor: Preprocessor = (options) => {
  const baseRef = process.env.KNIP_BASE_REF;

  if (!baseRef) {
    // Local `yarn knip` — pass results through unchanged.
    return options;
  }

  const changedFiles = getChangedFiles(baseRef, options.cwd);
  const issues = filterIssues(options.issues, changedFiles, options.cwd);

  return {
    ...options,
    issues,
    counters: countIssues(issues),
    // Config/tag hints suggest knip.json tweaks; irrelevant for PR annotations and suppressed
    // in CI via `--no-config-hints` anyway. Clear them so reporters don't emit extras.
    configurationHints: new Map(),
    tagHints: new Set(),
  };
};

export default preprocessor;
