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
const rule = require('../no-default-props');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-default-props', rule, {
  valid: [
    // Valid: other static property assignments
    { code: 'Foo.bar = 1;' },
    { code: "Foo.displayName = 'Foo';" },
    // Valid: component declaration (no defaultProps)
    { code: 'function Foo() { return null; }' },
  ],
  invalid: [
    // Invalid: empty defaultProps
    {
      code: 'Foo.defaultProps = {};',
      errors: [{ messageId: 'noDefaultProps' }],
    },
    // Invalid: defaultProps with values
    {
      code: 'Foo.defaultProps = { bar: 1 };',
      errors: [{ messageId: 'noDefaultProps' }],
    },
  ],
});
