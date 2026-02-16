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
import { PropsWithChildren } from 'react';
import { get } from '~shared/helpers/storage';
import AppStateContextProvider from '../../../context/app-state/AppStateContextProvider';
import { mockAppState } from '../../../helpers/testMocks';
import { AppState } from '../../../types/appstate';
import { GlobalSettingKeys } from '../../../types/settings';
import { useFlags } from '../feature-flags';

jest.mock('~shared/helpers/storage', () => ({
  get: jest.fn(),
  save: jest.fn(),
}));

describe('useFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should default to new navigation when no user preference and no force old navigation setting', () => {
    jest.mocked(get).mockReturnValue(null);

    const { result } = setupHook({});

    expect(result.current.frontEndEngineeringEnableSidebarNavigation).toBe(true);
  });

  it('should respect user opt-out preference', () => {
    jest.mocked(get).mockReturnValue('false');

    const { result } = setupHook({});

    expect(result.current.frontEndEngineeringEnableSidebarNavigation).toBe(false);
  });

  it('should respect user opt-in preference', () => {
    jest.mocked(get).mockReturnValue('true');

    const { result } = setupHook({});

    expect(result.current.frontEndEngineeringEnableSidebarNavigation).toBe(true);
  });

  it('should default to old navigation when force old navigation is set and user has no preference', () => {
    jest.mocked(get).mockReturnValue(null);

    const { result } = setupHook({
      settings: {
        [GlobalSettingKeys.ForceOldNavigation]: 'true',
      },
    });

    expect(result.current.frontEndEngineeringEnableSidebarNavigation).toBe(false);
  });

  it('should force old navigation even when user has opted in', () => {
    jest.mocked(get).mockReturnValue('true');

    const { result } = setupHook({
      settings: {
        [GlobalSettingKeys.ForceOldNavigation]: 'true',
      },
    });

    expect(result.current.frontEndEngineeringEnableSidebarNavigation).toBe(false);
  });

  it('should force old navigation even when user has opted out', () => {
    jest.mocked(get).mockReturnValue('false');

    const { result } = setupHook({
      settings: {
        [GlobalSettingKeys.ForceOldNavigation]: 'true',
      },
    });

    expect(result.current.frontEndEngineeringEnableSidebarNavigation).toBe(false);
  });

  it('should use new navigation when force old navigation is not set to true', () => {
    jest.mocked(get).mockReturnValue(null);

    const { result } = setupHook({
      settings: {
        [GlobalSettingKeys.ForceOldNavigation]: 'false',
      },
    });

    expect(result.current.frontEndEngineeringEnableSidebarNavigation).toBe(true);
  });

  it('should include other default flags', () => {
    jest.mocked(get).mockReturnValue(null);

    const { result } = setupHook({});

    expect(result.current.scaEnableOsvMalware).toBe(true);
  });
});

function setupHook(appState: Partial<AppState> = {}) {
  function Wrapper({ children }: Readonly<PropsWithChildren>) {
    return (
      <AppStateContextProvider
        appState={mockAppState({
          settings: {},
          ...appState,
        })}
      >
        {children}
      </AppStateContextProvider>
    );
  }

  return renderHook(() => useFlags(), { wrapper: Wrapper });
}
