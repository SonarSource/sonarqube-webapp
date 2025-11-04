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
      description:
        'Enforce the use of StaleTime enum values when defining staleTime in React Query (queryOptions, infiniteQueryOptions, useQuery)',
      recommended: 'error',
    },
    messages: {
      missingStaleTime:
        'Missing staleTime property. Define staleTime using StaleTime enum values (StaleTime.NEVER, StaleTime.LIVE, StaleTime.SHORT, StaleTime.MEDIUM, StaleTime.LONG).',
      useStaleTimeEnum:
        'Use StaleTime enum values instead of raw numbers for staleTime property. Available values: StaleTime.NEVER, StaleTime.LIVE, StaleTime.SHORT, StaleTime.MEDIUM, StaleTime.LONG.',
    },
    schema: [],
  },

  create(context) {
    /**
     * Check if a property is the staleTime property
     */
    function isStaleTimeProperty(property) {
      return (
        property &&
        property.type === 'Property' &&
        ((property.key.type === 'Identifier' && property.key.name === 'staleTime') ||
          (property.key.type === 'Literal' && property.key.value === 'staleTime'))
      );
    }

    /**
     * Check if a value is a StaleTime enum usage
     */
    function isStaleTimeEnumUsage(valueNode) {
      return (
        valueNode &&
        valueNode.type === 'MemberExpression' &&
        valueNode.object &&
        valueNode.object.type === 'Identifier' &&
        valueNode.object.name === 'StaleTime' &&
        valueNode.property &&
        valueNode.property.type === 'Identifier' &&
        ['NEVER', 'LIVE', 'SHORT', 'MEDIUM', 'LONG'].includes(valueNode.property.name)
      );
    }

    /**
     * Check if a node is a React Query call that should have staleTime
     */
    function isReactQueryCall(node) {
      return (
        node &&
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        ['queryOptions', 'infiniteQueryOptions', 'useQuery'].includes(node.callee.name)
      );
    }

    /**
     * Get the staleTime property from an object expression
     */
    function getStaleTimeProperty(objectExpression) {
      if (!objectExpression || objectExpression.type !== 'ObjectExpression') {
        return null;
      }
      return objectExpression.properties.find(isStaleTimeProperty);
    }

    return {
      CallExpression(node) {
        if (!isReactQueryCall(node) || node.arguments.length === 0) {
          return;
        }

        const configArgument = node.arguments[0];
        if (!configArgument || configArgument.type !== 'ObjectExpression') {
          return;
        }

        const staleTimeProperty = getStaleTimeProperty(configArgument);

        if (!staleTimeProperty) {
          context.report({
            node: configArgument,
            messageId: 'missingStaleTime',
          });
          return;
        }

        if (!isStaleTimeEnumUsage(staleTimeProperty.value)) {
          context.report({
            node: staleTimeProperty.value,
            messageId: 'useStaleTimeEnum',
          });
        }
      },
    };
  },
};
