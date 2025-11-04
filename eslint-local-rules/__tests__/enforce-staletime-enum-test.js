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

const rule = require('../enforce-staletime-enum');
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

ruleTester.run('enforce-staletime-enum', rule, {
  valid: [
    // queryOptions with StaleTime enum
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: StaleTime.NEVER,
        })
      `,
    },
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: StaleTime.LIVE,
        })
      `,
    },
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: StaleTime.SHORT,
        })
      `,
    },
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: StaleTime.MEDIUM,
        })
      `,
    },
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: StaleTime.LONG,
        })
      `,
    },
    // infiniteQueryOptions with StaleTime enum
    {
      code: `
        infiniteQueryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: StaleTime.MEDIUM,
        })
      `,
    },
    // useQuery with StaleTime enum
    {
      code: `
        useQuery({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: StaleTime.LONG,
        })
      `,
    },
    // Even with enabled: false, staleTime is still required
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          enabled: false,
          staleTime: StaleTime.NEVER,
        })
      `,
    },
    // Not a React Query call, should be ignored
    {
      code: `
        otherFunction({
          staleTime: 60000,
        })
      `,
    },
  ],

  invalid: [
    // Missing staleTime in queryOptions
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
        })
      `,
      errors: [
        {
          messageId: 'missingStaleTime',
          type: 'ObjectExpression',
        },
      ],
    },
    // Missing staleTime in infiniteQueryOptions
    {
      code: `
        infiniteQueryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
        })
      `,
      errors: [
        {
          messageId: 'missingStaleTime',
          type: 'ObjectExpression',
        },
      ],
    },
    // Missing staleTime in useQuery
    {
      code: `
        useQuery({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
        })
      `,
      errors: [
        {
          messageId: 'missingStaleTime',
          type: 'ObjectExpression',
        },
      ],
    },
    // Raw number in queryOptions
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: 60000,
        })
      `,
      errors: [
        {
          messageId: 'useStaleTimeEnum',
          type: 'Literal',
        },
      ],
    },
    // Raw number in infiniteQueryOptions
    {
      code: `
        infiniteQueryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: 30000,
        })
      `,
      errors: [
        {
          messageId: 'useStaleTimeEnum',
          type: 'Literal',
        },
      ],
    },
    // Raw number in useQuery
    {
      code: `
        useQuery({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: 0,
        })
      `,
      errors: [
        {
          messageId: 'useStaleTimeEnum',
          type: 'Literal',
        },
      ],
    },
    // Infinity in queryOptions
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          staleTime: Infinity,
        })
      `,
      errors: [
        {
          messageId: 'useStaleTimeEnum',
          type: 'Identifier',
        },
      ],
    },
    // Even with enabled: false, if staleTime is provided, it should use enum
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          enabled: false,
          staleTime: 60000,
        })
      `,
      errors: [
        {
          messageId: 'useStaleTimeEnum',
          type: 'Literal',
        },
      ],
    },
    // enabled: false without staleTime should still be an error
    {
      code: `
        queryOptions({
          queryKey: ['test'],
          queryFn: () => fetch('/api/test'),
          enabled: false,
        })
      `,
      errors: [
        {
          messageId: 'missingStaleTime',
          type: 'ObjectExpression',
        },
      ],
    },
  ],
});
