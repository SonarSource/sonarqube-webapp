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

const BACKEND_ERROR_FIELDS = new Set(['errors', 'message', 'msg']);
const ERROR_NAME_PATTERN = /err(?:or)?/i;
const RESPONSE_SEGMENT = 'response';
const DATA_SEGMENT = 'data';
const ON_ERROR_CALLBACK_PROPERTY = 'onError';

function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    [
      'ChainExpression',
      'ParenthesizedExpression',
      'TSAsExpression',
      'TSNonNullExpression',
      'TSTypeAssertion',
    ].includes(current.type)
  ) {
    current = current.expression;
  }
  return current;
}

function getPropertyName(memberExpression) {
  if (memberExpression.type === 'Property') {
    const { computed, key } = memberExpression;
    if (!computed && key.type === 'Identifier') {
      return key.name;
    }
    if (key.type === 'Literal') {
      return String(key.value);
    }
    return undefined;
  }

  const { property, computed } = memberExpression;
  if (!computed && property.type === 'Identifier') {
    return property.name;
  }
  if (computed && property.type === 'Literal') {
    return String(property.value);
  }
  return undefined;
}

function getMemberPath(node) {
  let expression = unwrapExpression(node);
  if (expression.type === 'Identifier') {
    return { rootIdentifier: expression, segments: [], propertyName: undefined };
  }

  const segments = [];
  const visited = new WeakSet();
  let propertyName;
  let isOutermostMember = true;
  while (expression?.type === 'MemberExpression' && !visited.has(expression)) {
    visited.add(expression);
    const currentPropertyName = getPropertyName(expression);
    if (isOutermostMember) {
      propertyName = currentPropertyName;
      isOutermostMember = false;
    }
    if (currentPropertyName !== undefined) {
      segments.push(currentPropertyName);
    }
    expression = unwrapExpression(expression.object);
  }

  segments.reverse();
  return {
    rootIdentifier: expression?.type === 'Identifier' ? expression : undefined,
    segments,
    propertyName,
  };
}

function getResponseDataIndex(segments) {
  return segments.findIndex(
    (segment, index) => segment === RESPONSE_SEGMENT && segments[index + 1] === DATA_SEGMENT,
  );
}

function getVariableForIdentifier(context, identifier) {
  if (identifier?.type !== 'Identifier') {
    return undefined;
  }

  let scope = context.sourceCode.getScope(identifier);
  while (scope) {
    const variable = scope.set.get(identifier.name);
    if (variable) {
      return variable;
    }
    scope = scope.upper;
  }
}

function isErrorNamedIdentifier(context, identifier, errorHandlerVariables) {
  if (identifier?.type !== 'Identifier') {
    return false;
  }

  if (ERROR_NAME_PATTERN.test(identifier.name)) {
    return true;
  }

  const variable = getVariableForIdentifier(context, identifier);
  return variable !== undefined && errorHandlerVariables.has(variable);
}

function isErrorResponseData(context, node, errorHandlerVariables) {
  if (!node) {
    return false;
  }
  const { rootIdentifier, segments } = getMemberPath(node);
  return (
    segments.at(-1) === DATA_SEGMENT &&
    getResponseDataIndex(segments) >= 0 &&
    isErrorNamedIdentifier(context, rootIdentifier, errorHandlerVariables)
  );
}

function isErrorPayloadAlias(context, node, errorPayloadVariables) {
  if (!node) {
    return false;
  }
  const { rootIdentifier, segments } = getMemberPath(node);
  const variable = getVariableForIdentifier(context, rootIdentifier);
  return segments.length === 0 && variable !== undefined && errorPayloadVariables.has(variable);
}

function isErrorPayloadSource(context, node, errorHandlerVariables, errorPayloadVariables) {
  return (
    isErrorResponseData(context, node, errorHandlerVariables) ||
    isErrorPayloadAlias(context, node, errorPayloadVariables)
  );
}

