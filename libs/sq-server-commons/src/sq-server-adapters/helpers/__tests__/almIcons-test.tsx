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

import { ThemeProvider } from '@emotion/react';
import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { AlmIconKey } from '~shared/types/onboarding';
import { lightTheme } from '../../../design-system/theme/light';
import { useAlmIconSrc } from '../almIcons';

function Wrapper({ children }: Readonly<PropsWithChildren>) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

it('returns the light icon variant (SQS is light only)', () => {
  const { result } = renderHook(() => useAlmIconSrc('github'), { wrapper: Wrapper });

  expect(result.current).toBe('/images/alm/github.svg');
});

it('returns undefined when no icon key is provided', () => {
  const { result } = renderHook(() => useAlmIconSrc(undefined), { wrapper: Wrapper });

  expect(result.current).toBeUndefined();
});

it('returns undefined for a key missing from the theme images map', () => {
  // The AlmIconKey type prevents unmapped keys at compile time; cast to exercise the
  // defensive runtime guard against a theme that omits an expected key.
  const { result } = renderHook(() => useAlmIconSrc('not-a-real-alm' as AlmIconKey), {
    wrapper: Wrapper,
  });

  expect(result.current).toBeUndefined();
});
