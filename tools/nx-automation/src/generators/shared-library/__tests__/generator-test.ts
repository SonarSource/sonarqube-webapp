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

import { addProjectConfiguration, readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { generatorSharedLibrary } from '../generator';
import { GeneratorSharedLibrarySchema } from '../types';

const TSCONFIG_WITH_MARKER = [
  '{',
  '  "compilerOptions": {',
  '    "paths": {',
  '      /* <<shared-libraries-aliases>> */',
  '      "~shared/*": ["../shared/src/*"]',
  '    }',
  '  }',
  '}',
  '',
].join('\n');

describe('generator shared-library', () => {
  let tree: Tree;
  const options: GeneratorSharedLibrarySchema = {
    name: 'test',
    type: 'type:util',
    visibility: 'visibility:public',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generatorSharedLibrary(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('inserts library aliases relative to each app tsconfig (no baseUrl)', async () => {
    addProjectConfiguration(tree, 'sq-server', {
      root: 'apps/sq-server',
      projectType: 'application',
    });
    addProjectConfiguration(tree, 'sq-cloud', {
      root: 'private/apps/sq-cloud',
      projectType: 'application',
    });
    tree.write('apps/sq-server/tsconfig.json', TSCONFIG_WITH_MARKER);
    tree.write('private/apps/sq-cloud/tsconfig.json', TSCONFIG_WITH_MARKER);

    await generatorSharedLibrary(tree, options);

    // sq-server lives two levels below the workspace root.
    expect(tree.read('apps/sq-server/tsconfig.json', 'utf-8')).toMatch(
      /"~test\/\*":\s*\[\s*"\.\.\/\.\.\/libs\/test\/src\/\*"\s*\]/,
    );
    // sq-cloud lives three levels below the workspace root.
    expect(tree.read('private/apps/sq-cloud/tsconfig.json', 'utf-8')).toMatch(
      /"~test\/\*":\s*\[\s*"\.\.\/\.\.\/\.\.\/libs\/test\/src\/\*"\s*\]/,
    );
  });
});
