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

const measuresMessages = require('~sq-server-commons/l10n/default/measures.json');

it('keeps the section question and widget warning in one properties entry', () => {
  const message = measuresMessages['dashboard.delete_section_confirm'];

  expect(generateProperties({ 'dashboard.delete_section_confirm': message })).toBe(
    String.raw`dashboard.delete_section_confirm=Are you sure you want to delete the section, “{name}”?\n\nThis will permanently remove the section and all its widgets.` +
      '\n',
  );
});

it.each([
  [String.raw`C:\new\folder`, String.raw`C:\\new\\folder`],
  ['first\r\nsecond', String.raw`first\r\nsecond`],
  ['first\rsecond', String.raw`first\rsecond`],
  ['first\tsecond', String.raw`first\tsecond`],
  ['ordinary text', 'ordinary text'],
])('preserves the properties value %s', (value, expected) => {
  expect(generateProperties({ message: value })).toBe(`message=${expected}\n`);
});

function generateProperties(messages) {
  let output = '';
  const stream = {
    write: (value) => {
      output += value;
    },
    close: jest.fn(),
  };
  const originalArgv = process.argv;
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  const catalogPath = require.resolve('~sq-server-commons/l10n/default.ts');

  jest.doMock('fs', () => ({
    existsSync: () => false,
    writeFileSync: jest.fn(),
    createWriteStream: () => stream,
  }));
  jest.doMock(catalogPath, () => ({ defaultMessages: messages }));
  try {
    process.argv = ['node', 'generate-translation-keys.js', 'translations.properties'];
    jest.isolateModules(() => {
      require('../../scripts/generate-translation-keys');
    });
  } finally {
    process.argv = originalArgv;
    jest.dontMock('fs');
    jest.dontMock(catalogPath);
    log.mockRestore();
  }
  return output;
}
