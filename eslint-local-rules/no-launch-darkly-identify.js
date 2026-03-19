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

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce no direct LaunchDarkly client identify() calls',
      category: 'Best Practices',
    },
    messages: {
      noLaunchDarklyIdentify:
        'Do not call LaunchDarkly identify() directly, use the updateLaunchDarklyMultiContext function instead',
    },
  },
  create(context) {
    return {
      Identifier(node) {
        const name = node.name;

        // Check for identify() calls
        if (name === 'identify') {
          const parentNode = getExportedParent(node);
          const parentName = getParentName(parentNode);

          if (parentName && parentName !== 'updateLaunchDarklyMultiContext') {
            context.report({
              node: node.parent,
              messageId: 'noLaunchDarklyIdentify',
            });
          }
        }
      },
    };
  },
};

const NODE_TYPES = ['FunctionDeclaration', 'VariableDeclaration'];

function getExportedParent(node) {
  let parentNode = node.parent;

  while (parentNode?.parent && !NODE_TYPES.includes(parentNode?.type)) {
    parentNode = parentNode.parent;
  }

  return parentNode;
}

function getParentName(parentNode) {
  return parentNode?.declarations?.[0]?.id?.name ?? parentNode?.id?.name;
}
