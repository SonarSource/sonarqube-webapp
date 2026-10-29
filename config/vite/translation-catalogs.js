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

const path = require('node:path');

// Source catalogs are eager, independent cache boundaries in both products.
const translationCatalogGroups = [
  {
    name: (id) => `messages-${path.basename(id, path.extname(id))}`,
    test: /[/\\]l10n[/\\](?:messages|default)[/\\][^/\\]+\.(?:json|ts)$/,
  },
  {
    name: 'messages',
    test: /(?:libs[\\/]sq-server-commons[\\/]src[\\/]l10n[\\/]default\.ts|private[\\/]apps[\\/]sq-cloud[\\/]src[\\/]l10n[\\/]messages\.json)$/,
  },
];

module.exports = { translationCatalogGroups };
