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

import { EchoesProviderForTests } from '@sonarsource/echoes-react';
import { act, useState } from 'react';
import { ThemeMode } from '../../types/themes';
import { renderWithContext } from '../test-utils';
import { byRole } from '../testSelector';
import { ThemeController } from '../ThemeController';

jest.mock('~adapters/helpers/useThemeMode');

const { useThemeMode } = jest.requireMock<typeof import('~adapters/helpers/useThemeMode')>(
  '~adapters/helpers/useThemeMode',
);

// setTheme() sets data-echoes-theme on document.documentElement
const THEME_ATTR = 'data-echoes-theme';

// Listeners are registered in order: index 0 = print, index 1 = prefers-color-scheme: dark
type ChangeListener = (event: { matches: boolean }) => void;
const mediaQueryListeners: ChangeListener[] = [];

function makeMediaQueryList(matches: boolean): MediaQueryList {
  return {
    matches,
    addEventListener(_: string, cb: ChangeListener) {
      mediaQueryListeners.push(cb);
    },
    removeEventListener(_: string, cb: ChangeListener) {
      const idx = mediaQueryListeners.indexOf(cb);
      if (idx !== -1) {
        mediaQueryListeners.splice(idx, 1);
      }
    },
  } as unknown as MediaQueryList;
}

window.matchMedia = jest.fn().mockImplementation(() => makeMediaQueryList(false));

beforeEach(() => {
  mediaQueryListeners.length = 0;
  document.documentElement.removeAttribute(THEME_ATTR);
  jest.mocked(window.matchMedia).mockImplementation(() => makeMediaQueryList(false));
});

it('defaults to light theme in system mode when no dark preference', () => {
  renderThemeSwitcher();
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'light');
});

it('applies light theme when user selects Light', async () => {
  const { user } = renderThemeSwitcher();
  await user.click(byRole('button', { name: ThemeMode.Light }).get());
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'light');
});

it('applies dark theme when user selects Dark', async () => {
  const { user } = renderThemeSwitcher();
  await user.click(byRole('button', { name: ThemeMode.Dark }).get());
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'dark');
});

it('applies dark theme in system mode when browser prefers dark', () => {
  // First call = print query (false), second call = prefers-color-scheme: dark (true)
  jest
    .mocked(window.matchMedia)
    .mockImplementationOnce(() => makeMediaQueryList(false))
    .mockImplementationOnce(() => makeMediaQueryList(true));

  renderThemeSwitcher();
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'dark');
});

it('overrides dark selection with light theme in print mode', async () => {
  // First call = print query (true)
  jest.mocked(window.matchMedia).mockImplementationOnce(() => makeMediaQueryList(true));

  const { user } = renderThemeSwitcher();
  await user.click(byRole('button', { name: ThemeMode.Dark }).get());
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'light');
});

it('switches theme dynamically on media query change events', () => {
  renderThemeSwitcher();
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'light');

  // Simulate dark color scheme becoming active (index 1 = prefers-color-scheme: dark listener)
  act(() => {
    mediaQueryListeners[1]({ matches: true });
  });
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'dark');

  // Simulate print mode becoming active (index 0 = print listener) — overrides dark
  act(() => {
    mediaQueryListeners[0]({ matches: true });
  });
  expect(document.documentElement).toHaveAttribute(THEME_ATTR, 'light');
});

function renderThemeSwitcher() {
  return renderWithContext(
    <EchoesProviderForTests>
      <ThemeSwitcherFixture />
    </EchoesProviderForTests>,
  );
}

/**
 * Wraps ThemeController and theme buttons in a single stateful component so that
 * calling setThemeMode triggers a React re-render that ThemeController can observe.
 */
function ThemeSwitcherFixture() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.System);

  jest.mocked(useThemeMode).mockReturnValue([themeMode, setThemeMode]);

  return (
    <>
      <ThemeController />
      <ThemeButton mode={ThemeMode.System} setThemeMode={setThemeMode} />
      <ThemeButton mode={ThemeMode.Light} setThemeMode={setThemeMode} />
      <ThemeButton mode={ThemeMode.Dark} setThemeMode={setThemeMode} />
    </>
  );
}

function ThemeButton(props: { mode: ThemeMode; setThemeMode: (mode: ThemeMode) => void }) {
  const { mode, setThemeMode } = props;
  return (
    <button
      onClick={() => {
        setThemeMode(mode);
      }}
      type="button"
    >
      {mode}
    </button>
  );
}
