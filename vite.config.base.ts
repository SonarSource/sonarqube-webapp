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

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import path, { resolve } from 'path';
import postCssCalc from 'postcss-calc';
import license from 'rollup-plugin-license';
import { UserConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import macrosPlugin from 'vite-plugin-babel-macros';
import requireTransform from 'vite-plugin-require-transform';
import babelConfig from './babel.config';
import { ALLOWED_LICENSE_TEXT, ALLOWED_LICENSES, generateLicenseText } from './config/license';
import packageJson from './package.json';

export const DEFAULT_DEV_SERVER_PORT = 3000;
export const DEFAULT_WS_PROXY_PORT = 3010;

export const port = Number(process.env.PORT || DEFAULT_DEV_SERVER_PORT);
export const proxyTarget = (process.env.PROXY || 'http://localhost:9000').replace(/\/$/, '');
export const isProduction = process.env.NODE_ENV === 'production';
export const analyzeBundle = process.env.BUNDLE_ANALYSIS === 'true' || false;

export const projectRoot = process.cwd();
export const workspaceRoot = __dirname;

// https://vitejs.dev/config/
export const baseViteConfig = {
  build: {
    outDir: resolve(projectRoot, 'build/webapp'),
    rollupOptions: {
      // we define all the places where a user can land that requires its own bundle entry point.
      // one main entry point by default that can be overriden by projects
      input: {
        main: resolve(projectRoot, 'index.html'),
      },
      output: {
        // in order to override the default `build/webapp/assets/` directory we provide our own configuration
        // to place content directly into `build/webapp/` directory
        assetFileNames: '[ext]/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        // Manual chunk splitting strategy. The packages will be split to its own js package
        // We also have one more advantage with manual chunks which is caching. Unless we update
        // the version of following packages, we would have caching on these chunks as the hash
        // remains the same in successive builds as the package isn't changed
        manualChunks: {
          // vendor js chunk will contain only react dependencies
          vendor: ['react', 'react-router-dom', 'react-dom'],
          echoes: ['@sonarsource/echoes-react'],
          datefns: ['date-fns'],
          lodash: ['lodash/lodash.js'],
          highlightjs: [
            'highlight.js',
            'highlightjs-apex',
            'highlightjs-cobol',
            'highlightjs-sap-abap',
          ],
        },
      },
      plugins: [
        // a tool used to concatenate all of our 3rd party licenses together for legal reasons
        license({
          thirdParty: {
            allow: {
              test: ({ license, licenseText }) =>
                ALLOWED_LICENSES.includes(license ?? '') ||
                ALLOWED_LICENSE_TEXT.some((text) => (licenseText ?? '').includes(text)),
              failOnUnlicensed: false, // default is false. valid-url package has missing license
              failOnViolation: true, // Fail if a dependency specifies a license that does not match requirements
            },
            output: {
              // Output file into build/webapp directory which is included in the build output
              file: path.join(projectRoot, 'build/webapp', 'vendor.LICENSE.txt'),
              template(dependencies) {
                return dependencies.map((dependency) => generateLicenseText(dependency)).join('\n');
              },
            },
          },
        }),
      ],
    },
    sourcemap: isProduction, // enable source maps for production
  },
  css: {
    postcss: {
      plugins: [autoprefixer, postCssCalc],
    },
  },
  // By default vite doesn't pass along any env variable so we do it here. (for MSW and env code)
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
      WITH_MOCK_API: process.env.WITH_MOCK_API,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  esbuild: {
    banner: '/*! licenses: /vendor.LICENSE.txt */',
    legalComments: 'none',
    // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  plugins: [
    // setup additional vite aliases to resolve dependencies between mono-repo packages
    nxViteTsPaths(),

    // additional plugins to allow for the transformation of our existing code to what vite is expecting.
    requireTransform({}),

    // create a polyfill chunk for browsers we support that are missing modern JS features
    legacy({
      modernTargets: packageJson.browserslist,
      polyfills: false,
      modernPolyfills: true,
      renderLegacyChunks: false,
    }),
    react({
      babel: babelConfig,
    }),
    // we use this to support `twin.macro` (macro is a term for a generic babel plugin used at runtime)
    // More Info: https://www.npmjs.com/package/babel-plugin-macros
    macrosPlugin(),
    analyzeBundle &&
      analyzer({
        fileName: resolve(projectRoot, 'build/bundle-metrics.json'),
        analyzerMode: 'json',
      }),
  ],
  // This is the static folder we have to copy to build/webapp folder after build
  publicDir: 'public',
  resolve: {
    alias: {
      // src resolution is only applicable for html files and is only needed in vite and not
      // in other configs: tsconfig, jest
      src: path.resolve(projectRoot, 'src'),
    },
  },
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok.io'],
    port,
  },
} satisfies UserConfig;
