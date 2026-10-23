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

import { ESLint } from 'eslint';
import { execFile } from 'node:child_process';
import { parseArgs, promisify } from 'node:util';

if (process.env.NX_LINT_PROJECT_ROOT) {
  process.chdir(process.env.NX_LINT_PROJECT_ROOT);
}

// NX forwards boolean options as --fix=true or --fix=false.
const args = process.argv
  .slice(2)
  .map((arg) =>
    arg.replace(
      /^--(fix|fix-dry-run)=(true|false)$/,
      (_, option, value) => `--${value === 'false' ? 'no-' : ''}${option}`,
    ),
  );
const options = {
  fix: { type: 'boolean' },
  'fix-dry-run': { type: 'boolean' },
  format: { type: 'string', short: 'f' },
};
const { values, positionals: files } = parseArgs({
  args,
  options,
  allowPositionals: true,
  allowNegative: true,
});
const eslint = new ESLint({
  fix: values.fix || values['fix-dry-run'] || false,
  warnIgnored: false,
});

if (files.length === 0) {
  const changes = await Promise.all(
    [
      ['diff', '--name-only', '--diff-filter=d', '--relative', '-z', '--', '.'],
      ['ls-files', '--others', '--exclude-standard', '-z', '--', '.'],
    ].map((args) => promisify(execFile)('git', args)),
  );
  const changedFiles = new Set(changes.flatMap(({ stdout }) => stdout.split('\0').filter(Boolean)));
  const candidates = await Promise.all(
    [...changedFiles]
      .sort((left, right) => left.localeCompare(right))
      .map(async (file) => ({ file, ignored: await eslint.isPathIgnored(file) })),
  );
  files.push(...candidates.filter(({ ignored }) => !ignored).map(({ file }) => file));
}

if (files.length === 0) {
  console.log('No unstaged files supported by ESLint in this project.');
} else {
  const results = await eslint.lintFiles(files);
  if (values.fix) {
    await ESLint.outputFixes(results);
  }
  const formatter = await eslint.loadFormatter(values.format);
  const output = await formatter.format(results);
  if (output) {
    console.log(output);
  }
  process.exitCode = results.some(
    ({ errorCount, warningCount }) => errorCount > 0 || warningCount > 0,
  )
    ? 1
    : 0;
}
