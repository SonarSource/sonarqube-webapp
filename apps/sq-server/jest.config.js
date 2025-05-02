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

const isPrivateEdition = existsSync('private') && process.env['EDITION'] !== 'public';

module.exports = {
  ...baseConfig.globalConfig,
  ...baseConfig.projectConfig,
  rootDir: '../../', // We need to run it from the workspace root to get coverage from libs
  roots: [
    '<rootDir>/apps/sq-server',
    '<rootDir>/libs',
    ...(isPrivateEdition ? ['<rootDir>/private/libs'] : []),
  ],
  coverageDirectory: '<rootDir>/apps/sq-server/build/reports/coverage',
  collectCoverageFrom: [
    'apps/sq-server/src/**/*.{ts,tsx,js}',
    'libs/**/*.{ts,tsx,js}',
    'private/libs/**/*.{ts,tsx,js}',
    '!helpers/{keycodes,testUtils}.{ts,tsx}',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    ...baseConfig.projectConfig.moduleNameMapper,
    '~adapters/(.+)': '<rootDir>/libs/sq-server-shared/src/sq-server-adapters/$1',
    '~sq-server-addons': isPrivateEdition
      ? '<rootDir>/private/libs/sq-server-addons/src/index.ts'
      : '<rootDir>/libs/sq-server-addons/src/index.ts',
    '~feature-architecture/(.+)': '<rootDir>/private/libs/feature-architecture/src/$1',
    '~feature-rules/(.+)': '<rootDir>/libs/feature-rules/src/$1',
    '~private-shared/(.+)': '<rootDir>/private/libs/shared/src/$1',
    '~shared/(.+)': '<rootDir>/libs/shared/src/$1',
    '~sq-server-features/(.+)': '<rootDir>/private/libs/sq-server-features/src/$1',
    '~sq-server-shared/(.+)': '<rootDir>/libs/sq-server-shared/src/$1',
    '^~design-system': '<rootDir>/libs/sq-server-shared/src/design-system/index.ts',
    // Jest is using the wrong d3 built package: https://github.com/facebook/jest/issues/12036
    '^d3-(.*)$': `<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js`,
  },
  setupFiles: [
    ...baseConfig.projectConfig.setupFiles,
    '<rootDir>/config/jest/SetupTestEnvironment.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupTheme.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/apps/sq-server/config/jest/SetupReactTestingLibrary.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupJestAxe.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupFailOnConsole.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupJestAxios.ts',
    '<rootDir>/apps/sq-server/config/jest/SetupMockServerWorkers.ts',
  ],
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
