/*
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

import type { KnipConfig } from 'knip';
import baseConfig from '../../knip.json';

export default {
  ...baseConfig,
  ignoreExportsUsedInFile: true,
} satisfies KnipConfig;
