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
const noQueryClientDirectUsage = require('../no-query-client-imports');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-query-client-imports', noQueryClientDirectUsage, {
  valid: [
    {
      code: `
      import test from 'queryclient/';
      test();
      `,
    },
    {
      code: `
        import { test } from '../../helpers';
        test();
      `,
    },
    {
      code: `
        import { queryClient } from '../../helpers-query-client';
        queryClient.bla();
      `,
    },
    {
      code: `
        const test = () => {};
        test();
      `,
    },
    {
      code: `
      import { useQuery } from '@tanstack/react-query';
      useQuery();
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
  ],
  invalid: [
    {
      code: `
      import { queryClient as testRenamed } from './src/queries/query-client';
      testRenamed.bla();
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
    {
      code: `
      import { queryClient } from '../../queries/query-client';
      queryClient.bla();
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
    {
      code: `
      import queryClient from '~queries/query-client';
      queryClient.bla();
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
    {
      code: `
      import queryClient from './query-client';
      queryClient.bla();
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
    {
      code: `
        import { queryClient } from '../queries/query-client';
        console.log("test");
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
    {
      code: `
      import { QueryClient } from '@tanstack/react-query';
      new QueryClient();
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
    {
      code: `
      import { QueryClient as renamed } from '@tanstack/react-query';
      new renamed();
      `,
      errors: [{ messageId: 'noQueryClientDirectUsage' }],
    },
  ],
});
