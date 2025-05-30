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

import failOnConsole from 'jest-fail-on-console';
const IGNORED_ERROR_MESSAGES: string[] = [
  // react-virtualized & react-draggable use `findDOMNode` which is deprecated
  'findDOMNode is deprecated and will be removed in the next major release',

  // react-intl warning
  '[@formatjs/intl] "defaultRichTextElements" was specified but "message" was not pre-compiled.',

  // react-router upgrade warnings: these are warnings about the next major version
  'React Router Future Flag Warning',

  // clipboard.tsx and a few other Echoes components usage are switching between controlled and uncontrolled components, ideally we want to fix this in the future if possible
  'Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.',
];

failOnConsole({
  silenceMessage: (message) => {
    return IGNORED_ERROR_MESSAGES.some((ignore_message) => message.includes(ignore_message));
  },
});
