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

const baseConfig = require('../../../config/jest/jest.config.base');

module.exports = {
  ...baseConfig.globalConfig,
  ...baseConfig.projectConfig,
  displayName: 'shared',
  moduleNameMapper: {
    ...baseConfig.projectConfig.moduleNameMapper,
    '~sq-server-shared/(.+)': '<rootDir>/src/$1',
    // Jest is using the wrong d3 built package: https://github.com/facebook/jest/issues/12036
    '^d3-(.*)$': `<rootDir>/../../../node_modules/d3-$1/dist/d3-$1.min.js`,
  },
  setupFiles: [
    ...baseConfig.projectConfig.setupFiles,
    '<rootDir>/../../../config/jest/SetupTestEnvironment.ts',
    '<rootDir>/config/jest/SetupTheme.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/../../../config/jest/SetupReactTestingLibrary.ts',
    '<rootDir>/../../../config/jest/SetupJestAxe.ts',
    '<rootDir>/../../../config/jest/SetupFailOnConsole.ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/config', '<rootDir>/node_modules', '<rootDir>/scripts'],
  testRegex: '(/__tests__/.*|\\-test)\\.(ts|tsx|js)$',
  // Our ts,tsx and js files need some babel transformation to be understood by nodejs
  transform: {
    '^.+\\.[jt]sx?$': `<rootDir>/config/jest/JestPreprocess.js`,
  },
  coverageDirectory: '<rootDir>/build/reports/coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],

  testTimeout: 60000,
};
