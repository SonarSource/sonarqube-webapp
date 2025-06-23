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

module.exports = {
  'convert-class-to-function-component': require('./convert-class-to-function-component'),
  'no-api-imports': require('./no-api-imports'),
  'no-conditional-rendering-of-spinner': require('./no-conditional-rendering-of-spinner'),
  'no-launch-darkly-direct-import-in-shared-code': require('./no-launch-darkly-direct-import-in-shared-code'),
  'no-launch-darkly-identify': require('./no-launch-darkly-identify'),
  'no-implicit-coercion': require('./no-implicit-coercion'),
  'no-jsx-literals': require('./no-jsx-literals'),
  'no-query-client-imports': require('./no-query-client-imports'),
  'no-within': require('./no-within'),
  'use-await-expect-async-matcher': require('./use-await-expect-async-matcher'),
  'use-componentqualifier-enum': require('./use-componentqualifier-enum'),
  'use-jest-mocked': require('./use-jest-mocked'),
  'use-metrickey-enum': require('./use-metrickey-enum'),
  'use-metrictype-enum': require('./use-metrictype-enum'),
  'use-proper-query-name': require('./use-proper-query-name'),
  'use-visibility-enum': require('./use-visibility-enum'),
  'no-explicit-undefined-enabled-in-react-query': require('./no-explicit-undefined-enabled-in-react-query'),
};
