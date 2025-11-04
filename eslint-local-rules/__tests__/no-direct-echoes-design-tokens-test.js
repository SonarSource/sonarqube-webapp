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

const { RuleTester } = require('eslint');
const noDirectEchoesDesignTokens = require('../no-direct-echoes-design-tokens');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-direct-echoes-design-tokens', noDirectEchoesDesignTokens, {
  valid: [
    {
      code: `
        import { cssVar } from '@sonarsource/echoes-react';
        const style = {
          color: cssVar('color-text-default'),
        };
      `,
    },
    {
      code: `
        const style = {
          color: 'red',
          backgroundColor: 'blue',
        };
      `,
    },
    {
      code: `
        const template = \`
          color: \${cssVar('color-text-default')};
          background: \${cssVar('color-surface-default')};
        \`;
      `,
    },
  ],
  invalid: [
    {
      code: `
        const style = {
          color: 'var(--echoes-color-text-default)',
        };
      `,
      errors: [{ messageId: 'noDirectEchoesTokens' }],
    },
    {
      code: `
        const backgroundColor = 'var(--echoes-color-surface-default)';
      `,
      errors: [{ messageId: 'noDirectEchoesTokens' }],
    },
    {
      code: `
        export enum AiIconColor {
          Disable = '--echoes-color-icon-disabled',
          Default = '--echoes-color-icon-default',
          Accent = '--echoes-color-icon-accent',
          Subtle = '--echoes-color-icon-subtle',
        }
      `,
      errors: [
        { messageId: 'noDirectEchoesTokens' },
        { messageId: 'noDirectEchoesTokens' },
        { messageId: 'noDirectEchoesTokens' },
        { messageId: 'noDirectEchoesTokens' },
      ],
    },
    {
      code: `
        const template = \`
          color: var(--echoes-color-text-subtle);
          border: 1px solid var(--echoes-color-border-bold);
        \`;
      `,
      errors: [{ messageId: 'noDirectEchoesTokens' }, { messageId: 'noDirectEchoesTokens' }],
    },
    {
      code: `
        const styles = {
          padding: 'var(--echoes-dimension-space-100)',
          fontSize: 'var(--echoes-typography-paragraph-medium-regular)',
        };
      `,
      errors: [{ messageId: 'noDirectEchoesTokens' }, { messageId: 'noDirectEchoesTokens' }],
    },
  ],
});
