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

/* eslint-disable no-console */

/**
 *
 * Run this to generate a `.properties` file with all the translation keys for this
 * version of the product.
 *
 * Usage:
 *     node scripts/generate-translation-keys.js [path/to/file.properties]
 *   or:
 *     yarn generate-translation-keys [path/to/file.properties]
 *
 */

const fs = require('fs');
const path = require('path');

main();

function main() {
  const messages = extractMessages();

  const outFile = process.argv[2];

  if (outFile) {
    console.log(`writing to ${outFile}`);
    writeToFile(messages, outFile);
  } else {
    console.log(`
Run this to generate a '.properties' file with all the translation keys for this version of the product.
 
  Usage:
      node scripts/generate-translation-keys.js [path/to/file.properties]
    or:
      yarn generate-translation-keys [path/to/file.properties]
`);
  }
}

function extractMessages() {
  const file = fs.readFileSync(path.join(__dirname, '../src/main/js/l10n/default.ts'));

  const contents = file.toString();
  const a = contents.indexOf('export const defaultMessages = ');
  const b = contents.lastIndexOf(';');

  const mainPart = contents.slice(a + 31, b);

  return eval(`(${mainPart})`);
}

function writeToFile(messages, outFile) {
  if (fs.existsSync(outFile)) {
    fs.rmSync(outFile);
  }

  let stream;
  try {
    fs.writeFileSync(outFile, '', {});

    stream = fs.createWriteStream(outFile, { flags: 'a' });

    Object.keys(messages).forEach((key) => {
      stream.write(`${key}=${messages[key]}\n`);
    });

    stream.close();
  } catch (e) {
    console.error(`Failed to write data to '${outFile}'`);
    stream.close();
    throw e;
  }
}
