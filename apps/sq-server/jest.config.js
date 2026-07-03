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

const baseConfig = require('../../config/jest/jest.config.base');
const jestConfig = require('./jest.config.common');

// Unit and integration tests run as separate Jest projects so the integration project can layer on
// its own setup (React act() flush, default service-mock seeding) without affecting unit tests.
// Options that Jest only honours at the top (global) level live here; per-project options live in
// jest.config.common.js and the ut/it configs.
module.exports = {
  ...baseConfig.globalConfig,
  rootDir: '../../', // We need to run it from the workspace root to get coverage from libs
  projects: [
    '<rootDir>/apps/sq-server/jest.config.ut.js',
    '<rootDir>/apps/sq-server/jest.config.it.js',
  ],
  coverageDirectory: jestConfig.coverageDirectory,
  collectCoverageFrom: jestConfig.collectCoverageFrom,
  maxWorkers: '50%',
  workerIdleMemoryLimit: '1GB',
  testTimeout: 80000,
  // Report the 5 slowest tests
  reporters: [
    'default',
    ['jest-slow-test-reporter', { numTests: 5, warnOnSlowerThan: 10000, color: true }],
  ],
};
