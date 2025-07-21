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

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent direct usage of --echoes-design-tokens, use `cssVar` helper function instead',
      category: 'Best Practices',
    },
    messages: {
      noDirectEchoesTokens: `Use the \`cssVar\` helper function from \`@sonarsource/echoes-react\` instead of directly referencing --echoes-design-tokens.
Replace \`--echoes-{{ token }}\` or \`var(--echoes-{{ token }})\` with \`cssVar('{{ token }}')\`.
Note that layer 1 color tokens are not valid \`cssVar\` options since they are not compatible with theming.`,
    },
  },
  create: function (context) {
    // Single regex to match both var(--echoes-*) and direct --echoes-* patterns
    const echoesTokenRegex = /(var\()?--echoes-([a-zA-Z0-9-]+)\)?/g;

    function checkStringForEchoesTokens(node, value) {
      let match;
      echoesTokenRegex.lastIndex = 0; // Reset regex state

      while ((match = echoesTokenRegex.exec(value)) !== null) {
        const tokenName = match[2]; // The token name without --echoes- prefix

        context.report({
          node,
          messageId: 'noDirectEchoesTokens',
          data: { token: tokenName },
        });
      }
    }

    return {
      Literal: function (node) {
        if (typeof node.value === 'string') {
          checkStringForEchoesTokens(node, node.value);
        }
      },
      TemplateLiteral: function (node) {
        // Check template literals (backtick strings)
        node.quasis.forEach((quasi) => {
          if (quasi.value && quasi.value.raw) {
            checkStringForEchoesTokens(quasi, quasi.value.raw);
          }
        });
      },
    };
  },
};
