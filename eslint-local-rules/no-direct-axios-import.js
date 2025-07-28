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
        'Prevent direct axios imports, use axiosClient or axiosToCatch from the shared helpers instead',
      category: 'Best Practices',
    },
    messages: {
      noDirectAxiosImport: `Use \`axiosClient\` or \`axiosToCatch\` from \`~shared/helpers/axios-clients\` instead of importing axios directly.
Replace \`import axios from 'axios'\` with \`import { axiosClient } from '~shared/helpers/axios-clients'\`.
Use \`axiosClient\` for requests that should show error toasts automatically, or \`axiosToCatch\` when you want to handle errors manually.`,
      noDirectAxiosUsage: `Use \`axiosClient\` or \`axiosToCatch\` from \`~shared/helpers/axios-clients\` instead of using axios directly.
Replace \`axios.{{ method }}\` with \`axiosClient.{{ method }}\` or \`axiosToCatch.{{ method }}\`.`,
    },
    fixable: 'code',
  },
  create: function (context) {
    const allowedFiles = new Set([
      // Allow axios usage in the axios-clients file itself
      'axios-clients.ts',
      // Allow in test files that specifically test axios setup
      'axios-setup-test.ts',
      // Allow in config files
      'vite.config.ts',
    ]);

    const filename = context.getFilename();
    const isAllowedFile = allowedFiles.has(filename.split('/').pop());

    if (isAllowedFile) {
      return {};
    }

    return {
      // Check for direct axios imports
      ImportDeclaration: function (node) {
        if (node.source.value === 'axios') {
          // Check if it's a default import (import axios from 'axios')
          const hasDefaultImport = node.specifiers.some(
            (spec) => spec.type === 'ImportDefaultSpecifier',
          );

          if (hasDefaultImport) {
            context.report({
              node,
              messageId: 'noDirectAxiosImport',
              fix: function (fixer) {
                return fixer.replaceText(
                  node,
                  "import { axiosClient } from '~shared/helpers/axios-clients';",
                );
              },
            });
          }
        }
      },

      // Check for direct axios usage (axios.get, axios.post, etc.)
      MemberExpression: function (node) {
        if (
          node.object &&
          node.object.type === 'Identifier' &&
          node.object.name === 'axios' &&
          node.property &&
          node.property.type === 'Identifier'
        ) {
          const method = node.property.name;

          // Only flag axios method calls, not other properties
          const httpMethods = [
            'get',
            'post',
            'put',
            'delete',
            'patch',
            'head',
            'options',
            'create',
          ];
          if (httpMethods.includes(method)) {
            context.report({
              node,
              messageId: 'noDirectAxiosUsage',
              data: { method },
              fix: function (fixer) {
                return fixer.replaceText(node.object, 'axiosClient');
              },
            });
          }
        }
      },
    };
  },
};
