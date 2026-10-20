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

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const GIT_EXECUTABLE = '/usr/bin/git';

const TOKEN_DELIMITERS = new Set(['\t', '\n', '\r', ' ', '"', "'", '`', '(', ')', '{', '}']);

const TRAILING_PUNCTUATION = new Set([';', ',', '<', '>']);

const checkedExtensions = new Set([
  '.cjs',
  '.css',
  '.cts',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mdx',
  '.mjs',
  '.mts',
  '.scss',
  '.snap',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

const skippedFiles = new Set(['mockServiceWorker.js']);
const NO_TOKEN_START = -1;
const reportWidth = 100;
const reportContentWidth = reportWidth - 4;

function getCheckedRoots() {
  return process.argv.slice(2).filter(Boolean);
}

function getTrackedFiles(checkedRoots) {
  const args = ['ls-files'];

  if (checkedRoots.length > 0) {
    args.push('--', ...checkedRoots);
  }

  return execFileSync(GIT_EXECUTABLE, args, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
}

function shouldCheckFile(file) {
  return checkedExtensions.has(path.extname(file)) && !skippedFiles.has(path.basename(file));
}

function findUtilityStartIndex(token) {
  let bracketDepth = 0;

  for (let index = token.length - 1; index >= 0; index--) {
    const char = token[index];

    if (char === ']') {
      bracketDepth++;
      continue;
    }

    if (char === '[') {
      bracketDepth--;
      continue;
    }

    if (char === ':' && bracketDepth === 0) {
      return index + 1;
    }
  }

  return 0;
}

function stripTrailingPunctuation(token) {
  let endIndex = token.length;

  while (endIndex > 0 && TRAILING_PUNCTUATION.has(token[endIndex - 1])) {
    endIndex--;
  }

  return token.slice(0, endIndex);
}

function isEscaped(token, index) {
  return token[index - 1] === '\\';
}

function findFirstUnescapedColonIndex(token) {
  for (let index = 0; index < token.length; index++) {
    if (token[index] === ':' && !isEscaped(token, index)) {
      return index;
    }
  }

  return token.length;
}

function isOldTailwindPrefixUtilityName(utility) {
  const normalizedUtility = utility.replace(/^\\?!/, '');

  return (
    (normalizedUtility.startsWith('sw-') && normalizedUtility.length > 'sw-'.length) ||
    (normalizedUtility.startsWith('-sw-') && normalizedUtility.length > '-sw-'.length)
  );
}

function isOldTailwindPrefixUtilityToken(token) {
  const utilityStartIndex = findUtilityStartIndex(token);
  const utility = token.slice(utilityStartIndex).replace(/^!/, '');

  return isOldTailwindPrefixUtilityName(utility);
}

function findMisplacedTailwindPrefixMatches(token) {
  const matches = [];

  for (let index = 0; index < token.length; index++) {
    if (
      token[index] === ':' &&
      !isEscaped(token, index) &&
      token.slice(index + 1, index + 'sw:'.length + 1) === 'sw:'
    ) {
      matches.push({
        index,
        kind: 'misplaced',
        value: token,
      });
    }
  }

  return matches;
}

function findTailwindPrefixInsideArbitraryVariantMatches(token) {
  const matches = [];
  let bracketDepth = 0;

  for (let index = 0; index < token.length; index++) {
    const char = token[index];

    if (char === '[' && !isEscaped(token, index)) {
      bracketDepth++;
      continue;
    }

    if (char === ']' && !isEscaped(token, index)) {
      bracketDepth--;
      continue;
    }

    if (
      bracketDepth > 0 &&
      token.slice(index, index + 'sw:'.length) === 'sw:' &&
      !isEscaped(token, index + 'sw'.length)
    ) {
      matches.push({
        index,
        kind: 'inside-arbitrary-variant',
        value: token,
      });
    }
  }

  return matches;
}

function findOldTailwindPrefixSelectorMatches(token) {
  const matches = [];

  for (let index = 0; index < token.length; index++) {
    if (token[index] !== '.' || isEscaped(token, index)) {
      continue;
    }

    const selectorClassStartIndex = index + 1;
    const nextClassStartIndex = token.indexOf('.', selectorClassStartIndex);
    const selectorClassEndIndex = nextClassStartIndex === -1 ? token.length : nextClassStartIndex;
    const selectorClass = token.slice(selectorClassStartIndex, selectorClassEndIndex);
    const utilityEndIndex = findFirstUnescapedColonIndex(selectorClass);
    const utility = selectorClass.slice(0, utilityEndIndex);

    if (isOldTailwindPrefixUtilityName(utility)) {
      matches.push({
        index,
        kind: 'old',
        value: token.slice(index, selectorClassStartIndex + utilityEndIndex),
      });
    }
  }

  return matches;
}

function findOldTailwindPrefixTokenMatches(token) {
  const selectorMatches = findOldTailwindPrefixSelectorMatches(token);

  if (selectorMatches.length > 0) {
    return selectorMatches;
  }

  if (isOldTailwindPrefixUtilityToken(token)) {
    return [{ index: 0, kind: 'old', value: token }];
  }

  return [];
}

function collectTokenMatch(matches, text, startIndex, endIndex) {
  const token = stripTrailingPunctuation(text.slice(startIndex, endIndex));

  for (const match of [
    ...findOldTailwindPrefixTokenMatches(token),
    ...findMisplacedTailwindPrefixMatches(token),
    ...findTailwindPrefixInsideArbitraryVariantMatches(token),
  ]) {
    matches.push({
      index: startIndex + match.index,
      kind: match.kind,
      value: match.value,
    });
  }
}

function findOldTailwindPrefixes(text) {
  const matches = [];
  let tokenStartIndex = NO_TOKEN_START;

  for (let index = 0; index <= text.length; index++) {
    const isTokenBoundary = index === text.length || TOKEN_DELIMITERS.has(text[index]);

    if (!isTokenBoundary) {
      if (tokenStartIndex === NO_TOKEN_START) {
        tokenStartIndex = index;
      }

      continue;
    }

    if (tokenStartIndex !== NO_TOKEN_START) {
      collectTokenMatch(matches, text, tokenStartIndex, index);
      tokenStartIndex = NO_TOKEN_START;
    }
  }

  return matches;
}

function wrapBoxLine(line) {
  if (line.length <= reportContentWidth) {
    return [line];
  }

  const wrappedLines = [];
  let remainingLine = line;

  while (remainingLine.length > reportContentWidth) {
    wrappedLines.push(remainingLine.slice(0, reportContentWidth));
    remainingLine = remainingLine.slice(reportContentWidth);
  }

  wrappedLines.push(remainingLine);

  return wrappedLines;
}

function printBoxLine(line = '') {
  for (const wrappedLine of wrapBoxLine(line)) {
    console.error(`| ${wrappedLine.padEnd(reportContentWidth)} |`);
  }
}

function printBoxDivider() {
  console.error(`+${'-'.repeat(reportWidth - 2)}+`);
}

function printReport(findings) {
  console.error(
    '::error title=Tailwind prefix guardrail failed::Found invalid Tailwind prefix syntax for Tailwind CSS v4.',
  );

  printBoxDivider();
  printBoxLine('Tailwind prefix guardrail failed');
  printBoxDivider();
  printBoxLine('Tailwind CSS v4 requires prefixed utilities to use `sw:` instead of `sw-`,');
  printBoxLine('and the `sw:` prefix must come before variants.');
  printBoxLine('Replace every invalid prefixed utility before merging.');
  printBoxDivider();

  for (const finding of findings) {
    printBoxLine(`${finding.file}:${finding.line}:${finding.column}`);
    if (finding.kind === 'misplaced') {
      printBoxLine('  Misplaced `sw:` prefix. Use `sw:<variants>:<utility>`.');
    } else if (finding.kind === 'inside-arbitrary-variant') {
      printBoxLine('  `sw:` prefix inside an arbitrary variant. Put `sw:` before the variant.');
    } else {
      printBoxLine('  Old `sw-` prefix. Use `sw:<utility>`.');
    }
    printBoxLine(`  ${finding.value}`);
  }

  printBoxDivider();
}

function main() {
  const findings = [];
  const checkedRoots = getCheckedRoots();

  for (const file of getTrackedFiles(checkedRoots)) {
    if (!shouldCheckFile(file) || !fs.existsSync(file)) {
      continue;
    }

    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

    lines.forEach((line, lineIndex) => {
      for (const match of findOldTailwindPrefixes(line)) {
        findings.push({
          column: match.index + 1,
          file,
          kind: match.kind,
          line: lineIndex + 1,
          value: match.value,
        });
      }
    });
  }

  if (findings.length > 0) {
    printReport(findings);
    process.exit(1);
  }
}

main();
