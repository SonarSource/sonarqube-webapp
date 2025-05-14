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
      description: 'Warn against importing the LaunchDarkly useFlags hook in shared code',
      category: 'Best Practices',
    },
    messages: {
      noLaunchDarklyDirectUsage:
        'Do no import and use the LaunchDarkly useFlags hook directly from shared code. Use our internal useFlags wrapper from ~adapters/helpers/feature-flags instead.',
    },
  },
  create(context) {
    const fnNames = [];
    const currentFilePath = context.getFilename();

    // Do not raise issues for the useFlags adapters implementation
    if (currentFilePath.includes('sq-cloud-adapters/helpers/feature-flags')) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        if (importPath.includes('launchdarkly-react-client-sdk')) {
          fnNames.push(
            ...node.specifiers
              .filter((specifier) => specifier.imported.name === 'useFlags')
              .map((specifier) => specifier.local.name),
          );
        }
      },
      CallExpression(node) {
        if (fnNames.includes(node.callee.name)) {
          context.report({
            node: node.callee,
            messageId: 'noLaunchDarklyDirectUsage',
          });
        }
      },
    };
  },
};
