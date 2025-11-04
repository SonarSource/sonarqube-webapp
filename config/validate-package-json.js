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

console.log(`Check dependencies for "${process.argv[2]}"...\n`);

const { dependencies, devDependencies } = require(`../${process.argv[2]}`);

const dependenciesArray = dependencies ? Object.entries(dependencies) : [];
const devDependenciesArray = devDependencies ? Object.entries(devDependencies) : [];

const violatingDependencies = [...dependenciesArray, ...devDependenciesArray].filter(
  ([id, version]) => /^[~><^]/.test(version),
);

if (violatingDependencies.length > 0) {
  console.error(
    `Following dependencies must be locked to an exact version:
${violatingDependencies.map(([id, version]) => ` - "${id}": "${version}"`).join('\n')}
`,
  );
  process.exit(1);
} else {
  console.log('All dependencies are locked to an exact version.');
  process.exit(0);
}
