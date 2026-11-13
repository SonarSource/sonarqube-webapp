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
 * Unit tests for the `emotion-styled-targets` Vite plugin, which replaced `@emotion/babel-plugin`.
 * They cover which styled calls get a target, how options are merged with existing ones, when
 * labels are added, that targets are stable per file and unique across files, since Emotion
 * component selectors depend on them, and that unused style creations are tree-shaken.
 *
 * Run with: node --test config/vite/emotion-styled-targets-test.mjs
 */
import assert from 'node:assert/strict';
import { posix } from 'node:path';
import { test } from 'node:test';
import { build } from 'rolldown';
import { addEmotionStyledTargets } from './emotion-styled-targets.ts';

const IMPORT = "import styled from '@emotion/styled';\n";
const ROOT = '/repo';
const ID = '/repo/src/Component.tsx';

function transform(code, { id = ID, withLabels = false } = {}) {
  return addEmotionStyledTargets(IMPORT + code, id, { root: ROOT, withLabels })?.code.slice(
    IMPORT.length,
  );
}

function targets(code) {
  return [...code.matchAll(/target: "(e[0-9a-f]{8})(\d+)"/g)].map(([, hash, index]) => ({
    hash,
    index: Number(index),
  }));
}

test('adds a target to tag shorthands, keeping TypeScript type arguments', () => {
  const code = transform('const A = styled.div`color: red;`;\nconst B = styled.span<Props>({});');
  assert.match(
    code,
    /^const A = \/\* @__PURE__ \*\/ styled\("div", \{ target: "e[0-9a-f]{8}0" \}\)\("color: red;"\);/,
  );
  assert.match(
    code,
    /const B = \/\* @__PURE__ \*\/ styled\("span", \{ target: "e[0-9a-f]{8}1" \}\)<Props>\(\{\}\);$/,
  );
});

test('adds options to factory calls without, with inline and with referenced options', () => {
  const code = transform(
    [
      'const A = styled(Base)`a`;',
      'const B = styled(Base, { shouldForwardProp })`b`;',
      'const C = styled("div", { label: "Custom" })`c`;',
      'const D = styled(Base, options)`d`;',
      'const E = styled("div", {})`e`;',
    ].join('\n'),
    { withLabels: true },
  );
  const [a, b, c, d, e] = code.split('\n');
  assert.match(
    a,
    /^const A = \/\* @__PURE__ \*\/ styled\(Base, \{ target: "e\w+0", label: "A" \}\)\("a"\);$/,
  );
  assert.match(
    b,
    /^const B = \/\* @__PURE__ \*\/ styled\(Base, \{ target: "e\w+1", label: "B", shouldForwardProp \}\)\("b"\);$/,
  );
  assert.match(
    c,
    /^const C = \/\* @__PURE__ \*\/ styled\("div", \{ target: "e\w+2", label: "Custom" \}\)\("c"\);$/,
  );
  assert.match(
    d,
    /^const D = \/\* @__PURE__ \*\/ styled\(Base, \{ target: "e\w+3", label: "D", \.\.\.\(options\) \}\)\("d"\);$/,
  );
  assert.match(
    e,
    /^const E = \/\* @__PURE__ \*\/ styled\("div", \{ target: "e\w+4", label: "E",\}\)\("e"\);$/,
  );
});

test('adds labels only when requested, from declarations, properties and assignments', () => {
  assert.doesNotMatch(transform('const A = styled.div``;'), /label/);
  const code = transform(
    [
      `const Wrapper = styled.div\`\${(p) => p.x}\`;`,
      'const parts = { Header: styled.h1``, "my title": styled.h2`` };',
      'Item.Inner = styled.span``;',
      'export default styled.p``;',
    ].join('\n'),
    { withLabels: true },
  );
  assert.match(code, /target: "e\w+0", label: "Wrapper"/);
  assert.match(code, /target: "e\w+1", label: "Header"/);
  assert.match(code, /target: "e\w+2", label: "my_title"/);
  assert.match(code, /target: "e\w+3", label: "Inner"/);
  assert.match(
    code,
    /export default \/\* @__PURE__ \*\/ styled\("p", \{ target: "e\w+4" \}\)\(\);/,
  );
});

test('handles styled components nested in other styled calls', () => {
  const code = transform('const A = styled(styled.div`a`)`b`;');
  assert.deepEqual(
    targets(code).map(({ index }) => index),
    [1, 0],
  );
  assert.match(
    code,
    /^const A = \/\* @__PURE__ \*\/ styled\(\/\* @__PURE__ \*\/ styled\("div", \{ target: "e\w+1" \}\)\("a"\), \{ target: "e\w+0" \}\)\("b"\);$/,
  );
});

test('targets are stable for a file and unique across files', () => {
  const first = targets(transform('const A = styled.div``;'));
  const again = targets(transform('const A = styled.div``;'));
  const other = targets(transform('const A = styled.div``;', { id: '/repo/src/Other.tsx' }));
  assert.deepEqual(first, again);
  assert.notEqual(first[0].hash, other[0].hash);
});

test('supports renamed default imports and ignores other identifiers', () => {
  const result = addEmotionStyledTargets(
    "import EmotionStyled from '@emotion/styled';\nconst A = EmotionStyled.div``;\nconst B = styled.div``;",
    ID,
    { root: ROOT, withLabels: false },
  );
  assert.match(
    result.code,
    /const A = \/\* @__PURE__ \*\/ EmotionStyled\("div", \{ target: "e\w+0" \}\)\(\);/,
  );
  assert.match(result.code, /const B = styled\.div``;$/);
});

