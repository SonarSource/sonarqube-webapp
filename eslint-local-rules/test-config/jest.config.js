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

const baseConfig = require('../../config/jest/jest.config.base');

module.exports = {
  ...baseConfig.globalConfig,
  ...baseConfig.projectConfig,
  rootDir: '../../', // We need to run it from the workspace root to get coverage from libs
  roots: ['<rootDir>/eslint-local-rules/'],
  coverageDirectory: '<rootDir>/eslint-local-rules/build/reports/coverage',
  collectCoverageFrom: [
    'eslint-local-rules/**/*.{ts,tsx,js}',
    '!eslint-local-rules/test-config/*',
    '!**/node_modules/**',
  ],
  // Our ts,tsx and js files need some babel transformation to be understood by nodejs
  transform: {
    '^.+\\.[jt]sx?$': `<rootDir>/config/jest/JestPreprocess.js`,
  },
};
