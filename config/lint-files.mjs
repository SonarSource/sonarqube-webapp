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

import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { parseArgs, promisify } from 'node:util';
import { runOxlint } from './oxlint/run-oxlint.mjs';

const SUPPORTED_FILE = /\.(js|ts|tsx)$/;
const FORMATS = [
  'agent',
  'checkstyle',
  'default',
  'github',
  'gitlab',
  'json',
  'junit',
  'sarif',
  'stylish',
  'unix',
];
const projectRoot = process.env.NX_LINT_PROJECT_ROOT ?? '.';

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
const { values, positionals } = parseArgs({
  args,
  options,
  allowPositionals: true,
  allowNegative: true,
});

const format = FORMATS.find((knownFormat) => knownFormat === values.format);

if (values.format && !format) {
  console.error(`Unsupported format "${values.format}". Use one of: ${FORMATS.join(', ')}.`);
  process.exit(2);
}

if (values['fix-dry-run']) {
  console.error('Oxlint cannot report fixes without applying them; use --fix instead.');
  process.exit(2);
}

let files = positionals;

if (files.length === 0) {
  const changes = await Promise.all(
    [
      ['diff', '--name-only', '--diff-filter=d', '--relative', '-z', '--', '.'],
      ['ls-files', '--others', '--exclude-standard', '-z', '--', '.'],
    ].map((gitArgs) => promisify(execFile)('git', gitArgs, { cwd: projectRoot })),
  );
  files = [...new Set(changes.flatMap(({ stdout }) => stdout.split('\0').filter(Boolean)))].sort(
    (left, right) => left.localeCompare(right),
  );
}

const lintedFiles = files
  .filter((file) => SUPPORTED_FILE.test(file))
  .map((file) => join(projectRoot, file));

if (lintedFiles.length === 0) {
  console.log('No unstaged files supported by Oxlint in this project.');
} else {
  const { status } = runOxlint(
    [
      '--deny-warnings',
      '--no-error-on-unmatched-pattern',
      ...(values.fix ? ['--fix'] : []),
      ...(format ? ['--format', format] : []),
    ],
    lintedFiles,
    { stdio: 'inherit' },
  );
  process.exitCode = status ?? 1;
}
