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
  'd3-drag',
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
  '@xyflow/react',
  '@xyflow/system',
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
    // Files not needed in tests stubs
    '.+\\.(md|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `${__dirname}/FileStub.js`,
    '.+\\.(css|styl|less|sass|scss)$': `${__dirname}/CSSStub.js`,

    // Shared libraries aliases, following token is used in the nx shared-library generator
    // <<shared-libraries-aliases>>
    '^~feature-architecture/(.+)': '<rootDir>/private/libs/feature-architecture/src/$1',
    '^~feature-rules/(.+)': '<rootDir>/libs/feature-rules/src/$1',
    '^~feature-sca/(.+)': '<rootDir>/private/libs/feature-sca/src/$1',
    '^~private-shared/(.+)': '<rootDir>/private/libs/shared/src/$1',
    '^~shared/(.+)': '<rootDir>/libs/shared/src/$1',

    // Jest is using the wrong d3 built package: https://github.com/facebook/jest/issues/12036
    '^d3-(.*)$': `<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js`,
  },

  setupFiles: [],

  snapshotSerializers: ['@emotion/jest/serializer'],
  testEnvironment: `${__dirname}/jsdom-extended.js`,
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],

  // Regex defining what is a test file
  testRegex: '/__tests__/.*-(test|it)\\.[jt]sx?$',

  // Ignored folders which we don't want to execute tests from
  testPathIgnorePatterns: [
    '/config/', // This contains some config files for jest and the build
    '/build/', // This is the build folder
    '/node_modules/', // Well node_modules...
    '/scripts/', // This is the scripts folder
  ],

  // Prevent memory usage issues when running all tests locally
  maxWorkers: '50%',
  workerIdleMemoryLimit: '1GB',
  // jsdom issue https://mswjs.io/docs/migrations/1.x-to-2.x/#cannot-find-module-mswnode-jsdom
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
};

module.exports = {
  globalConfig,
  projectConfig,
};
