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
const baseConfig = require('../../config/jest/jest.config.base');

const addonsAlias =
  existsSync('private') && process.env['EDITION'] !== 'public'
    ? '<rootDir>/private/libs/addons/src/index.ts'
    : '<rootDir>/libs/addons/src/index.ts';

module.exports = {
  ...baseConfig.globalConfig,
  ...baseConfig.projectConfig,
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
  moduleNameMapper: {
    ...baseConfig.projectConfig.moduleNameMapper,
    '^~design-system': '<rootDir>/libs/cross-domain/sq-server-shared/src/design-system/index.ts',
    '~addons': addonsAlias,
    '~branches': '<rootDir>/private/libs/cross-domain/sq-server-features/branches/src/index.ts',
    '~sca': '<rootDir>/private/libs/cross-domain/sq-server-features/sca/src/index.ts',
    '~sq-server-shared/(.+)': '<rootDir>/libs/cross-domain/sq-server-shared/src/$1',
    // Jest is using the wrong d3 built package: https://github.com/facebook/jest/issues/12036
    '^d3-(.*)$': `<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js`,
  },
  setupFiles: [
    ...baseConfig.projectConfig.setupFiles,
    '<rootDir>/apps/sq-server/config/jest/SetupTestEnvironment.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupTheme.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/apps/sq-server/config/jest/SetupReactTestingLibrary.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupJestAxe.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupFailOnConsole.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupMockServerWorkers.ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/apps/sq-server/config', 'node_modules', '/scripts/'],
  testRegex: '(/__tests__/.*|\\-test)\\.(ts|tsx|js)$',
  // Our ts,tsx and js files need some babel transformation to be understood by nodejs
  transform: {
    '^.+\\.[jt]sx?$': `<rootDir>/apps/sq-server/config/jest/JestPreprocess.js`,
  },
  reporters: [
    'default',
    ['jest-slow-test-reporter', { numTests: 5, warnOnSlowerThan: 10000, color: true }],
  ],

  testTimeout: 60000,
};
