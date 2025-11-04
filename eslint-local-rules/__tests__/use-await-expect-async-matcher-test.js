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
const useJestMocked = require('../use-await-expect-async-matcher');

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('use-await-expect-tohaveatooltipwithcontent', useJestMocked, {
  valid: [
    {
      code: `await expect(node).toHaveATooltipWithContent("Help text");`,
    },
  ],
  invalid: [
    {
      code: `expect(node).toHaveATooltipWithContent("Help text");`,
      errors: [
        {
          message:
            'expect.toHaveATooltipWithContent() is asynchronous; you must prefix expect() with await',
        },
      ],
      output: `await expect(node).toHaveATooltipWithContent("Help text");`,
    },
  ],
});

ruleTester.run('use-await-expect-tohavenoa11yviolations', useJestMocked, {
  valid: [
    {
      code: `expect.extend({
                async toHaveNoA11yViolations(received: HTMLElement) {
                  const result = await axe(received);
                  return toHaveNoViolations.toHaveNoViolations(result);
                },
              });`,
    },
    {
      code: `await expect(node).toHaveNoA11yViolations();`,
    },
  ],
  invalid: [
    {
      code: `expect(node).toHaveNoA11yViolations();`,
      errors: [
        {
          message:
            'expect.toHaveNoA11yViolations() is asynchronous; you must prefix expect() with await',
        },
      ],
      output: `await expect(node).toHaveNoA11yViolations();`,
    },
  ],
});
