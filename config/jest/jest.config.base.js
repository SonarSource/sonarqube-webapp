/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

const esModules = [
  'd3',
  'd3-array',
  'd3-scale',
  'highlightjs-',
  '@sonarsource/echoes-react',
  // Jupyterlab
  '@jupyterlab/nbformat',
  // React markdown
  'react-markdown',
  'devlop',
  'hast-util-',
  'property-information',
  'space-separated-tokens',
  'comma-separated-tokens',
  'unist-util-',
  'vfile',
  'estree-util-is-identifier-name',
  'html-url-attributes',
  'remark-',
  'mdast-util-',
  'micromark',
  'decode-named-character-reference',
  'character-entities',
  'trim-lines',
  'unified',
  'bail',
  'is-plain-obj',
  'trough',
].join('|');

/*
 * When using jest projects, some config options must be at the global (root) level
 *
 * This is currently badly documented, so the easiest is to run the tests and check warnings
 * (They look like `Validation Warning: Unknown option SuchAndSuch`)
 *
 * If not using jest projects, both configs can be spread into the config
 */
const globalConfig = {
  coverageReporters: ['lcov', 'text'],

  // Better test search in watch mode
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};

const projectConfig = {
  globalSetup: `${__dirname}/GlobalSetup.js`,

  // File extension used by our modules, from most to less used
  moduleFileExtensions: ['tsx', 'ts', 'js', 'json'],

  moduleNameMapper: {
    '.+\\.(md|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `${__dirname}/FileStub.js`,
    '.+\\.(css|styl|less|sass|scss)$': `${__dirname}/CSSStub.js`,
  },

  setupFiles: [`${__dirname}/jest.polyfills.js`],

  snapshotSerializers: ['@emotion/jest/serializer'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],

  // Prevent memory usage issues when running all tests locally
  maxWorkers: '50%',
  workerIdleMemoryLimit: '1GB',
};

module.exports = {
  globalConfig,
  projectConfig,
};
