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

import fs from 'fs';
import fsp from 'fs/promises';
import scanner from 'react-scanner';
import { componentMap } from './componentMap.js';

const config = {
  rootDir: '.',
  crawlFrom: '.',
  exclude: ['__tests__'],
  globs: ['**/*.tsx'],
  includeSubComponents: true,
  processors: ['count-components'],
};

await run();

async function run() {
  const echoesComponents = await countComponentsFrom(
    'echoes',
    '@sonarsource/echoes-react',
    'Internal',
  );
  const internalComponents = await countComponentsFrom('internal', /^~/);
  const relativeComponents = await countComponentsFrom('relative', /^\.\.?\//);

  await writeOut([...echoesComponents, ...internalComponents, ...relativeComponents]);
}

async function countComponentsFrom(sourceName, source, covered) {
  const output = await scanner.run({ ...config, importedFrom: source });

  const merged = Object.keys(output).reduce(
    (result, key) => {
      // Combine echoes "Icon" components into a single category, exclude ButtonIcon
      if (sourceName === 'echoes' && key.includes('Icon') && key !== 'ButtonIcon') {
        result.Icons = result.Icons + output[key];
      } else {
        result[key] = output[key];
      }

      return result;
    },
    { Icons: 0 },
  );

  return Object.keys(merged).map((key) => ({
    component: key,
    count: merged[key],
    match: covered ?? componentMap[key],
    source: sourceName,
  }));
}

async function writeOut(data) {
  const csvRows = data
    .map(({ component, count, match, source }) => `"${component}","${source}",${count},"${match}"`)
    .join('\n');

  if (!fs.existsSync('.componentscan')) {
    await fsp.mkdir('.componentscan');
  }
  await fsp.writeFile('.componentscan/components.csv', csvRows, 'utf8');
}
