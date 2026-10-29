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

// Run with: node --test config/vite/production-mock-guard-test.mjs
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { build } from 'vite';
import { productionMockGuard } from './production-mock-guard.ts';

async function fixture(entry) {
  const root = await mkdtemp(join(tmpdir(), 'production-mock-guard-'));
  await mkdir(join(root, 'public'));
  await mkdir(join(root, 'mocks'));
  await writeFile(join(root, 'index.html'), '<script type="module" src="/entry.js"></script>');
  await writeFile(join(root, 'entry.js'), entry);
  await writeFile(join(root, 'mocks/handler.js'), 'console.log("mock handler loaded");');
  for (const file of ['whitelistWorker.js', 'mockServiceWorker.js', 'keep.txt']) {
    await writeFile(join(root, 'public', file), file);
  }
  return root;
}

async function buildFixture(root) {
  return build({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [productionMockGuard()],
  });
}

test('production removes worker assets and eliminates guarded mock imports', async () => {
  const root = await fixture('if (import.meta.env.DEV) { import("./mocks/handler.js"); }');
  try {
    await buildFixture(root);
    const files = await readdir(join(root, 'dist'));
    assert.ok(!files.includes('whitelistWorker.js'));
    assert.ok(!files.includes('mockServiceWorker.js'));
    assert.equal(await readFile(join(root, 'dist/keep.txt'), 'utf8'), 'keep.txt');
    // Building must leave the development assets untouched.
    assert.equal((await readdir(join(root, 'public'))).length, 3);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('production rejects an unguarded mock import', async () => {
  const root = await fixture('import "./mocks/handler.js";');
  try {
    await assert.rejects(buildFixture(root), /Mock modules found in the production bundle/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
