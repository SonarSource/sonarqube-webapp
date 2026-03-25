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

import failOnConsole from 'jest-fail-on-console';

const IGNORED_ERROR_MESSAGES: string[] = [
  // react-intl warning
  '[@formatjs/intl] "defaultRichTextElements" was specified but "message" was not pre-compiled.',

  // react-router upgrade warnings: these are warnings about the next major version
  'React Router Future Flag Warning',

  // clipboard.tsx and a few other Echoes components usage are switching between controlled and uncontrolled components, ideally we want to fix this in the future if possible
  'Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.',
];

failOnConsole({
  silenceMessage: (message) => {
    if (IGNORED_ERROR_MESSAGES.some((ignoredMessage) => message.includes(ignoredMessage))) {
      return true;
    }

    // React 19 deprecation warning from Mantine (used internally by Echoes).
    // This warning does not indicate a runtime crash or broken UI behavior by itself.
    // It is ignored here to keep fail-on-console focused on functional/runtime errors.
    // Remove this ignore once Mantine no longer logs this warning in Echoes usage.
    if (message.includes('Accessing element.ref was removed in React 19.')) {
      return true;
    }

    return false;
  },
});
