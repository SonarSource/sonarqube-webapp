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

// Oxlint overrides cannot set `settings`, so this wrapper gives sq-cloud files their own
// `testing-library/utils-module` setting (~helpers/testUtils) by proxying the rule context.

import testingLibrary from 'eslint-plugin-testing-library';

const SQ_CLOUD_PATH = /[\\/]private[\\/]apps[\\/]sq-cloud[\\/]/;
const SQ_CLOUD_SETTINGS = { 'testing-library/utils-module': '~helpers/testUtils' };

function withSettings(context, extraSettings) {
  const settings = { ...context.settings, ...extraSettings };
  return new Proxy(context, {
    get(target, property) {
      if (property === 'settings') {
        return settings;
      }
      const value = Reflect.get(target, property, target);
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      const isFrozenProperty = descriptor && !descriptor.configurable && !descriptor.writable;
      return typeof value === 'function' && !isFrozenProperty ? value.bind(target) : value;
    },
  });
}

function withSqCloudSettings(rule) {
  return {
    ...rule,
    create(context) {
      return rule.create(
        SQ_CLOUD_PATH.test(context.filename) ? withSettings(context, SQ_CLOUD_SETTINGS) : context,
      );
    },
  };
}

export default {
  rules: Object.fromEntries(
    Object.entries(testingLibrary.rules).map(([name, rule]) => [name, withSqCloudSettings(rule)]),
  ),
};
