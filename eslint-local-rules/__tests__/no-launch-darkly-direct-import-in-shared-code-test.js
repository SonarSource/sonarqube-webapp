/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
const noLaunchDarklyDirectImportInSharedCode = require('../no-launch-darkly-direct-import-in-shared-code');

const ruleTester = new RuleTester({
  parserOptions: { ecmaFeatures: { jsx: true } },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(
  'no-launch-darkly-direct-import-in-shared-code',
  noLaunchDarklyDirectImportInSharedCode,
  {
    valid: [
      {
        code: `
          import test from 'test/';
          test();
        `,
        filename: 'libs/shared/src/test.ts',
      },
      {
        code: `
          import { test } from '../../helpers';
          test();
        `,
        filename: 'libs/shared/src/test.ts',
      },
      {
        code: `
          import { useFlags } from '~adapters/helpers/feature-flags';
          useFlags();
        `,
        filename: 'libs/shared/src/test.ts',
      },
      {
        code: `
          import { useFlags } from 'launchdarkly-react-client-sdk';
          useFlags();
        `,
        filename: 'private/apps/sq-cloud/src/sq-cloud-adapters/helpers/feature-flags.ts',
      },
    ],
    invalid: [
      {
        code: `
          import { useFlags } from 'launchdarkly-react-client-sdk';
          useFlags();
        `,
        filename: 'libs/shared/src/test.ts',
        errors: [{ messageId: 'noLaunchDarklyDirectUsage' }],
      },
      {
        code: `
          import { useFlags } from 'launchdarkly-react-client-sdk';
          useFlags();
        `,
        filename: 'apps/sq-server/src/test.ts',
        errors: [{ messageId: 'noLaunchDarklyDirectUsage' }],
      },
    ],
  },
);
