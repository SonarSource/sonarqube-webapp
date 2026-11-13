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
 * Vite plugin replacing `@emotion/babel-plugin`. Emotion component selectors (`${Styled}:hover &`)
 * only work when every styled component has a stable `target` class; without it Emotion throws in
 * development and silently emits `.undefined` selectors in production. This plugin adds
 * `{ target, label }` options to `styled.tag`, `styled(Component)`, `styled(Component, options)` and
 * `.withComponent()` calls. Labels (readable class name suffixes) are only added in development.
 * Like Babel, it marks styled, `css` and `keyframes` style creations as `#__PURE__` so unused ones
 * are tree-shaken, turning tagged templates into calls because Rolldown ignores the annotation on
 * tagged templates. Ported from `src/styled-macro.js`, `src/core-macro.js`, `src/emotion-macro.js`
 * and `src/utils/get-styled-options.js` in
 * https://github.com/emotion-js/emotion/tree/main/packages/babel-plugin, without its CSS minification.
 */

import { createHash } from 'node:crypto';
import { relative } from 'node:path';
import { RolldownMagicString } from 'rolldown';
import type { Plugin } from 'vite';
import {
  type AstNode,
  child,
  children,
  identifierName,
  NODE_MODULES,
  parseModule,
  stripQuery,
  toTransformResult,
  walk,
} from './oxc-ast.ts';

