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

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const MAX_RESOLUTION_DEPTH = 5;

function typeIncludesUndefined(typeNode) {
  if (!typeNode) {
    return false;
  }
  switch (typeNode.type) {
    case 'TSTypeAnnotation':
      return typeIncludesUndefined(typeNode.typeAnnotation);
    case 'TSUndefinedKeyword':
    case 'TSVoidKeyword':
      return true;
    case 'TSUnionType':
      return typeNode.types.some(typeIncludesUndefined);
    default:
      return false;
  }
}

function getPropertyName(property) {
  if (property.key.type === 'Identifier') {
    return property.key.name;
  }
  return property.key.type === 'Literal' ? String(property.key.value) : null;
}

function getPatternTypeAnnotation(pattern) {
  if (pattern.typeAnnotation) {
    return pattern.typeAnnotation;
  }
  return pattern.parent?.type === 'AssignmentPattern' ? pattern.parent.left.typeAnnotation : null;
}

function destructuredPropertyCanBeUndefined(identifier) {
  const property = identifier.parent;
  if (property?.type !== 'Property' || property.value !== identifier) {
    return false;
  }
  const pattern = property.parent;
  const annotation = pattern?.type === 'ObjectPattern' && getPatternTypeAnnotation(pattern);
  const typeLiteral = annotation?.typeAnnotation;
  if (typeLiteral?.type !== 'TSTypeLiteral') {
    return false;
  }
  const name = getPropertyName(property);
  const member = typeLiteral.members.find(
    (m) => m.type === 'TSPropertySignature' && m.key.type === 'Identifier' && m.key.name === name,
  );
  return Boolean(member && (member.optional || typeIncludesUndefined(member.typeAnnotation)));
}

const EXIT_STATEMENTS = new Set([
  'BreakStatement',
  'ContinueStatement',
  'ReturnStatement',
  'ThrowStatement',
]);

function getChainLinkObject(node) {
  switch (node?.type) {
    case 'MemberExpression':
      return node.object;
    case 'CallExpression':
      return node.callee;
    case 'TSNonNullExpression':
      return node.expression;
    default:
      return null;
  }
}

function getOptionalObjects(node) {
  const objects = [];
  for (let current = node; getChainLinkObject(current); current = getChainLinkObject(current)) {
    if (current.optional) {
      objects.push(getChainLinkObject(current));
    }
  }
  return objects;
}

function exits(statement) {
  if (EXIT_STATEMENTS.has(statement.type)) {
    return true;
  }
  return statement.type === 'BlockStatement' && statement.body.length > 0
    ? exits(statement.body.at(-1))
    : false;
}

function getEarlierExitGuards(statements, child) {
  return statements
    .slice(0, statements.indexOf(child))
    .filter((statement) => statement.type === 'IfStatement' && exits(statement.consequent))
    .map((statement) => ({ test: statement.test, truthy: false }));
}

function getBranchGuard(parent, child) {
  if (child === parent.consequent) {
    return [{ test: parent.test, truthy: true }];
  }
  return child === parent.alternate ? [{ test: parent.test, truthy: false }] : [];
}

function getEnclosingGuards(parent, child) {
  switch (parent.type) {
    case 'ConditionalExpression':
    case 'IfStatement':
      return getBranchGuard(parent, child);
    case 'LogicalExpression':
      return child === parent.right && parent.operator !== '??'
        ? [{ test: parent.left, truthy: parent.operator === '&&' }]
        : [];
    case 'BlockStatement':
    case 'Program':
      return getEarlierExitGuards(parent.body, child);
    case 'SwitchCase':
      return getEarlierExitGuards(parent.consequent, child);
    default:
      return [];
  }
}

function getGuards(node) {
  const guards = [];
  for (let child = node; child.parent; child = child.parent) {
    guards.push(...getEnclosingGuards(child.parent, child));
  }
  return guards;
}

function normalizeChain(text) {
  return text.replaceAll('?.', '.');
}

