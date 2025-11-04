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

// no-import-from-specific-folder.js

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn against importing and using "queryClient" directly',
      category: 'Best Practices',
    },
    messages: {
      noQueryClientDirectUsage:
        'Avoid importing and using "queryClient" directly, rely on "useQueryClient" instead, if possible.',
    },
  },
  create(context) {
    const fnNames = [];
    const currentFilePath = context.getFilename();

    if (
      ['testUtils.tsx', 'ProviderPyramid.tsx', 'query-client.ts'].some((path) =>
        currentFilePath.split('/').includes(path),
      )
    ) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        if (importPath.split('/').includes('query-client')) {
          context.report({
            node: node.source,
            messageId: 'noQueryClientDirectUsage',
          });
        }

        if (importPath.split('/').includes('react-query')) {
          fnNames.push(
            ...node.specifiers
              .filter((specifier) => specifier.imported.name === 'QueryClient')
              .map((specifier) => specifier.local.name),
          );
        }
      },
      NewExpression(node) {
        if (fnNames.includes(node.callee.name)) {
          context.report({
            node: node.callee,
            messageId: 'noQueryClientDirectUsage',
          });
        }
      },
    };
  },
};
