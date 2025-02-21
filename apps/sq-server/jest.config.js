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

const { existsSync } = require('fs');

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

const addonsAlias =
  existsSync('private') && process.env['EDITION'] !== 'public'
    ? '<rootDir>/private/libs/addons/src/index.ts'
    : '<rootDir>/libs/addons/src/index.ts';

module.exports = {
  rootDir: '../../', // We need to run it from the workspace root to get coverage from libs
  roots: ['<rootDir>/apps/sq-server'],
  coverageDirectory: '<rootDir>/apps/sq-server/build/reports/coverage',
  collectCoverageFrom: [
    'apps/sq-server/eslint-local-rules/**/*.{ts,tsx,js}',
    'apps/sq-server/src/main/js/**/*.{ts,tsx,js}',
    'libs/**/*.{ts,tsx,js}',
    'private/libs/**/*.{ts,tsx,js}',
    '!helpers/{keycodes,testUtils}.{ts,tsx}',
  ],
  coverageReporters: ['lcov', 'text'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^.+\\.(md|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/apps/sq-server/config/jest/FileStub.js',
    '^.+\\.css$': '<rootDir>/apps/sq-server/config/jest/CSSStub.js',
    '^~design-system': '<rootDir>/libs/cross-domain/sq-server-shared/src/design-system/index.ts',
    '~addons': addonsAlias,
    '~branches': '<rootDir>/private/libs/cross-domain/sq-server-features/branches/src/index.ts',
    '~sca': '<rootDir>/private/libs/cross-domain/sq-server-features/sca/src/index.ts',
    '~sq-server-shared/(.+)': '<rootDir>/libs/cross-domain/sq-server-shared/src/$1',
    // Jest is using the wrong d3 built package: https://github.com/facebook/jest/issues/12036
    '^d3-(.*)$': `<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js`,
  },
  globalSetup: '<rootDir>/apps/sq-server/config/jest/GlobalSetup.js',
  setupFiles: [
    '<rootDir>/apps/sq-server/config/jest/jest.polyfills.js',
    '<rootDir>/apps/sq-server/config/jest/SetupTestEnvironment.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupTheme.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/apps/sq-server/config/jest/SetupReactTestingLibrary.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupJestAxe.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupFailOnConsole.ts',
  ],
  snapshotSerializers: ['@emotion/jest/serializer'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/apps/sq-server/config', 'node_modules', '/scripts/'],
  testRegex: '(/__tests__/.*|\\-test)\\.(ts|tsx|js)$',
  // Our ts,tsx and js files need some babel transformation to be understood by nodejs
  transform: {
    '^.+\\.[jt]sx?$': `<rootDir>/apps/sq-server/config/jest/JestPreprocess.js`,
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'build/test-results/test-jest',
        outputName: 'junit.xml',
        ancestorSeparator: ' > ',
        suiteNameTemplate: '{filename}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
    ['jest-slow-test-reporter', { numTests: 5, warnOnSlowerThan: 10000, color: true }],
  ],
  // Prevent memory usage issues when running all tests locally
  maxWorkers: '50%',
  workerIdleMemoryLimit: '1GB',
  testTimeout: 60000,
};
