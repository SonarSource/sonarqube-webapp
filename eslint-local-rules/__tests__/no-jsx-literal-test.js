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

import { RuleTester } from '@typescript-eslint/rule-tester';
import noJsxLiterals from '../no-jsx-literals';

const ruleTester = new RuleTester({
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname + '/../test-config',
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-jsx-literals', noJsxLiterals, {
  valid: [
    {
      code: `
      function test(props: {x: string}) {
        const {x} = props;
        return <>{x}</>;
      }`,
    },
    {
      code: `
      function test(props: {x: string}) {
        return <>{\`{\${x}\`}</>;
      }`,
    },
    {
      code: `
      function test(props: {x: string}) {
        const {x} = props;
        return <>
          {x}
            \n \n \t
          </>;
      }`,
    },
  ],
  invalid: [
    {
      code: `
      function test(props: {}) {
        return <>foo</>;
      }`,
      errors: [{ messageId: 'untranslatedText' }],
    },
    {
      code: `
      function test(props: {x: string}) {
        const {x} = props;
        return <>foo {x}</>;
      }`,
      errors: [{ messageId: 'untranslatedText' }],
    },
  ],
});
