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

const AXIOS_REQUEST_METHODS = new Set([
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'head',
  'options',
  'create',
]);

function getRequestMethodImports(node) {
  if (node.importKind === 'type') {
    return [];
  }
  return node.specifiers.filter(
    (spec) =>
      spec.type === 'ImportSpecifier' &&
      spec.importKind !== 'type' &&
      AXIOS_REQUEST_METHODS.has(spec.imported.name ?? spec.imported.value),
  );
}

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
      noDirectAxiosNamedImport: `Use \`axiosClient\` or \`axiosToCatch\` from \`~shared/helpers/axios-clients\` instead of importing \`{{ method }}\` from axios directly.`,
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

    const filename = context.filename;
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

          for (const spec of getRequestMethodImports(node)) {
            context.report({
              node: spec,
              messageId: 'noDirectAxiosNamedImport',
              data: { method: spec.imported.name ?? spec.imported.value },
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
          if (AXIOS_REQUEST_METHODS.has(method)) {
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
