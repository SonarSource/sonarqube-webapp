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

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { rules: typescriptEslintRules } = createRequire(import.meta.url)(
  '@typescript-eslint/eslint-plugin',
);

const ESLINT_PLUGIN_BY_OXLINT_PLUGIN = {
  eslint: '',
  'eslint-js': '',
  'import-js': 'import/',
  'jest-js': 'jest/',
  'jsx-a11y-js': 'jsx-a11y/',
  node: '',
  'promise-js': 'promise/',
  'react-js': 'react/',
  typescript: '@typescript-eslint/',
  'typescript-js': '@typescript-eslint/',
};

const REACT_HOOKS_RULES = new Set(['rules-of-hooks', 'exhaustive-deps']);

const config = JSON.parse(readFileSync(new URL('../../.oxlintrc.json', import.meta.url), 'utf8'));
const typescriptExtensionRules = new Set(
  config.overrides
    .filter(({ files }) => files.includes('**/*.{ts,tsx}'))
    .flatMap(({ rules }) => Object.entries(rules))
    .filter(([rule, value]) => value !== 'off' && rule in typescriptEslintRules)
    .map(([rule]) => rule),
);

export function toEslintRuleId(code, filePath) {
  const ruleStart = code?.indexOf('(') ?? -1;
  if (ruleStart <= 0 || !code.endsWith(')')) {
    return null;
  }

  const plugin = code.slice(0, ruleStart);
  const rule = code.slice(ruleStart + 1, -1);

  if (plugin === 'eslint' && /\.tsx?$/.test(filePath) && typescriptExtensionRules.has(rule)) {
    return `@typescript-eslint/${rule}`;
  }

  if (plugin === 'react' && REACT_HOOKS_RULES.has(rule)) {
    return `react-hooks/${rule}`;
  }

  const eslintPlugin = ESLINT_PLUGIN_BY_OXLINT_PLUGIN[plugin] ?? plugin + '/';
  return eslintPlugin + rule;
}