const STYLED_IMPORTS = new Map([['@emotion/styled', ['default']]]);
const PURE_STYLE_IMPORTS = new Map([
  ['@emotion/react', ['css']],
  ['@emotion/css', ['css', 'keyframes']],
]);
const STYLED_CODE = /@emotion\/(?:styled|react|css)|\.withComponent\(/;
const PURE_ANNOTATION = '/* @__PURE__ */ ';

interface EmotionStyledTargetsOptions {
  root: string;
  withLabels: boolean;
}

export function emotionStyledTargets(): Plugin {
  const options: EmotionStyledTargetsOptions = { root: process.cwd(), withLabels: false };

  return {
    name: 'emotion-styled-targets',
    enforce: 'pre',
    configResolved(config) {
      options.root = config.root;
      options.withLabels = !config.isProduction;
    },
    transform: {
      filter: {
        id: { include: /\.[cm]?[jt]sx?(?:$|\?)/, exclude: NODE_MODULES },
        code: STYLED_CODE,
      },
      handler(code, id) {
        return addEmotionStyledTargets(code, id, options);
      },
    },
  };
}

export function addEmotionStyledTargets(
  code: string,
  id: string,
  { root, withLabels }: EmotionStyledTargetsOptions,
) {
  const program = parseModule(code, id);
  const styledNames = getImportedNames(program, STYLED_IMPORTS);
  const pureStyleNames = getImportedNames(program, PURE_STYLE_IMPORTS);
  const filePath = relative(root, stripQuery(id)).replaceAll('\\', '/');
  const fileHash = createHash('sha256').update(filePath).digest('hex').slice(0, 8);
  const magicString = new RolldownMagicString(code);
  let position = 0;

  const nextOptions = (ancestors: readonly AstNode[]) => {
    const target = JSON.stringify(`e${fileHash}${position}`);
    position += 1;
    const label = withLabels ? getLabel(ancestors) : undefined;
    return { target, label: label === undefined ? undefined : JSON.stringify(label) };
  };

  walk(program, (node, ancestors) => {
    const parent = ancestors.at(-1);
    if (isStyledTagShorthand(node, parent, styledNames)) {
      const property = child(node, 'property') as AstNode;
      const tag = JSON.stringify(identifierName(property));
      const options = formatOptions(nextOptions(ancestors));
      const dot = code.lastIndexOf('.', property.start);
      magicString.update(dot, node.end, `(${tag}, { ${options} })`);
      annotateAsPure(magicString, parent as AstNode);
    } else if (isStyledFactoryCall(node, styledNames)) {
      addOptionsToFactoryCall(magicString, code, node, nextOptions(ancestors));
      const styleCreation = getStyleCreation(node, parent);
      if (styleCreation && styledNames.has(identifierName(child(node, 'callee')) ?? '')) {
        annotateAsPure(magicString, styleCreation);
      }
    } else if (isPureStyleCall(node, pureStyleNames)) {
      annotateAsPure(magicString, node);
    }
  });

  return toTransformResult(magicString, id);
}

function getImportedNames(program: AstNode, imports: Map<string, string[]>) {
  const names = new Set<string>();
  for (const statement of children(program, 'body')) {
    const exportNames =
      statement.type === 'ImportDeclaration' && statement.importKind !== 'type'
        ? imports.get(child(statement, 'source')?.value as string)
        : undefined;
    for (const specifier of exportNames ? children(statement, 'specifiers') : []) {
      const importedName = getImportedName(specifier);
      const localName = identifierName(child(specifier, 'local'));
      if (importedName && exportNames?.includes(importedName) && localName) {
        names.add(localName);
      }
    }
  }
  return names;
}

function getImportedName(specifier: AstNode) {
  if (specifier.type === 'ImportDefaultSpecifier') {
    return 'default';
  }
  if (specifier.type === 'ImportSpecifier' && specifier.importKind !== 'type') {
    return identifierName(child(specifier, 'imported'));
  }
  return undefined;
}

function getStyleCreation(node: AstNode, parent: AstNode | undefined) {
  const isStyleCreation =
    (parent?.type === 'CallExpression' && parent.callee === node) ||
    (parent?.type === 'TaggedTemplateExpression' && parent.tag === node);
  return isStyleCreation ? parent : undefined;
}

function isStyledTagShorthand(
  node: AstNode,
  parent: AstNode | undefined,
  styledNames: Set<string>,
) {
  return (
    node.type === 'MemberExpression' &&
    !node.computed &&
    !node.optional &&
    styledNames.has(identifierName(child(node, 'object')) ?? '') &&
    identifierName(child(node, 'property')) !== undefined &&
    getStyleCreation(node, parent) !== undefined
  );
}

function isPureStyleCall(node: AstNode, pureStyleNames: Set<string>) {
  let callee: AstNode | undefined;
  if (node.type === 'CallExpression') {
    callee = child(node, 'callee');
  } else if (node.type === 'TaggedTemplateExpression') {
    callee = child(node, 'tag');
  }
  return pureStyleNames.has(identifierName(callee) ?? '');
}

function annotateAsPure(magicString: RolldownMagicString, expression: AstNode) {
  if (expression.type === 'TaggedTemplateExpression') {
    const template = child(expression, 'quasi') as AstNode;
    if (!replaceTemplateWithArguments(magicString, template)) {
      return;
    }
  }
  magicString.prependLeft(expression.start, PURE_ANNOTATION);
}

function replaceTemplateWithArguments(magicString: RolldownMagicString, template: AstNode) {
  const expressions = children(template, 'expressions');
  const strings = children(template, 'quasis').map(
    (quasi) => (quasi.value as { cooked: string | null }).cooked,
  );
  if (strings.includes(null)) {
    return false;
  }
  const last = strings.length - 1;
  strings.forEach((string, index) => {
    const literal = string ? JSON.stringify(string) : '';
    const leadingComma = index > 0 && literal ? ', ' : '';
    const trailingComma = index < last && (literal || index > 0) ? ', ' : '';
    const start = index === 0 ? template.start : expressions[index - 1].end;
    const end = index === last ? template.end : expressions[index].start;
    const open = index === 0 ? '(' : '';
    const close = index === last ? ')' : '';
    magicString.update(start, end, `${open}${leadingComma}${literal}${trailingComma}${close}`);
  });
  return true;
}

function isStyledFactoryCall(node: AstNode, styledNames: Set<string>) {
  if (node.type !== 'CallExpression') {
    return false;
  }
  const callee = child(node, 'callee');
  if (styledNames.has(identifierName(callee) ?? '')) {
    return true;
  }
  const argumentCount = children(node, 'arguments').length;
  return (
    callee?.type === 'MemberExpression' &&
    !callee.computed &&
    identifierName(child(callee, 'property')) === 'withComponent' &&
    (argumentCount === 1 || argumentCount === 2)
  );
}

function addOptionsToFactoryCall(
  magicString: RolldownMagicString,
  code: string,
  call: AstNode,
  options: Record<string, string | undefined>,
) {
  const [component, styledOptions] = children(call, 'arguments');
  if (component === undefined || component.type === 'SpreadElement') {
    return;
  }

  if (styledOptions === undefined) {
    const closingParenthesis = call.end - 1;
    const separator = endsWithComma(code, component.end, closingParenthesis) ? ' ' : ', ';
    magicString.appendLeft(closingParenthesis, `${separator}{ ${formatOptions(options)} }`);
  } else if (styledOptions.type === 'ObjectExpression') {
    const existingKeys = new Set(
      children(styledOptions, 'properties').map((property) =>
        identifierName(child(property, 'key')),
      ),
    );
    const missing = Object.fromEntries(
      Object.entries(options).filter(([key]) => !existingKeys.has(key)),
    );
    const properties = formatOptions(missing);
    if (properties !== '') {
      magicString.appendLeft(styledOptions.start + 1, ` ${properties},`);
    }
  } else if (styledOptions.type !== 'SpreadElement') {
    magicString.prependRight(styledOptions.start, `{ ${formatOptions(options)}, ...(`);
    magicString.appendLeft(styledOptions.end, ') }');
  }
}

function endsWithComma(code: string, start: number, end: number) {
  let lastCharacter = '';
  let index = start;
  while (index < end) {
    if (code.startsWith('/*', index)) {
      index = Math.max(index + 2, code.indexOf('*/', index + 2) + 2);
    } else if (code.startsWith('//', index)) {
      index = Math.max(index + 2, code.indexOf('\n', index) + 1);
    } else {
      lastCharacter = code[index].trim() || lastCharacter;
      index += 1;
    }
  }
  return lastCharacter === ',';
}

function formatOptions(options: Record<string, string | undefined>) {
  return Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

function getLabel(ancestors: readonly AstNode[]) {
  for (let index = ancestors.length - 1; index >= 0; index--) {
    const ancestor = ancestors[index];
    switch (ancestor.type) {
      case 'VariableDeclarator':
        return sanitizeLabel(identifierName(child(ancestor, 'id')));
      case 'Property':
      case 'PropertyDefinition': {
        const key = child(ancestor, 'key');
        return sanitizeLabel(identifierName(key) ?? (key?.value as string | undefined));
      }
      case 'AssignmentExpression': {
        const left = child(ancestor, 'left');
        return sanitizeLabel(identifierName(left) ?? identifierName(child(left, 'property')));
      }
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        return sanitizeLabel(identifierName(child(ancestor, 'id')));
      default:
    }
  }
  return undefined;
}

function sanitizeLabel(label: string | undefined) {
  return label === undefined || label === '' ? undefined : label.replaceAll(/[^\w-]/g, '_');
}
