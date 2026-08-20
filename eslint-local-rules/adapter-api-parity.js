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

'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const SQS_ADAPTERS_DIR = path.join(repoRoot, 'libs/sq-server-commons/src/sq-server-adapters');
const SQC_ADAPTERS_DIR = path.join(repoRoot, 'private/apps/sq-cloud/src/sq-cloud-adapters');

// ─── Memoization cache (Map<absolutePath, { exports: ExportInfo[] | null, mtimeMs: number }>) ───
// Keyed by absolute path. Entries are invalidated when the file's mtime changes so that
// the IDE gets up-to-date results after either adapter file is edited and saved.
// Exported as _counterpartCache for test teardown (clear between test cases).
const counterpartCache = new Map();

// ─── Type-only TypeScript declaration node types ──────────────────────────────
const TYPE_ONLY_KINDS = new Set([
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
]);

/**
 * @typedef {{ name: string, isFunction: boolean, isTypeOnly: boolean, paramCount: number, node: object }} ExportInfo
 */

/**
 * Extract exported symbols from a parsed AST body.
 *
 * Type-only exports (TSTypeAliasDeclaration, TSInterfaceDeclaration, TSEnumDeclaration, and
 * `export { type Foo }` / `export type { Foo }` re-exports) are included with isTypeOnly: true
 * so they can be matched against their counterparts.
 *
 * @param {object[]} body - AST body nodes
 * @returns {ExportInfo[]}
 */
function extractExports(body) {
  /** @type {ExportInfo[]} */
  const exports = [];

  for (const node of body) {
    if (node.type === 'ExportDefaultDeclaration') {
      exports.push({ name: 'default', isFunction: false, isTypeOnly: false, paramCount: 0, node });
      continue;
    }

    if (node.type !== 'ExportNamedDeclaration') {
      continue;
    }

    const { declaration, specifiers } = node;

    // Re-exports: export { Foo, Bar } or export { Foo } from '...'
    // `export type { Foo }` sets node.exportKind === 'type'.
    // `export { type Foo }` sets spec.exportKind === 'type'.
    // Both forms are tracked as isTypeOnly: true.
    if (!declaration && specifiers && specifiers.length > 0) {
      const nodeIsTypeOnly = node.exportKind === 'type';
      for (const spec of specifiers) {
        const isTypeOnly = nodeIsTypeOnly || spec.exportKind === 'type';
        const exported = spec.exported;
        const name =
          exported.type === 'Identifier' ? exported.name : (exported.value ?? exported.name);
        exports.push({ name, isFunction: false, isTypeOnly, paramCount: 0, node });
      }
      continue;
    }

    if (!declaration) {
      continue;
    }

    // Type-only declarations — included as isTypeOnly: true
    if (TYPE_ONLY_KINDS.has(declaration.type)) {
      if (declaration.id) {
        exports.push({
          name: declaration.id.name,
          isFunction: false,
          isTypeOnly: true,
          paramCount: 0,
          node,
        });
      }
      continue;
    }

    if (declaration.type === 'FunctionDeclaration') {
      const name = declaration.id ? declaration.id.name : 'default';
      const paramCount = (declaration.params || []).length;
      exports.push({ name, isFunction: true, isTypeOnly: false, paramCount, node });
      continue;
    }

    if (declaration.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        if (!declarator.id || declarator.id.type !== 'Identifier') {
          continue;
        }
        const name = declarator.id.name;
        const init = declarator.init;
        if (init && init.type === 'ArrowFunctionExpression') {
          const paramCount = (init.params || []).length;
          exports.push({ name, isFunction: true, isTypeOnly: false, paramCount, node });
        } else {
          // Non-function variable export (e.g. createQueryHook(...) result)
          exports.push({ name, isFunction: false, isTypeOnly: false, paramCount: 0, node });
        }
      }
      continue;
    }

    // ClassDeclaration or other declarations — treat as name-only
    if (declaration.id) {
      exports.push({
        name: declaration.id.name,
        isFunction: false,
        isTypeOnly: false,
        paramCount: 0,
        node,
      });
    }
  }

  return exports;
}

/**
 * Parse a TypeScript/TSX file and return its exports.
 * Results are cached by absolute path and invalidated when the file's mtime changes.
 *
 * @param {string} absolutePath
 * @returns {ExportInfo[] | null} null if file cannot be read/parsed
 */
function getExportsFromFile(absolutePath) {
  let mtimeMs;
  try {
    mtimeMs = fs.statSync(absolutePath).mtimeMs;
  } catch {
    counterpartCache.delete(absolutePath);
    return null;
  }

  const cached = counterpartCache.get(absolutePath);
  if (cached !== undefined && cached.mtimeMs === mtimeMs) {
    return cached.exports;
  }

  let source;
  try {
    source = fs.readFileSync(absolutePath, 'utf8');
  } catch {
    counterpartCache.set(absolutePath, { exports: null, mtimeMs });
    return null;
  }

  let ast;
  try {
    // require inside function so jest.mock('fs') is applied before module resolution
    const tsParser = require('@typescript-eslint/parser');
    ast = tsParser.parse(source, { jsx: true });
  } catch {
    counterpartCache.set(absolutePath, { exports: null, mtimeMs });
    return null;
  }

  const result = extractExports(ast.body || []);
  counterpartCache.set(absolutePath, { exports: result, mtimeMs });
  return result;
}

/**
 * Determine whether a file path contains a skip directory segment.
 *
 * @param {string} relativePath - path relative to the adapter root
 * @returns {boolean}
 */
function isInSkipDirectory(relativePath) {
  const segments = relativePath.split(/[\\/]/);
  return segments.some((seg) => seg === '__tests__' || seg === '__mocks__');
}