test('returns null when @emotion/styled is not imported as a value', () => {
  const options = { root: ROOT, withLabels: false };
  assert.equal(addEmotionStyledTargets('const A = styled.div``;', ID, options), null);
  assert.equal(
    addEmotionStyledTargets(
      "import type styled from '@emotion/styled';\nconst A = styled.div``;",
      ID,
      options,
    ),
    null,
  );
});

test('gives withComponent calls their own target, even without a styled import', () => {
  const result = addEmotionStyledTargets(
    "import { Base } from './Base';\nconst Link = Base.withComponent('a');\nconst Other = Base.withComponent(Comp, { label: 'X' });\nfoo.withComponent();",
    ID,
    { root: ROOT, withLabels: true },
  );
  assert.match(
    result.code,
    /const Link = Base\.withComponent\('a', \{ target: "e\w+0", label: "Link" \}\);/,
  );
  assert.match(result.code, /Base\.withComponent\(Comp, \{ target: "e\w+1", label: 'X' \}\);/);
  assert.match(result.code, /foo\.withComponent\(\);$/);
});

test('ignores styled members that are not called', () => {
  assert.equal(
    addEmotionStyledTargets(IMPORT + 'const tags = [styled.div, styled[tag]];', ID, {
      root: ROOT,
      withLabels: false,
    }),
    null,
  );
});

test('inserts options after parenthesized components, trailing commas and comments', () => {
  const code = transform(
    [
      'const A = styled((Base))``;',
      'const B = styled(Base,)``;',
      'const C = styled(Base /* a, */)``;',
      'const D = styled(Base, // b\n)``;',
      'const E = (styled).div``;',
    ].join('\n'),
  );
  const [{ hash }] = targets(code);
  assert.equal(
    code,
    [
      `const A = /* @__PURE__ */ styled((Base), { target: "${hash}0" })();`,
      `const B = /* @__PURE__ */ styled(Base, { target: "${hash}1" })();`,
      `const C = /* @__PURE__ */ styled(Base /* a, */, { target: "${hash}2" })();`,
      `const D = /* @__PURE__ */ styled(Base, // b\n { target: "${hash}3" })();`,
      `const E = /* @__PURE__ */ (styled)("div", { target: "${hash}4" })();`,
    ].join('\n'),
  );
});

test('turns style templates into call arguments, keeping interpolations and escapes', () => {
  const code = transform(
    `const A = styled.div\`a \${(p) => p.x}\${B}:hover & { content: "\\\\2014\\\`" }\`;`,
  );
  const [{ hash }] = targets(code);
  assert.equal(
    code,
    `const A = /* @__PURE__ */ styled("div", { target: "${hash}0" })` +
      '("a ", (p) => p.x, B, ":hover & { content: \\"\\\\2014`\\" }");',
  );
});

test('keeps templates with invalid escapes as tagged templates, without a pure annotation', () => {
  const code = transform('const A = styled.div`\\unicode`;');
  assert.match(code, /^const A = styled\("div", \{ target: "e\w+0" \}\)`\\unicode`;$/);
});

test('marks css and keyframes calls as pure, but not withComponent or other calls', () => {
  const result = addEmotionStyledTargets(
    [
      "import { css as reactCss, useTheme } from '@emotion/react';",
      "import { css, keyframes, injectGlobal } from '@emotion/css';",
      `const a = reactCss\`color: \${x};\`;`,
      'const b = css({ color: x });',
      'const c = keyframes`from {}`;',
      'injectGlobal`body {}`;',
      'useTheme();',
      'const D = Base.withComponent("a");',
    ].join('\n'),
    ID,
    { root: ROOT, withLabels: false },
  );
  const [, , a, b, c, global, theme, d] = result.code.split('\n');
  assert.equal(a, 'const a = /* @__PURE__ */ reactCss("color: ", x, ";");');
  assert.equal(b, 'const b = /* @__PURE__ */ css({ color: x });');
  assert.equal(c, 'const c = /* @__PURE__ */ keyframes("from {}");');
  assert.equal(global, 'injectGlobal`body {}`;');
  assert.equal(theme, 'useTheme();');
  assert.match(d, /^const D = Base\.withComponent\("a", \{ target: "e\w+0" \}\);$/);
});

test('lets Rolldown tree-shake unused style creations', async () => {
  const files = {
    '/repo/src/main.js': "import { Used } from './styles.js';\nconsole.log(Used);",
    '/repo/src/styles.js': [
      "import styled from '@emotion/styled';",
      "import { css } from '@emotion/react';",
      'export const Used = styled.div`color: used;`;',
      'export const UnusedTag = styled.div`color: unused-tag;`;',
      'export const UnusedFactory = styled(Used)({ color: "unused-factory" });',
      'export const unusedCss = css`color: unused-css;`;',
    ].join('\n'),
  };
  const { output } = await build({
    input: '/repo/src/main.js',
    external: /^@emotion\//,
    write: false,
    plugins: [
      {
        name: 'virtual-files',
        resolveId: (source) => posix.resolve('/repo/src', source),
        load: (id) => files[id],
        transform: (code, id) =>
          addEmotionStyledTargets(code, id, { root: ROOT, withLabels: false }),
      },
    ],
  });
  assert.match(output[0].code, /color: used;/);
  assert.doesNotMatch(output[0].code, /unused/);
});
