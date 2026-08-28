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

import { renderHook } from '@testing-library/react';
import { OnboardingDevopsPlatform, OnboardingDopSetting } from '~shared/types/onboarding';
import { useOnboardingDopSettingsQuery } from '../../queries/onboarding';
import { useOnboardingDevopsConfigurations } from '../useOnboardingDevopsConfigurations';

jest.mock('../../queries/onboarding', () => ({
  useOnboardingDopSettingsQuery: jest.fn(),
}));

function mockDopSettings(data: OnboardingDopSetting[] | null | undefined) {
  jest
    .mocked(useOnboardingDopSettingsQuery)
    .mockReturnValue({ data } as ReturnType<typeof useOnboardingDopSettingsQuery>);
}

function dopSetting(id: string, type: OnboardingDopSetting['type']): OnboardingDopSetting {
  return { id, key: `conf-${id}`, type };
}

it('counts the configurations of each platform', () => {
  mockDopSettings([
    dopSetting('1', OnboardingDevopsPlatform.Github),
    dopSetting('2', OnboardingDevopsPlatform.Github),
    dopSetting('3', OnboardingDevopsPlatform.Gitlab),
  ]);

  const { result } = renderHook(() => useOnboardingDevopsConfigurations());

  expect(result.current).toEqual({
    byPlatform: [
      { count: 2, platform: OnboardingDevopsPlatform.Github },
      { count: 1, platform: OnboardingDevopsPlatform.Gitlab },
    ],
  });
});

it('reports an empty breakdown when nothing is configured', () => {
  mockDopSettings([]);

  const { result } = renderHook(() => useOnboardingDevopsConfigurations());

  // Distinct from `undefined`: this instance *can* hold configurations, it just has none yet.
  expect(result.current).toEqual({ byPlatform: [] });
});

// `undefined` is reserved for products that bind to a single platform, which SQ-Server is not — so
// an unresolved lookup (still pending, or failed: both leave `data` undefined) must report an empty
// split rather than claim to be one of those.
it.each([
  ['unresolved', undefined],
  ['empty', null],
] as const)('reports an empty breakdown, never undefined, when the query is %s', (_, data) => {
  mockDopSettings(data);

  const { result } = renderHook(() => useOnboardingDevopsConfigurations());

  expect(result.current).toEqual({ byPlatform: [] });
});
