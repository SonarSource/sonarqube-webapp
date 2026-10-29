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

import tailwindcss from '@tailwindcss/vite';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import { analyzeBundle, baseViteConfig, proxyTarget, workspaceRoot } from '../../vite.config.base';
import { viteDevServerHtmlPlugin } from './config/vite-dev-server-html-plugin.mjs';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const isPublicEdition =
    !existsSync(resolve(workspaceRoot, 'private')) || process.env['EDITION'] === 'public';

  const addonsAlias = isPublicEdition
    ? resolve(workspaceRoot, 'libs/sq-server-addons/src')
    : resolve(workspaceRoot, 'private/libs/sq-server-addons/src');

  return defineConfig({
    ...baseViteConfig,

    experimental: {
      // The WEB_CONTEXT string is replaced at runtime by the SQ backend web server
      // (WebPagesCache.java) with the instance configured context path
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'html') {
          // All the files that are added to the (index.)html file are prefixed with WEB_CONTEXT/
          return 'WEB_CONTEXT/' + filename;
        } else if (hostType === 'js') {
          // All the files that are lazy loaded from a js chunk are prefixed with the WEB_CONTEXT
          // thanks to the __assetsPath function that's defined in index.html.
          return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` };
        } else {
          // Other files (css, images, etc.) are loaded relatively to the current url,
          // automatically taking into account the WEB_CONTEXT
          return { relative: true };
        }
      },
    },
    plugins: [
      tailwindcss(),
      ...baseViteConfig.plugins,
      analyzeBundle && {
        name: 'hide-analyzer-sourcemap-references',
        enforce: 'post',
        config() {
          // Run after the bundle analyzer forces sourcemap: true. And override it to hidden.
          // Hidden maps avoid JS references; the analyzer removes the maps before writing.
          return { build: { sourcemap: 'hidden' } };
        },
      },
      viteDevServerHtmlPlugin(),
    ],

    resolve: {
      ...baseViteConfig.resolve,

      alias: {
        ...baseViteConfig.resolve.alias,

        '~design-system': resolve(
          workspaceRoot,
          'libs/sq-server-commons/src/design-system/index.ts',
        ),
        '~sq-server-addons': addonsAlias,
        // worker.ts files are not bundled the same way as the rest of the webapp.
        // This is required for aliases to work from worker.ts files
        '~adapters': resolve(workspaceRoot, 'libs/sq-server-commons/src/sq-server-adapters'),
        '~shared': resolve(workspaceRoot, 'libs/shared/src'),
      },
    },
    server: {
      ...baseViteConfig.server,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/static': {
          target: proxyTarget,
          changeOrigin: true,
        },
        // Callback URL for GitHub manifest app workflow.
        // Without this, you'll get a 404 error when trying to install the app while running the dev server.
        '/github/manifest/callback': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  });
};
