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
      description: 'Enforce translation of text literals in JSX',
      category: 'Internationalization',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      untranslatedText:
        'Text literals in JSX should be wrapped in react-intl formatMessage function or FormattedMessage component',
    },
  },

  create(context) {
    return {
      JSXText(node) {
        // Skip if only whitespace (or a single character)
        const text = node.value.trim();
        const isEnglish = !!text.match(/[a-zA-Z0-9]+/); // Symbols like "," , ".", "*" may be OK
        if (!isEnglish) {
          return;
        }

        if (text) {
          context.report({
            node,
            messageId: 'untranslatedText',
          });
        }
      },
    };
  },
};
