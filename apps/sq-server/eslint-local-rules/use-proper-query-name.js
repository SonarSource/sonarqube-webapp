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
      description: 'Warn against violations of react-query name convention',
      category: 'Best Practices',
    },
    messages: {
      useProperQueryName: 'The query name should follow the convention: use{EntityName}Query',
      useProperMutationName:
        'The mutation name should follow the convention: use{EntityName}Mutation',
      useProperInvalidationName:
        'The invalidation name should follow the convention: invalidate{EntityName}',
    },
  },
  create(context) {
    const currentFilePath = context.getFilename();

    if (!currentFilePath.split('/').includes('queries')) {
      return {};
    }

    return {
      Identifier(node) {
        const name = node.name;

        // Ignore imports and root nodes
        if (!node.parent || node.parent.type === 'ImportSpecifier') {
          return;
        }

        // Check for useQuery
        if (
          (name.startsWith('use') && name.endsWith('Query')) ||
          name.includes('queryOptions') ||
          name.includes('infiniteQueryOptions') ||
          name === 'createQueryHook' ||
          name === 'createInfiniteQueryHook'
        ) {
          const parentNode = getExportedParent(node);
          const parentName = getParentName(parentNode);

          if (parentNode && parentName?.startsWith('use') && !parentName.endsWith('Query')) {
            report(context, 'useProperQueryName', parentNode);
          }
        }

        // Check for useMutation
        if (name.startsWith('use') && name.endsWith('Mutation')) {
          const parentNode = getExportedParent(node);
          const parentName = getParentName(parentNode);

          if (parentNode && parentName?.startsWith('use') && !parentName?.endsWith('Mutation')) {
            report(context, 'useProperMutationName', parentNode);
          }
        }

        // Check for invalidateQuery
        if (
          name.startsWith('invalidate') &&
          (name.endsWith('Query') || name.endsWith('Queries')) &&
          node.parent.type === 'FunctionDeclaration'
        ) {
          context.report({
            node,
            messageId: 'useProperInvalidationName',
          });
        }
      },
    };
  },
};

function getExportedParent(node) {
  let parentNode = node.parent;

  while (parentNode?.parent && parentNode?.type !== 'ExportNamedDeclaration') {
    parentNode = parentNode.parent;
  }

  return parentNode;
}

function getParentName(parentNode) {
  return parentNode?.declaration?.declarations?.[0]?.id?.name ?? parentNode?.declaration?.id?.name;
}

function report(context, messageId, node) {
  if (node.id) {
    context.report({
      node: node.id,
      messageId,
    });
  } else if (node.declaration) {
    report(context, messageId, node.declaration);
  } else if (node.declarations) {
    node.declarations.forEach((declaration) => report(context, messageId, declaration));
  } else {
    context.report({
      node,
      messageId,
    });
  }
}
