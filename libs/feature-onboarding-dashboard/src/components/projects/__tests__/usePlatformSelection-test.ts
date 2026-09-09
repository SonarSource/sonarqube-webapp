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

import { act, renderHook } from '@testing-library/react';
import { useOnboardingDopSettingsQuery } from '~adapters/queries/onboarding';
import { OnboardingDevopsPlatform, OnboardingDopSetting } from '~shared/types/onboarding';
import { usePlatformSelection } from '../usePlatformSelection';

jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingDopSettingsQuery: jest.fn(),
}));

const GITLAB_MAIN: OnboardingDopSetting = {
  id: 'gl-1',
  key: 'GitLab Main',
  type: OnboardingDevopsPlatform.Gitlab,
};

const AZURE_MAIN: OnboardingDopSetting = {
  id: 'az-1',
  key: 'Azure Main',
  type: OnboardingDevopsPlatform.AzureDevops,
};

const GITHUB_MAIN: OnboardingDopSetting = {
  id: 'gh-1',
  key: 'GitHub Main',
  type: OnboardingDevopsPlatform.Github,
};

function mockDopSettingsQuery(data: OnboardingDopSetting[] | null | undefined, isLoading = false) {
  jest
    .mocked(useOnboardingDopSettingsQuery)
    .mockReturnValue({ data, isLoading } as ReturnType<typeof useOnboardingDopSettingsQuery>);
}

it('offers the selector once several platforms can be chosen from', () => {
  mockDopSettingsQuery([GITLAB_MAIN, AZURE_MAIN]);

  const { result } = renderHook(() => usePlatformSelection());

  expect(result.current.showPlatformSelect).toBe(true);
  expect(result.current.platformEntries).toEqual([GITLAB_MAIN, AZURE_MAIN]);
  expect(result.current.effectiveEntry).toEqual(GITLAB_MAIN);
});

it('leaves GitHub out of the selector, as importing from it needs its own organization discovery', () => {
  mockDopSettingsQuery([GITHUB_MAIN, GITLAB_MAIN]);

  const { result } = renderHook(() => usePlatformSelection());

  expect(result.current.platformEntries).toEqual([GITLAB_MAIN]);
  expect(result.current.showPlatformSelect).toBe(false);
});

it('takes the selected platform over the first one', () => {
  mockDopSettingsQuery([GITLAB_MAIN, AZURE_MAIN]);

  const { result } = renderHook(() => usePlatformSelection());
  act(() => {
    result.current.setSelectedDopSettingId(AZURE_MAIN.id);
  });

  expect(result.current.effectiveEntry).toEqual(AZURE_MAIN);
});

it('offers no selector on the products bound to a single platform', () => {
  mockDopSettingsQuery(null);

  const { result } = renderHook(() => usePlatformSelection());

  expect(result.current.showPlatformSelect).toBe(false);
  expect(result.current.effectiveEntry).toBeUndefined();
  expect(result.current.isLoading).toBe(false);
});

it('reports nothing to load when the settings query is gated by permissions', () => {
  mockDopSettingsQuery(undefined);

  const { result } = renderHook(() => usePlatformSelection());

  expect(result.current.isLoading).toBe(false);
  expect(result.current.platformEntries).toEqual([]);
  expect(result.current.showPlatformSelect).toBe(false);
});

it('reports loading while the configurations are being fetched', () => {
  mockDopSettingsQuery(undefined, true);

  const { result } = renderHook(() => usePlatformSelection());

  expect(result.current.isLoading).toBe(true);
});
