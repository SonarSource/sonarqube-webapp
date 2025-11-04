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

import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getProjects,
  names,
  offsetFromRoot,
  Tree,
} from '@nx/devkit';
import { addTsConfigPath as addTsConfigPathToRoot, getRelativePathToRootTsConfig } from '@nx/js';
import * as path from 'path';
import { GeneratorSharedLibrarySchema } from './types';

export async function generatorSharedLibrary(tree: Tree, options: GeneratorSharedLibrarySchema) {
  const existingProjects = getProjects(tree);
  const isPrivate = options.visibility === 'visibility:private';
  const resolvedName = names(
    options.name.replace(/[^\w\s-:]+/g, ''), // Remove all weird characters
  ).fileName;
  const resolvedOptions = {
    ...options,
    name: resolvedName,
    projectRoot: `libs/${resolvedName}`,
  };

  // Feature libraries are prefixed with "feature-"
  if (resolvedOptions.type === 'type:feature' && !resolvedOptions.name.startsWith('feature-')) {
    resolvedOptions.name = `feature-${resolvedOptions.name}`;
    resolvedOptions.projectRoot = `libs/${resolvedOptions.name}`;
  }

  // Move private libraries to the private folder
  if (isPrivate) {
    resolvedOptions.projectRoot = `private/libs/${resolvedOptions.name}`;

    // If the library name is already used, prefix it with "private-"
    // to avoid conflicts with the public libraries
    if (existingProjects.has(resolvedOptions.name)) {
      resolvedOptions.name = `private-${resolvedOptions.name}`;
    }
  }

  // Generate library project configuration
  addProjectConfiguration(tree, resolvedOptions.name, {
    root: resolvedOptions.projectRoot,
    projectType: 'library',
    sourceRoot: `${resolvedOptions.projectRoot}/src`,
    tags: [options.type, options.visibility, 'scope:shared'],
    targets: {
      'format-check': {},
      lint: {},
      'lint-report': {},
    },
  });

  // Generate configuration files of the library
  const eslintRootPath = isPrivate
    ? offsetFromRootToPrivate(resolvedOptions.projectRoot) + '.eslintrc-private.js'
    : offsetFromRoot(resolvedOptions.projectRoot) + '.eslintrc.js';
  const tsconfigRootPath = getRelativePathToRootTsConfig(tree, resolvedOptions.projectRoot);
  generateFiles(tree, path.join(__dirname, 'files'), resolvedOptions.projectRoot, {
    ...resolvedOptions,
    eslintRootPath,
    tsconfigRootPath,
  });

  // Update tsconfig.json files at the root and in the sq-server and sq-cloud projects
  const importPath = `~${resolvedOptions.name}/*`;
  const lookupPath = `${resolvedOptions.projectRoot}/src/*`;
  addTsConfigPathToRoot(tree, importPath, [lookupPath]);
  ['sq-server', 'sq-cloud'].forEach((project) => {
    const projectRoot = existingProjects.get(project)?.root;
    if (projectRoot) {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      const tsconfig = tree.read(tsconfigPath)?.toString();
      if (tsconfig) {
        // Use string replacement to keep the comments intact
        const newTSConfig = tsconfig.replace(
          '<<shared-libraries-aliases>> */',
          `<<shared-libraries-aliases>> */\n      "${importPath}": ["${lookupPath}"],`,
        );
        tree.write(tsconfigPath, newTSConfig);
      }
    }
  });

  // Update root jest config with the new library alias
  const jestConfig = tree.read('config/jest/jest.config.base.js')?.toString();
  if (jestConfig) {
    const newJestConfig = jestConfig.replace(
      '<<shared-libraries-aliases>>',
      `<<shared-libraries-aliases>>\n    '^~${resolvedOptions.name}/(.+)': '<rootDir>/${resolvedOptions.projectRoot}/src/$1',`,
    );
    tree.write('config/jest/jest.config.base.js', newJestConfig);
  }

  // Format the changed/generated files
  await formatFiles(tree);
}

export default generatorSharedLibrary;

function offsetFromRootToPrivate(fullPathToDir: string): string {
  const fromRoot = offsetFromRoot(fullPathToDir);
  if (fullPathToDir.includes('private')) {
    // Remove the "../" related to the "private" part of the path
    return fromRoot.slice(0, -3);
  }
  return fromRoot + 'private/';
}
