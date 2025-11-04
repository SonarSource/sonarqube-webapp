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

const ts = require('typescript');
const path = require('path');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow potentially `undefined` values for the `enabled` option in custom query hooks imported from a 'queries' folder.",
      recommended: 'error', // For modern ESLint, this is still useful.
    },
    messages: {
      noUndefinedEnabled:
        "The 'enabled' option in a query hook must not be `undefined`. Use `false` to disable the query explicitly.",
      noUndefinedEnabledInQueryHook:
        'Variables that could be `undefined` should not be used directly for the `enabled` option in query hooks. Use `false` or a default value to handle the undefined case.',
    },
    schema: [], // No options for this rule
    // This property tells ESLint to provide type information.
    requiresTypeChecking: true,
  },

  create(context) {
    // Accessing parser services directly from context, which is available
    // because `requiresTypeChecking` is true.
    const parserServices = context.parserServices;
    const typeChecker = parserServices?.program?.getTypeChecker();

    if (!typeChecker || !parserServices) {
      // If type checking is not available, skip this rule
      return {};
    }

    // Track variables that are created with createQueryHook
    const queryHookVariables = new Set();

    /**
     * Checks if a TypeScript type can be 'undefined'.
     * @param {ts.Type} type The type to check.
     * @returns {boolean} True if the type includes `undefined`.
     */
    function typeCanBeUndefined(type) {
      if (type.flags & ts.TypeFlags.Undefined) {
        return true;
      }
      if (type.isUnion()) {
        return type.types.some((t) => t.flags & ts.TypeFlags.Undefined);
      }
      return false;
    }

    /**
     * Checks if a call expression is createQueryHook
     * @param {import('@typescript-eslint/types/dist/generated/ast-spec').CallExpression} node
     */
    function isCreateQueryHookCall(node) {
      return node.callee.type === 'Identifier' && node.callee.name === 'createQueryHook';
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
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(enabledValueNode);

      // Get the type at the location
      let type = typeChecker.getTypeAtLocation(tsNode);

      // If this is an identifier (variable), try to get its declared type
      if (enabledValueNode.type === 'Identifier') {
        const symbol = typeChecker.getSymbolAtLocation(tsNode);
        if (symbol && symbol.valueDeclaration) {
          const declaredType = typeChecker.getTypeOfSymbolAtLocation(
            symbol,
            symbol.valueDeclaration,
          );
          if (declaredType) {
            type = declaredType;
          }
        }
      }

      if (typeCanBeUndefined(type)) {
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
      const currentScope = context.getScope();
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

        // Check if this function is a createQueryHook call
        // First check our tracked variables, then fall back to definition traversal
        let isQueryHook = queryHookVariables.has(functionName);

        if (!isQueryHook) {
          // Check if this function call itself returns a query hook and is being called with createQueryHook signature
          // Look for patterns like: useModeQuery({ enabled: someValue })
          // where useModeQuery = createQueryHook(...)
          // Traverse up the scope chain to find the variable
          let scopeToCheck = context.getScope();
          let variableToCheck = null;

          while (scopeToCheck && !variableToCheck) {
            variableToCheck = scopeToCheck.variables.find((v) => v.name === functionName);
            scopeToCheck = scopeToCheck.upper;
          }

          if (variableToCheck && variableToCheck.defs && variableToCheck.defs.length > 0) {
            const definition = variableToCheck.defs[0];
            if (definition.type === 'Variable' && definition.node.init) {
              const init = definition.node.init;
              // Check if this variable was assigned the result of createQueryHook
              if (init.type === 'CallExpression' && isCreateQueryHookCall(init)) {
                isQueryHook = true;
              }
            }
          }
        }

        if (isQueryHook) {
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
          return;
        }

        // --- Step 1: Identify if the called function is from a query hook file ---

        // Find the import declaration for this function
        // Traverse up the scope chain to find the variable
        let currentScope = context.getScope();
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

      /**
       * Visitor for variable declarations to track createQueryHook variables
       */
      VariableDeclarator(node) {
        if (node.init && node.init.type === 'CallExpression' && isCreateQueryHookCall(node.init)) {
          if (node.id.type === 'Identifier') {
            queryHookVariables.add(node.id.name);
          }
        }
      },

      /**
       * Visitor for export declarations to track exported createQueryHook variables
       */
      ExportNamedDeclaration(node) {
        if (node.declaration && node.declaration.type === 'VariableDeclaration') {
          for (const declarator of node.declaration.declarations) {
            if (
              declarator.init &&
              declarator.init.type === 'CallExpression' &&
              isCreateQueryHookCall(declarator.init)
            ) {
              if (declarator.id.type === 'Identifier') {
                queryHookVariables.add(declarator.id.name);
              }
            }
          }
        }
      },
    };
  },
};
