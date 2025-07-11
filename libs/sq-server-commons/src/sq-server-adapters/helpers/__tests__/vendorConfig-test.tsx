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

import { renderHook, waitFor } from '@testing-library/react';
import { PropsWithChildren, useMemo } from 'react';
import { showLicense } from '../../../api/editions';
import AppStateContextProvider from '../../../context/app-state/AppStateContextProvider';
import { AvailableFeaturesContext } from '../../../context/available-features/AvailableFeaturesContext';
import CurrentUserContextProvider from '../../../context/current-user/CurrentUserContextProvider';
import { mockAppState, mockLoggedInUser } from '../../../helpers/testMocks';
import { AppState } from '../../../types/appstate';
import { EditionKey } from '../../../types/editions';
import { Feature } from '../../../types/features';
import { useBeamerContextData } from '../vendorConfig';

jest.mock('../../../api/editions', () => ({
  showLicense: jest.fn().mockResolvedValue({ loc: 104, maxLoc: 123 }),
}));

describe('useBeamerContextData', () => {
  it('should serialize the expected data', async () => {
    const { result } = setupHook({ canAdmin: true }, [Feature.Announcement]);

    await waitFor(() => {
      expect(result.current).toBe(
        'userPersona:systemAdmin;productVersion:5.2;features:announcement;product:sqs;edition:de;maxLoc:123;usedLoc:104',
      );
    });
  });

  it('should handle minimal data', async () => {
    jest.mocked(showLicense).mockRejectedValueOnce({});
    const { result } = setupHook({ canAdmin: undefined, edition: undefined });

    await waitFor(() => {
      expect(result.current).toBe('userPersona:standardUser;productVersion:5.2;features:none');
    });
  });
});

function setupHook(appState: Partial<AppState> = {}, features: Feature[] = []) {
  function Wrapper({ children }: PropsWithChildren) {
    const featureContext = useMemo(() => [...features], []);

    return (
      <CurrentUserContextProvider currentUser={mockLoggedInUser()}>
        <AvailableFeaturesContext.Provider value={featureContext}>
          <AppStateContextProvider
            appState={mockAppState({
              canAdmin: false,
              version: '5.2',
              edition: EditionKey.developer,
              ...appState,
            })}
          >
            {children}
          </AppStateContextProvider>
        </AvailableFeaturesContext.Provider>
      </CurrentUserContextProvider>
    );
  }

  return renderHook(() => useBeamerContextData(), { wrapper: Wrapper });
}