function isNullish(node) {
  return (node.type === 'Literal' && node.value === null) || isUndefined(node);
}

function isUndefined(node) {
  return node.type === 'Identifier' && node.name === 'undefined';
}

function isDefinedValue(node) {
  return node.type === 'Literal' && node.value !== null;
}

function readsThrough(node, text, sourceCode) {
  if (normalizeChain(sourceCode.getText(node)) === text) {
    return true;
  }
  const inner = node.type === 'ChainExpression' ? node.expression : getChainLinkObject(node);
  return inner ? readsThrough(inner, text, sourceCode) : false;
}

function comparisonImpliesDefined(test, text, truthy, sourceCode) {
  const { left, operator, right } = test;
  const [other, operand] = isNullish(left) || isDefinedValue(left) ? [left, right] : [right, left];
  if (!readsThrough(operand, text, sourceCode)) {
    return false;
  }
  const isEquality = operator === '==' || operator === '===';
  const isInequality = operator === '!=' || operator === '!==';
  if (isDefinedValue(other)) {
    return isEquality === truthy && (isEquality || isInequality);
  }
  const excludesNullish = operator.length === 2 || isUndefined(other);
  return excludesNullish && isNullish(other) && (isInequality ? truthy : !truthy);
}

function logicalImpliesDefined(test, text, truthy, sourceCode) {
  const left = impliesDefined(test.left, text, truthy, sourceCode);
  const right = impliesDefined(test.right, text, truthy, sourceCode);
  const bothSidesHaveOutcome = (test.operator === '&&') === truthy;
  return bothSidesHaveOutcome ? left || right : left && right;
}

function impliesDefined(test, text, truthy, sourceCode) {
  switch (test.type) {
    case 'UnaryExpression':
      return test.operator === '!' && impliesDefined(test.argument, text, !truthy, sourceCode);
    case 'LogicalExpression':
      return test.operator !== '??' && logicalImpliesDefined(test, text, truthy, sourceCode);
    case 'BinaryExpression':
      return comparisonImpliesDefined(test, text, truthy, sourceCode);
    default:
      return truthy && readsThrough(test, text, sourceCode);
  }
}

