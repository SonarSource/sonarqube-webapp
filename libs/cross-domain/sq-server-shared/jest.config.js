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

module.exports = {
  displayName: 'shared',
  moduleNameMapper: {
    '^.+\\.(md|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/../../../config/jest/FileStub.js',
    '^.+\\.css$': '<rootDir>/../../../config/jest/CSSStub.js',
    '~sq-server-shared/(.+)': '<rootDir>/src/$1',
    // Jest is using the wrong d3 built package: https://github.com/facebook/jest/issues/12036
    '^d3-(.*)$': `<rootDir>/../../../node_modules/d3-$1/dist/d3-$1.min.js`,
  },
  globalSetup: '<rootDir>/../../../config/jest/GlobalSetup.js',
  setupFiles: [
    '<rootDir>/../../../config/jest/jest.polyfills.js',
    '<rootDir>/../../../config/jest/SetupTestEnvironment.ts',
    '<rootDir>/config/jest/SetupTheme.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/../../../config/jest/SetupReactTestingLibrary.ts',
    '<rootDir>/../../../config/jest/SetupJestAxe.ts',
    '<rootDir>/../../../config/jest/SetupFailOnConsole.ts',
  ],
  snapshotSerializers: ['@emotion/jest/serializer'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/config', '<rootDir>/node_modules', '<rootDir>/scripts'],
  testRegex: '(/__tests__/.*|\\-test)\\.(ts|tsx|js)$',
  // Our ts,tsx and js files need some babel transformation to be understood by nodejs
  transform: {
    '^.+\\.[jt]sx?$': `<rootDir>/config/jest/JestPreprocess.js`,
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  coverageDirectory: '<rootDir>/build/reports/coverage',
  coverageReporters: ['json', 'lcov'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  // Prevent memory usage issues when running all tests locally
  maxWorkers: '50%',
  workerIdleMemoryLimit: '1GB',
  testTimeout: 60000,
};