function reportDestructuredErrorFields(context, pattern) {
  pattern.properties.forEach((property) => {
    if (property.type !== 'RestElement' && BACKEND_ERROR_FIELDS.has(getPropertyName(property))) {
      context.report({ node: property, messageId: 'useBackendErrorHelper' });
    }
  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require shared helpers to extract messages from backend error payloads',
    },
    schema: [],
    messages: {
      useBackendErrorHelper:
        'Use a shared backend-error helper (getApiErrorMessage for Axios errors or getBackendError* for payloads) to extract these fields.',
    },
  },
  create(context) {
    const errorHandlerVariables = new Set();
    const errorPayloadVariables = new Set();

    function markErrorHandlerParameter(identifier) {
      errorHandlerVariables.add(getVariableForIdentifier(context, identifier));
    }

    function markFunctionParameter(functionNode) {
      if (functionNode?.params?.[0]?.type === 'Identifier') {
        markErrorHandlerParameter(functionNode.params[0]);
      }
    }

    function markOnErrorCallback(callback) {
      if (
        callback.type === 'ArrowFunctionExpression' ||
        callback.type === 'FunctionExpression' ||
        callback.type === 'FunctionDeclaration'
      ) {
        markFunctionParameter(callback);
        return;
      }

      if (callback.type !== 'Identifier') {
        return;
      }

      const variable = getVariableForIdentifier(context, callback);
      variable?.defs.forEach((definition) => {
        if (definition.type === 'FunctionName') {
          markFunctionParameter(definition.node);
        } else if (definition.type === 'Variable') {
          markFunctionParameter(definition.node.init);
        }
      });
    }

    function markErrorHandlers(programNode) {
      const { visitorKeys } = context.sourceCode;
      const nodes = [programNode];
      const visited = new WeakSet();

      while (nodes.length > 0) {
        const node = nodes.pop();
        if (!node || typeof node.type !== 'string' || visited.has(node)) {
          continue;
        }
        visited.add(node);

        if (node.type === 'CatchClause' && node.param?.type === 'Identifier') {
          markErrorHandlerParameter(node.param);
        }
        if (node.type === 'Property' && getPropertyName(node) === ON_ERROR_CALLBACK_PROPERTY) {
          markOnErrorCallback(node.value);
        }

        visitorKeys[node.type]?.forEach((key) => {
          const { [key]: child } = node;
          if (Array.isArray(child)) {
            child.forEach((childNode) => nodes.push(childNode));
          } else {
            nodes.push(child);
          }
        });
      }
    }

    return {
      Program(node) {
        markErrorHandlers(node);
      },
      MemberExpression(node) {
        const { rootIdentifier, segments, propertyName: field } = getMemberPath(node);
        if (!BACKEND_ERROR_FIELDS.has(field)) {
          return;
        }

        const responseDataIndex = getResponseDataIndex(segments);
        const isDirectErrorField =
          responseDataIndex >= 0 &&
          isErrorNamedIdentifier(context, rootIdentifier, errorHandlerVariables) &&
          segments.slice(responseDataIndex + 2, -1).length === 0;
        const isAliasedErrorField =
          segments.length === 1 &&
          errorPayloadVariables.has(getVariableForIdentifier(context, rootIdentifier));

        if (isDirectErrorField || isAliasedErrorField) {
          context.report({ node, messageId: 'useBackendErrorHelper' });
        }
      },
      VariableDeclarator(node) {
        if (
          node.id.type === 'Identifier' &&
          isErrorPayloadSource(context, node.init, errorHandlerVariables, errorPayloadVariables)
        ) {
          errorPayloadVariables.add(getVariableForIdentifier(context, node.id));
        }
        if (
          node.id.type === 'ObjectPattern' &&
          isErrorPayloadSource(context, node.init, errorHandlerVariables, errorPayloadVariables)
        ) {
          reportDestructuredErrorFields(context, node.id);
        }
      },
      AssignmentExpression(node) {
        if (
          node.left.type === 'ObjectPattern' &&
          isErrorPayloadSource(context, node.right, errorHandlerVariables, errorPayloadVariables)
        ) {
          reportDestructuredErrorFields(context, node.left);
        }
      },
    };
  },
};
