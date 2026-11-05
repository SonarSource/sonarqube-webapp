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
      description: 'Enforce no direct analytics SDK identify() or track() calls',
      category: 'Best Practices',
    },
    messages: {
      noLaunchDarklyIdentify:
        'Do not call LaunchDarkly identify() directly, use the updateLaunchDarklyMultiContext function instead',
      noMixpanelIdentify:
        'Do not call Mixpanel identify() directly, use the identifyMixpanelUser function instead',
      noMixpanelTrack: 'Do not call Mixpanel track() directly, use postTelemetryEvent instead',
    },
  },
  create(context) {
    return {
      Identifier(node) {
        const { name } = node;
        const callTarget = getCalledMethod(node);

        // Check for identify() calls
        if (name === 'identify' && callTarget) {
          const parentNode = getExportedParent(node);
          const parentName = getParentName(parentNode);

          if (
            !parentName ||
            ['updateLaunchDarklyMultiContext', 'initMixpanel', 'identifyMixpanelUser'].includes(
              parentName,
            )
          ) {
            return;
          }

          const callerObject = callTarget.object;

          const isMixpanelCall =
            callerObject?.type === 'Identifier' && callerObject?.name.toLowerCase() === 'mixpanel';

          context.report({
            node: node.parent,
            messageId: isMixpanelCall ? 'noMixpanelIdentify' : 'noLaunchDarklyIdentify',
          });
        }

        // Check for track() calls
        if (name === 'track' && callTarget) {
          const callerObject = callTarget.object;

          const isMixpanelCall =
            callerObject?.type === 'Identifier' && callerObject?.name.toLowerCase() === 'mixpanel';

          if (!isMixpanelCall) {
            return;
          }

          const parentNode = getExportedParent(node);
          const parentName = getParentName(parentNode);

          if (parentName && !['initMixpanel'].includes(parentName)) {
            context.report({
              node: node.parent,
              messageId: 'noMixpanelTrack',
            });
          }
        }
      },
    };
  },
};

const NODE_TYPES = ['FunctionDeclaration', 'VariableDeclaration'];

function getCalledMethod(node) {
  const parentNode = node.parent;

  if (parentNode?.type !== 'MemberExpression' || parentNode.property !== node) {
    return null;
  }

  const grandParentNode = parentNode.parent;

  if (grandParentNode?.type === 'CallExpression' && grandParentNode.callee === parentNode) {
    return parentNode;
  }

  if (grandParentNode?.type === 'ChainExpression') {
    const callExpression = grandParentNode.expression;

    if (callExpression?.type === 'CallExpression' && callExpression.callee === parentNode) {
      return parentNode;
    }
  }

  return null;
}

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