/**
 * Given an absolute path, determine which adapter tree it belongs to
 * and compute the counterpart absolute path.
 *
 * @param {string} absolutePath
 * @returns {{ relativeToAdapter: string, counterpartPath: string, counterpartRelRoot: string } | null}
 */
function resolveCounterpart(absolutePath) {
  const normalizedPath = absolutePath.replace(/\\/g, '/');
  const sqsDir = SQS_ADAPTERS_DIR.replace(/\\/g, '/');
  const sqcDir = SQC_ADAPTERS_DIR.replace(/\\/g, '/');

  if (normalizedPath.startsWith(sqsDir + '/')) {
    const rel = normalizedPath.slice(sqsDir.length + 1);
    if (isInSkipDirectory(rel)) {
      return null;
    }
    const counterpartAbs = path.join(SQC_ADAPTERS_DIR, rel);
    const counterpartRelRoot = path.relative(repoRoot, counterpartAbs).replace(/\\/g, '/');
    return { relativeToAdapter: rel, counterpartPath: counterpartAbs, counterpartRelRoot };
  }

  if (normalizedPath.startsWith(sqcDir + '/')) {
    const rel = normalizedPath.slice(sqcDir.length + 1);
    if (isInSkipDirectory(rel)) {
      return null;
    }
    const counterpartAbs = path.join(SQS_ADAPTERS_DIR, rel);
    const counterpartRelRoot = path.relative(repoRoot, counterpartAbs).replace(/\\/g, '/');
    return { relativeToAdapter: rel, counterpartPath: counterpartAbs, counterpartRelRoot };
  }

  return null;
}

// ─── Rule ─────────────────────────────────────────────────────────────────────

module.exports = {
  // Expose cache for test teardown
  _counterpartCache: counterpartCache,

  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce file and export parity between sq-server-adapters and sq-cloud-adapters',
      category: 'Possible Errors',
    },
    schema: [],
    messages: {
      missingCounterpartFile:
        'This adapter file has no counterpart at {{counterpartPath}}. Both adapter directories must contain identical files.',
      missingExportInCounterpart:
        "Export '{{name}}' exists here but is missing from the counterpart file at {{counterpartPath}}.",
      extraExportInCounterpart:
        "Export '{{name}}' exists in the counterpart file at {{counterpartPath}} but is missing here.",
      kindMismatch:
        "Export '{{name}}' is a {{currentKind}} here but a {{counterpartKind}} in the counterpart file at {{counterpartPath}}.",
      paramCountMismatch:
        "Function '{{name}}' has {{count}} parameter(s) here but {{counterpartCount}} in the counterpart file at {{counterpartPath}}.",
    },
  },

  create(context) {
    // Support both ESLint v8 (getFilename) and v9 flat config (filename property)
    const filename = context.filename ?? context.getFilename?.();
    if (!filename) {
      return {};
    }

    const resolved = resolveCounterpart(path.resolve(filename));
    if (!resolved) {
      return {};
    }

    const { counterpartPath, counterpartRelRoot } = resolved;

    return {
      Program(programNode) {
        // ── Check 1: counterpart file must exist ──────────────────────────
        if (!fs.existsSync(counterpartPath)) {
          context.report({
            node: programNode,
            messageId: 'missingCounterpartFile',
            data: { counterpartPath: counterpartRelRoot },
          });
          return;
        }

        // ── Check 2 & 3: export name and signature parity ─────────────────
        const counterpartExports = getExportsFromFile(counterpartPath);
        if (counterpartExports === null) {
          // Could not parse counterpart — skip further checks
          return;
        }

        /** @type {Map<string, ExportInfo>} */
        const counterpartMap = new Map(counterpartExports.map((e) => [e.name, e]));

        // Walk the current file's AST exports (already parsed by ESLint)
        const currentExports = extractExports(programNode.body);
        const currentNames = new Set(currentExports.map((e) => e.name));

        for (const currentExport of currentExports) {
          const counterpart = counterpartMap.get(currentExport.name);

          if (!counterpart) {
            context.report({
              node: currentExport.node,
              messageId: 'missingExportInCounterpart',
              data: {
                name: currentExport.name,
                counterpartPath: counterpartRelRoot,
              },
            });
            continue;
          }

          // Skip further checks when both sides are type-only.
          if (currentExport.isTypeOnly && counterpart.isTypeOnly) {
            continue;
          }

          // One side is a type export, the other is a value export — flag it.
          if (currentExport.isTypeOnly !== counterpart.isTypeOnly) {
            context.report({
              node: currentExport.node,
              messageId: 'kindMismatch',
              data: {
                name: currentExport.name,
                currentKind: currentExport.isTypeOnly ? 'type' : 'value',
                counterpartKind: counterpart.isTypeOnly ? 'type' : 'value',
                counterpartPath: counterpartRelRoot,
              },
            });
            continue;
          }

          // Check parameter count when both sides are functions
          if (
            currentExport.isFunction &&
            counterpart.isFunction &&
            currentExport.paramCount !== counterpart.paramCount
          ) {
            context.report({
              node: currentExport.node,
              messageId: 'paramCountMismatch',
              data: {
                name: currentExport.name,
                count: currentExport.paramCount,
                counterpartCount: counterpart.paramCount,
                counterpartPath: counterpartRelRoot,
              },
            });
          }
        }

        // Check for exports in counterpart missing from current file
        for (const counterpartExport of counterpartExports) {
          if (!currentNames.has(counterpartExport.name)) {
            context.report({
              node: programNode,
              messageId: 'extraExportInCounterpart',
              data: {
                name: counterpartExport.name,
                counterpartPath: counterpartRelRoot,
              },
            });
          }
        }
      },
    };
  },
};
