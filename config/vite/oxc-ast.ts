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

/*
 * Shared helpers for the Oxc-based Vite plugins in this folder (`emotion-styled-targets` and
 * `qa-component-attribute`), which replace the Babel pass the build used to run for those two
 * transforms. They parse a module with Rolldown's Oxc parser into an ESTree AST, walk it, and turn
 * RolldownMagicString edits into a Vite transform result with a source map. Rolldown's native
 * parser is much cheaper than the Babel pass, which roughly doubled build time.
 */

import { RolldownMagicString } from 'rolldown';
import { parseAst } from 'rolldown/parseAst';

export interface AstNode {
  [key: string]: unknown;
  end: number;
  start: number;
  type: string;
}

type Lang = 'js' | 'jsx' | 'ts' | 'tsx';

const LANG_BY_EXTENSION: Record<string, Lang> = {
  cjs: 'js',
  cts: 'ts',
  js: 'js',
  jsx: 'jsx',
  mjs: 'js',
  mts: 'ts',
  ts: 'ts',
  tsx: 'tsx',
};

export const NODE_MODULES = /[/\\]node_modules[/\\]/;

export function stripQuery(id: string) {
  const queryStart = id.search(/[?#]/);
  return queryStart === -1 ? id : id.slice(0, queryStart);
}

export function parseModule(code: string, id: string): AstNode {
  const extension = /\.([cm]?[jt]sx?)$/.exec(stripQuery(id))?.[1] ?? 'js';
  const program = parseAst(code, { lang: LANG_BY_EXTENSION[extension], preserveParens: false });
  return program as unknown as AstNode;
}

export function isNode(value: unknown): value is AstNode {
  return typeof value === 'object' && value !== null && typeof (value as AstNode).type === 'string';
}

export function child(node: AstNode | undefined, key: string): AstNode | undefined {
  const value = node?.[key];
  return isNode(value) ? value : undefined;
}

export function children(node: AstNode | undefined, key: string): AstNode[] {
  const value = node?.[key];
  return Array.isArray(value) ? value.filter(isNode) : [];
}

export function identifierName(node: AstNode | undefined): string | undefined {
  if (node?.type === 'Identifier' || node?.type === 'JSXIdentifier') {
    return node.name as string;
  }
  return undefined;
}

export function walk(
  node: AstNode,
  enter: (node: AstNode, ancestors: readonly AstNode[]) => void,
  ancestors: AstNode[] = [],
) {
  enter(node, ancestors);
  ancestors.push(node);
  for (const value of Object.values(node)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (isNode(item)) {
        walk(item, enter, ancestors);
      }
    }
  }
  ancestors.pop();
}

export function toTransformResult(magicString: RolldownMagicString, id: string) {
  if (!magicString.hasChanged()) {
    return null;
  }
  return {
    code: magicString.toString(),
    map: magicString
      .generateMap({ hires: 'boundary', includeContent: true, source: stripQuery(id) })
      .toString(),
  };
}