function isNullChecked(chain, sourceCode) {
  const guards = getGuards(chain);
  return getOptionalObjects(chain.expression).every((object) => {
    const text = normalizeChain(sourceCode.getText(object));
    return guards.some(({ test, truthy }) => impliesDefined(test, text, truthy, sourceCode));
  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow potentially `undefined` values for the `enabled` option in react-query calls and in query hooks imported from a 'queries' folder. Hooks built with `createQueryHook` are also checked exactly by their types; this syntax-only rule is kept for direct react-query calls and hand-written hooks, which the types do not cover. Optional chains are treated as null-checked when an enclosing condition, or an earlier exiting `if`, rules out a nullish optional object on the branch where the chain runs.",
      recommended: 'error',
    },
    messages: {
      noUndefinedEnabled:
        "The 'enabled' option in a query hook must not be `undefined`. Use `false` to disable the query explicitly.",
      noUndefinedEnabledInQueryHook:
        'Variables that could be `undefined` should not be used directly for the `enabled` option in query hooks. Use `false` or a default value to handle the undefined case.',
    },
    schema: [],
  },

  create(context) {
    function findVariable(node, name) {
      let scope = context.sourceCode.getScope(node);
      while (scope) {
        const variable = scope.set.get(name);
        if (variable) {
          return variable;
        }
        scope = scope.upper;
      }
      return null;
    }

    function identifierCanBeUndefined(node, depth) {
      if (node.name === 'undefined') {
        return true;
      }
      const definition = findVariable(node, node.name)?.defs[0];
      if (!definition) {
        return false;
      }
      if (definition.type === 'Variable') {
        const declarator = definition.node;
        if (declarator.id.type !== 'Identifier') {
          return false;
        }
        if (declarator.id.typeAnnotation) {
          return typeIncludesUndefined(declarator.id.typeAnnotation);
        }
        return !declarator.init || canBeUndefined(declarator.init, depth + 1);
      }
      if (definition.type === 'Parameter') {
        const { name } = definition;
        if (name.parent?.type === 'AssignmentPattern' && name.parent.left === name) {
          return false;
        }
        return (
          Boolean(name.optional) ||
          typeIncludesUndefined(name.typeAnnotation) ||
          destructuredPropertyCanBeUndefined(name)
        );
      }
      return false;
    }

    // Syntactic approximation of the former type check: only what is visible in the file.
    function canBeUndefined(node, depth = 0) {
      if (!node || depth > MAX_RESOLUTION_DEPTH) {
        return false;
      }
      switch (node.type) {
        case 'Identifier':
          return identifierCanBeUndefined(node, depth);
        case 'ChainExpression':
          return !isNullChecked(node, context.sourceCode);
        case 'UnaryExpression':
          return node.operator === 'void';
        case 'ConditionalExpression':
          return canBeUndefined(node.consequent, depth) || canBeUndefined(node.alternate, depth);
        case 'LogicalExpression':
          return node.operator === '&&'
            ? canBeUndefined(node.left, depth) || canBeUndefined(node.right, depth)
            : canBeUndefined(node.right, depth);
        case 'TSAsExpression':
        case 'TSSatisfiesExpression':
          return node.type === 'TSAsExpression'
            ? typeIncludesUndefined(node.typeAnnotation)
            : canBeUndefined(node.expression, depth);
        default:
          return false;
      }
    }

    /**
     * Checks an options object for a potentially undefined `enabled` property.
     * @param {import('@typescript-eslint/types/dist/generated/ast-spec').ObjectExpression | undefined} optionsNode
     */
    function checkOptionsNode(optionsNode) {
      if (!optionsNode || optionsNode.type !== 'ObjectExpression') {
        return;
      }

      const enabledProperty = optionsNode.properties.find(
        (prop) =>
          prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'enabled',
      );

      if (!enabledProperty || enabledProperty.type !== 'Property') {
        return;
      }

      const enabledValueNode = enabledProperty.value;

      if (canBeUndefined(enabledValueNode)) {
        context.report({
          node: enabledValueNode,
          messageId: 'noUndefinedEnabled',
        });
      }
    }

    /**
     * Checks if a query hook call is using a potentially undefined variable directly for enabled option
     * @param {import('@typescript-eslint/types/dist/generated/ast-spec').CallExpression} node
     */
    function checkQueryHookForUndefinedEnabled(node) {
      // Check if this is a call inside a query hook function
      if (node.callee.type !== 'Identifier') {
        return;
      }

      // Check for common React Query hooks
      const reactQueryHooks = ['useQuery', 'useMutation', 'useInfiniteQuery', 'useSuspenseQuery'];
      if (!reactQueryHooks.includes(node.callee.name)) {
        return;
      }

      // Check if we're inside a function that's imported from queries
      const currentFunction = findContainingFunction(node);
      if (!currentFunction || !isQueryHookFunction(currentFunction)) {
        return;
      }

      // Check the enabled option in the query hook call
      const optionsArg = node.arguments.find((arg) => arg.type === 'ObjectExpression');
      if (optionsArg) {
        checkOptionsNode(optionsArg);
      }
    }

    /**
     * Checks if a queryOptions call is using a potentially undefined variable directly for enabled option
     * @param {import('@typescript-eslint/types/dist/generated/ast-spec').CallExpression} node
     */
    function checkQueryOptionsForUndefinedEnabled(node) {
      if (node.callee.type !== 'Identifier' || node.callee.name !== 'queryOptions') {
        return;
      }

      // Check if queryOptions is imported from @tanstack/react-query
      const currentScope = context.sourceCode.getScope(node);
      let variable = null;
      let scope = currentScope;

      while (scope && !variable) {
        variable = scope.variables.find((v) => v.name === 'queryOptions');
        scope = scope.upper;
      }

      if (!variable || !variable.defs || variable.defs.length === 0) {
        return;
      }

      const definition = variable.defs[0];
      if (definition.type !== 'ImportBinding') {
        return;
      }

      const importDeclaration = definition.node.parent;
      if (
        !importDeclaration ||
        importDeclaration.type !== 'ImportDeclaration' ||
        !importDeclaration.source
      ) {
        return;
      }

      const importPath = importDeclaration.source.value;

      // Check if queryOptions is imported from @tanstack/react-query
      if (importPath !== '@tanstack/react-query') {
        return;
      }

      // Check the options object passed to queryOptions
      if (node.arguments.length >= 1) {
        const optionsNode = node.arguments[0];
        checkOptionsNode(optionsNode);
      }
    }

    /**
     * Finds the containing function declaration or expression
     * @param {any} node
     */
    function findContainingFunction(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type === 'FunctionDeclaration' ||
          current.type === 'FunctionExpression' ||
          current.type === 'ArrowFunctionExpression'
        ) {
          return current;
        }
        current = current.parent;
      }
      return null;
    }

    /**
     * Checks if a function might be a query hook based on its name and location
     * @param {any} functionNode
     */
    function isQueryHookFunction(functionNode) {
      // Check if function name starts with 'use' (hook convention)
      let functionName = null;

      if (functionNode.type === 'FunctionDeclaration' && functionNode.id) {
        functionName = functionNode.id.name;
      } else if (
        functionNode.parent &&
        functionNode.parent.type === 'VariableDeclarator' &&
        functionNode.parent.id
      ) {
        functionName = functionNode.parent.id.name;
      }

      return functionName && functionName.startsWith('use');
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      /**
       * Visitor for call expressions, e.g., `useMyQuery({}, { enabled: myVar })`
       * @param {import('@typescript-eslint/types/dist/generated/ast-spec').CallExpression} node The AST node.
       */
      CallExpression(node) {
        // Check if this is a React Query hook call inside a query hook definition
        checkQueryHookForUndefinedEnabled(node);

        // Check if this is a queryOptions call from @tanstack/react-query
        checkQueryOptionsForUndefinedEnabled(node);

        // Check if this is a function call (identifier or member expression)
        if (node.callee.type !== 'Identifier') {
          return;
        }

        const functionName = node.callee.name;

        // --- Step 1: Identify if the called function is from a query hook file ---

        // Find the import declaration for this function
        // Traverse up the scope chain to find the variable
        let currentScope = context.sourceCode.getScope(node);
        let variable = null;

        while (currentScope && !variable) {
          variable = currentScope.variables.find((v) => v.name === functionName);
          currentScope = currentScope.upper;
        }

        if (!variable || !variable.defs || variable.defs.length === 0) {
          return;
        }

        const definition = variable.defs[0];
        if (definition.type !== 'ImportBinding') {
          return;
        }

        // For import declarations, we need to look at the parent (ImportDeclaration)
        const importDeclaration = definition.node.parent;
        if (
          !importDeclaration ||
          importDeclaration.type !== 'ImportDeclaration' ||
          !importDeclaration.source
        ) {
          return;
        }

        const importPath = importDeclaration.source.value;

        // Check if the import path includes '/queries' or '~queries'
        const isImportedQueryHook =
          importPath.includes('/queries') || importPath.includes('~queries');

        if (!isImportedQueryHook) {
          return;
        }

        // --- Step 2: Find the options object and check it ---

        // Handle `useQuery(options)` signature
        if (node.arguments.length === 1) {
          const optionsNode = node.arguments[0];
          checkOptionsNode(optionsNode);
        }
        // Handle `useQuery(data, options)` signature
        else if (node.arguments.length >= 2) {
          const optionsNode = node.arguments[1];
          checkOptionsNode(optionsNode);
        }
      },
    };
  },
};
