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

import { camelCase, kebabCase, snakeCase } from 'lodash';
import { isDefined } from '~shared/helpers/types';
import * as featureFlags from './feature-flags';

type FeatureFlagTestValue = boolean | number | object | string;
type FeatureFlagOverrides = Record<string, FeatureFlagTestValue>;

const currentOverrides = new Map<string, FeatureFlagTestValue>();
const useDefaultFlags = featureFlags.useFlags;
let useFlagsSpy: jest.SpyInstance<ReturnType<typeof featureFlags.useFlags>, []> | undefined;

function assertSupportedFlagValue(
  key: string,
  value: unknown,
): asserts value is FeatureFlagTestValue {
  if (value === null) {
    throw new TypeError(
      `mockFlags() does not accept null for "${key}". Use removeFlags("${key}") to remove a flag.`,
    );
  }

  if (!isDefined(value)) {
    throw new TypeError(
      `mockFlags() does not accept undefined for "${key}". Use removeFlags("${key}") to remove a flag.`,
    );
  }

  if (
    typeof value !== 'boolean' &&
    typeof value !== 'number' &&
    typeof value !== 'string' &&
    typeof value !== 'object'
  ) {
    throw new TypeError(`Unsupported feature-flag test value for "${key}".`);
  }
}

export function initializeFeatureFlagTestUtils() {
  resetFeatureFlagMocks();
}

function useFlagsWithTestOverrides() {
  return {
    ...useDefaultFlags(),
    ...Object.fromEntries(currentOverrides),
  };
}

export function mockFlags(flags: FeatureFlagOverrides) {
  currentOverrides.clear();

  Object.entries(flags).forEach(([key, value]) => {
    assertSupportedFlagValue(key, value);

    [key, kebabCase(key), camelCase(key), snakeCase(key)].forEach((variant) => {
      currentOverrides.set(variant, value);
    });
  });

  useFlagsSpy = jest.spyOn(featureFlags, 'useFlags');
  useFlagsSpy.mockImplementation(useFlagsWithTestOverrides);
}

export function removeFlags(...flagKeys: string[]) {
  flagKeys.forEach((key) => {
    [key, kebabCase(key), camelCase(key), snakeCase(key)].forEach((variant) => {
      currentOverrides.delete(variant);
    });
  });
}

export function resetFeatureFlagMocks() {
  currentOverrides.clear();
  useFlagsSpy?.mockRestore();
  useFlagsSpy = undefined;
}
