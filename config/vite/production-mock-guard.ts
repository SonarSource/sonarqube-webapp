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

import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

export function productionMockGuard(): Plugin {
  let isProduction = false;

  return {
    name: 'production-mock-guard',
    apply: 'build',
    configResolved(config) {
      isProduction = config.isProduction;
    },
    generateBundle(_options, bundle) {
      if (!isProduction) {
        return;
      }
      const mockModules = new Set<string>();

      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') {
          continue;
        }

        for (const id of Object.keys(output.modules)) {
          const normalizedId = id.replaceAll('\\', '/');
          if (
            /\/(?:msw|@mswjs|__mocks__|mocks(?:-v2)?)\//.test(normalizedId) ||
            /\/(?:devMockHandlers|handlersDev|testMocks|testApiMock)\.[cm]?[jt]sx?(?:\?|$)/.test(
              normalizedId,
            )
          ) {
            mockModules.add(id);
          }
        }
      }

      if (mockModules.size > 0) {
        this.error(
          `Mock modules found in the production bundle:\n${[...mockModules].sort().join('\n')}`,
        );
      }
    },
    async writeBundle(options) {
      if (!isProduction) {
        return;
      }
      // Vite copies public assets separately from the bundle, including locally generated MSW files.
      // Remove both development-only workers from the production output, leaving the originals in
      // public/ available for local development. "force" allows either worker file to be absent.
      const outputDirectory = options.dir;
      if (!outputDirectory) {
        this.error('Expected an output directory for the production build');
      }
      await Promise.all(
        ['whitelistWorker.js', 'mockServiceWorker.js'].map((file) =>
          rm(resolve(outputDirectory, file), { force: true }),
        ),
      );
    },
  };
}
