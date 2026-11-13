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
 * Vite plugin replacing `babel-plugin-transform-react-qa-classes`. It adds
 * `data-component="kebab-case-component-name"` to the JSX element returned by named function
 * components, arrow components assigned to a variable, and class component `render` methods.
 * Mixpanel autocapture records this attribute and some styles target it (for example
 * `data-component='badge'` in NavBarTabs), so its output must stay identical to the Babel plugin's.
 */

import lodash from 'lodash';
import { RolldownMagicString } from 'rolldown';
import type { Plugin } from 'vite';
import {
  type AstNode,
  child,
  children,
  identifierName,
  NODE_MODULES,
  parseModule,
  toTransformResult,
  walk,
} from './oxc-ast.ts';

const DEFAULT_ATTRIBUTE = 'data-component';

export function qaComponentAttribute(attribute = DEFAULT_ATTRIBUTE): Plugin {
  return {
    name: 'qa-component-attribute',
    enforce: 'pre',
    transform: {
      filter: { id: { include: /\.[jt]sx(?:$|\?)/, exclude: NODE_MODULES } },
      handler(code, id) {
        return addQaComponentAttributes(code, id, attribute);
      },
    },
  };
}

export function addQaComponentAttributes(code: string, id: string, attribute = DEFAULT_ATTRIBUTE) {
  const magicString = new RolldownMagicString(code);
  const taggedElements = new Set<AstNode>();

  const tagElement = (element: AstNode | undefined, componentName: string | undefined) => {
    const openingElement = child(element, 'openingElement');
    if (
      element === undefined ||
      openingElement === undefined ||
      taggedElements.has(element) ||
      isFragment(openingElement) ||
      hasAttribute(openingElement, attribute)
    ) {
      return;
    }
    taggedElements.add(element);
    magicString.appendLeft(
      getAttributeInsertionIndex(openingElement),
      ` ${attribute}="${lodash.kebabCase(componentName)}"`,
    );
  };

  walk(parseModule(code, id), (node, ancestors) => {
    if (node.type === 'FunctionDeclaration') {
      const name = identifierName(child(node, 'id'));
      if (name) {
        tagElement(getReturnedElement(node), name);
      }
    } else if (node.type === 'ArrowFunctionExpression') {
      const parent = ancestors.at(-1);
      const name = parent?.type === 'VariableDeclarator' && identifierName(child(parent, 'id'));
      if (name) {
        tagElement(getReturnedElement(node), name);
      }
    } else if (node.type === 'ClassDeclaration') {
      const componentName = identifierName(child(node, 'id'));
      const render = children(child(node, 'body'), 'body').find(
        (member) =>
          member.type === 'MethodDefinition' &&
          identifierName(child(member, 'key')) === 'render' &&
          child(child(member, 'value'), 'body') !== undefined,
      );
      if (render) {
        walk(render, (renderNode) => {
          const argument = child(renderNode, 'argument');
          if (renderNode.type === 'ReturnStatement' && argument?.type === 'JSXElement') {
            tagElement(argument, componentName);
          }
        });
      }
    }
  });

  return toTransformResult(magicString, id);
}

function getReturnedElement(fn: AstNode) {
  const body = child(fn, 'body');
  if (body?.type === 'JSXElement') {
    return body;
  }
  const returned = child(
    children(body, 'body').find((statement) => statement.type === 'ReturnStatement'),
    'argument',
  );
  return returned?.type === 'JSXElement' ? returned : undefined;
}

function isFragment(openingElement: AstNode) {
  const name = child(openingElement, 'name');
  return (
    identifierName(name) === 'Fragment' ||
    (name?.type === 'JSXMemberExpression' &&
      identifierName(child(name, 'object')) === 'React' &&
      identifierName(child(name, 'property')) === 'Fragment')
  );
}

function hasAttribute(openingElement: AstNode, attribute: string) {
  return children(openingElement, 'attributes').some(
    (node) => identifierName(child(node, 'name')) === attribute,
  );
}

function getAttributeInsertionIndex(openingElement: AstNode) {
  const lastAttribute = children(openingElement, 'attributes').at(-1);
  const anchor =
    lastAttribute ?? child(openingElement, 'typeArguments') ?? child(openingElement, 'name');
  return (anchor ?? openingElement).end;
}
