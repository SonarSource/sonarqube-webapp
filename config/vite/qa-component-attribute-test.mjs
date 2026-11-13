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
 * Unit tests for the `qa-component-attribute` Vite plugin, which replaced
 * `babel-plugin-transform-react-qa-classes`. They pin the Babel plugin's behaviour (which elements
 * are tagged, attribute placement, naming) because Mixpanel analytics rely on the produced
 * `data-component` values staying unchanged.
 *
 * Run with: node --test config/vite/qa-component-attribute-test.mjs
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addQaComponentAttributes } from './qa-component-attribute.ts';

function transform(code) {
  return addQaComponentAttributes(code, '/src/Component.tsx')?.code;
}

test('tags the element returned by a function declaration after its other attributes', () => {
  assert.equal(
    transform('export function MyFancyCard(props) { return <div {...props} id="x" />; }'),
    'export function MyFancyCard(props) { return <div {...props} id="x" data-component="my-fancy-card" />; }',
  );
});

test('tags arrow components with expression, parenthesized and block bodies', () => {
  assert.equal(
    transform(
      'const A = () => <a>x</a>;\nconst B = () => (<b />);\nconst C = () => { return <c />; };',
    ),
    'const A = () => <a data-component="a">x</a>;\nconst B = () => (<b data-component="b" />);\nconst C = () => { return <c data-component="c" />; };',
  );
});

test('places the attribute after JSX type arguments when there are no other attributes', () => {
  assert.equal(
    transform('function Picker() { return <Select<Option>></Select>; }'),
    'function Picker() { return <Select<Option> data-component="picker"></Select>; }',
  );
});

test('only considers the first top-level return statement', () => {
  assert.equal(
    transform('function Item({ a }) { if (a) { return <i />; } return <b />; }'),
    'function Item({ a }) { if (a) { return <i />; } return <b data-component="item" />; }',
  );
  assert.equal(transform('function Item() { return null; return <b />; }'), undefined);
});

test('skips fragments, existing attributes and unnamed functions', () => {
  const code = [
    'function A() { return <></>; }',
    'function B() { return <Fragment />; }',
    'function C() { return <React.Fragment />; }',
    'function D() { return <div data-component="custom" />; }',
    'items.map(() => <li />);',
    'export default function () { return <div />; }',
    'const E = memo(() => <div />);',
    'const F = function () { return <div />; };',
  ].join('\n');
  assert.equal(transform(code), undefined);
});

test('tags every JSX element returned from a class render method with the class name', () => {
  assert.equal(
    transform(
      'class LegacyThing extends React.Component { render() { if (x) { return <a />; } const Row = () => { return <li />; }; return <b />; } }',
    ),
    'class LegacyThing extends React.Component { render() { if (x) { return <a data-component="legacy-thing" />; } const Row = () => { return <li data-component="legacy-thing" />; }; return <b data-component="legacy-thing" />; } }',
  );
});

test('tags nested named components independently', () => {
  assert.equal(
    transform('function Outer() { const renderRow = () => <tr />; return <table />; }'),
    'function Outer() { const renderRow = () => <tr data-component="render-row" />; return <table data-component="outer" />; }',
  );
});

test('keeps non-ASCII source intact and returns a source map', () => {
  const result = addQaComponentAttributes(
    '// Sàrl 😀\nconst Émoji = () => <span title="ü" />;\n',
    '/src/Emoji.tsx?v=1',
  );
  assert.equal(
    result.code,
    '// Sàrl 😀\nconst Émoji = () => <span title="ü" data-component="emoji" />;\n',
  );
  const map = JSON.parse(result.map);
  assert.deepEqual(map.sources, ['/src/Emoji.tsx']);
  assert.ok(map.mappings.length > 0);
});

test('supports a custom attribute name', () => {
  assert.equal(
    addQaComponentAttributes('const Foo = () => <div />;', '/a.jsx', 'data-qa').code,
    'const Foo = () => <div data-qa="foo" />;',
  );
});
